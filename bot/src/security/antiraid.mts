// Faza 7 / F6.3 — anti-raid: detektor fali wejść (N w oknie M s) → akcja na falę + alert.
// Opcjonalnie: bramka minimalnego wieku konta (młodsze konta = akcja). Config 'antiraid_config'.
import { type Client, Events, type Guild, type GuildMember, type TextChannel } from 'discord.js';
import { applyLockdown } from '../commands/lockdown.mts';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings, guildKey, setGuildSetting } from '../lib/db.mts';

type Action = 'kick' | 'ban' | 'timeout';
type AntiRaidConfig = {
  enabled: boolean;
  joinCount: number;
  windowSec: number;
  action: Action;
  alertChannelId: string;
  minAccountAgeDays: number;
  // Alt-detection (miękki scoring → alert, opcjonalnie kara).
  altDetect: boolean;
  altMinAgeDays: number;
  altNoAvatar: boolean;
  altAction: 'alert' | Action;
  autoLockdown: boolean; // przy wykryciu fali → automatyczna blokada serwera (/lockdown)
};

const DEFAULT: AntiRaidConfig = {
  enabled: false,
  joinCount: 8,
  windowSec: 10,
  action: 'kick',
  alertChannelId: '',
  minAccountAgeDays: 0,
  altDetect: false,
  altMinAgeDays: 7,
  altNoAvatar: true,
  altAction: 'alert',
  autoLockdown: false,
};

// Etap K — config per-serwer z cache TTL 30 s (handler reaguje na każde wejście).
const cfgCache = new Map<string, { cfg: AntiRaidConfig; at: number }>();
function cfgFor(guildId: string): AntiRaidConfig {
  const hit = cfgCache.get(guildId);
  if (hit && Date.now() - hit.at < 30_000) return hit.cfg;
  const raw = getGuildSettings(guildId)['antiraid_config'];
  let cfg: AntiRaidConfig;
  try {
    cfg = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<AntiRaidConfig>) } : { ...DEFAULT };
  } catch {
    cfg = { ...DEFAULT };
  }
  cfgCache.set(guildId, { cfg, at: Date.now() });
  return cfg;
}

// Ręczny tryb raid (/raidmode) — kick każdego nowego wejścia do odwołania. PER-SERWER: stan trwały
// w settings danego serwera (g:<id>:raidmode). Czytany świeżo przy wejściu (łapie też zmianę z
// panelu); niezależny od cfg.enabled.
export function setRaidmode(guildId: string, on: boolean): void {
  setGuildSetting(guildId, 'raidmode', on ? '1' : '');
}
function raidModeOn(guildId: string): boolean {
  return getGuildSettings(guildId).raidmode === '1';
}

// Stan detekcji fali — PER-SERWER (inaczej wejścia z różnych serwerów wpadałyby do jednego okna,
// a tryb obronny jednego serwera karałby wejścia na innym).
const recentByGuild = new Map<string, { m: GuildMember; at: number }[]>();
const raidUntilByGuild = new Map<string, number>();
const lastManualAlertByGuild = new Map<string, number>(); // throttle alertów raidmode (1/min)

// ── Log zdarzeń do chmury (PER-SERWER 'g:<id>:antiraid_state') → panel pokazuje alarm + historię ──
type RaidEvent = { ts: number; type: 'raid' | 'alt' | 'young'; detail: string; count: number };
const eventsByGuild = new Map<string, RaidEvent[]>();
const lastRaidAtByGuild = new Map<string, number>();
const evLoaded = new Set<string>();

async function loadEvents(guildId: string): Promise<void> {
  if (evLoaded.has(guildId)) return;
  evLoaded.add(guildId);
  if (!hasCloud()) return;
  try {
    const raw = await cloudGetSetting(guildKey(guildId, 'antiraid_state'));
    if (raw) {
      const d = JSON.parse(raw) as { events?: RaidEvent[]; lastRaidAt?: number };
      eventsByGuild.set(guildId, d.events ?? []);
      lastRaidAtByGuild.set(guildId, d.lastRaidAt ?? 0);
    }
  } catch {
    /* brak / błąd → puste */
  }
}

async function record(
  guildId: string,
  type: RaidEvent['type'],
  detail: string,
  count = 1,
): Promise<void> {
  if (!hasCloud()) return;
  await loadEvents(guildId);
  const events = eventsByGuild.get(guildId) ?? [];
  events.unshift({ ts: Date.now(), type, detail, count });
  const trimmed = events.slice(0, 30);
  eventsByGuild.set(guildId, trimmed);
  if (type === 'raid') lastRaidAtByGuild.set(guildId, Date.now());
  try {
    await cloudSetSetting(
      guildKey(guildId, 'antiraid_state'),
      JSON.stringify({ events: trimmed, lastRaidAt: lastRaidAtByGuild.get(guildId) ?? 0 }),
    );
  } catch {
    /* trudno — kolejne zdarzenie spróbuje ponownie */
  }
}

async function punishWith(member: GuildMember, action: Action, reason: string): Promise<void> {
  try {
    if (action === 'ban') await member.guild.bans.create(member.id, { reason });
    else if (action === 'kick') await member.kick(reason);
    else await member.timeout(10 * 60_000, reason);
  } catch {
    /* brak uprawnień / już wyszedł — ignoruj */
  }
}
async function alert(guild: Guild, channelId: string, text: string): Promise<void> {
  if (!channelId) return;
  const ch = await guild.channels.fetch(channelId).catch(() => null);
  if (ch?.isTextBased() && 'send' in ch) await (ch as TextChannel).send(text).catch(() => {});
}

export function startAntiRaid(client: Client): void {
  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    const gid = member.guild.id;

    // Ręczny tryb raid — kick natychmiast, zanim cokolwiek innego (działa też przy cfg.enabled=false).
    if (raidModeOn(gid)) {
      await punishWith(member, 'kick', 'Raidmode: ręczna blokada nowych wejść');
      const now0 = Date.now();
      if (now0 - (lastManualAlertByGuild.get(gid) ?? 0) > 60_000) {
        lastManualAlertByGuild.set(gid, now0);
        await alert(
          member.guild,
          cfgFor(gid).alertChannelId,
          '🛡️ **Raidmode aktywny** — wyrzucam nowe wejścia. Wyłącz: `/raidmode stan:off`.',
        );
      }
      return;
    }

    const cfg = cfgFor(gid);
    if (!cfg.enabled) return;
    const now = Date.now();

    // Bramka wieku konta (niezależna od fali).
    if (cfg.minAccountAgeDays > 0) {
      const ageDays = (now - member.user.createdTimestamp) / 86_400_000;
      if (ageDays < cfg.minAccountAgeDays) {
        await punishWith(
          member,
          cfg.action,
          `Anti-raid: konto młodsze niż ${cfg.minAccountAgeDays} dni`,
        );
        await alert(
          member.guild,
          cfg.alertChannelId,
          `🛡️ **Anti-raid:** <@${member.id}> — konto < ${cfg.minAccountAgeDays}d → ${cfg.action}.`,
        );
        void record(
          gid,
          'young',
          `${member.user.tag} — konto < ${cfg.minAccountAgeDays}d → ${cfg.action}`,
        );
        return;
      }
    }

    // Alt-detection — miękki scoring podejrzanych kont → alert (opcjonalnie kara).
    if (cfg.altDetect) {
      const reasons: string[] = [];
      const ageDays = (now - member.user.createdTimestamp) / 86_400_000;
      if (cfg.altMinAgeDays > 0 && ageDays < cfg.altMinAgeDays)
        reasons.push(`konto ${Math.floor(ageDays)}d (< ${cfg.altMinAgeDays}d)`);
      if (cfg.altNoAvatar && !member.user.avatar) reasons.push('brak avatara');
      if (reasons.length) {
        await alert(
          member.guild,
          cfg.alertChannelId,
          `🕵️ **Możliwy alt:** <@${member.id}> (\`${member.user.tag}\`) — ${reasons.join(', ')}.${
            cfg.altAction !== 'alert' ? ` → ${cfg.altAction}` : ''
          }`,
        );
        if (cfg.altAction !== 'alert')
          await punishWith(member, cfg.altAction, `Alt-detection: ${reasons.join(', ')}`);
        void record(gid, 'alt', `${member.user.tag} — ${reasons.join(', ')}`);
      }
    }

    // Okno przesuwne wejść — per-serwer.
    const recent = recentByGuild.get(gid) ?? [];
    recent.push({ m: member, at: now });
    const cut = now - cfg.windowSec * 1000;
    while (recent.length && recent[0].at < cut) recent.shift();
    recentByGuild.set(gid, recent);

    // Już w trybie obronnym — karz każde kolejne wejście.
    if (now < (raidUntilByGuild.get(gid) ?? 0)) {
      await punishWith(member, cfg.action, 'Anti-raid (fala wejść)');
      return;
    }

    // Próg przekroczony — start trybu obronnego + kara dla całej fali.
    if (cfg.joinCount > 0 && recent.length >= cfg.joinCount) {
      const count = recent.length;
      const until = now + Math.max(cfg.windowSec, 30) * 1000;
      raidUntilByGuild.set(gid, until);
      await alert(
        member.guild,
        cfg.alertChannelId,
        `🚨 **Anti-raid:** ${count} wejść w ${cfg.windowSec}s — tryb obronny (${cfg.action}) na ~${Math.round((until - now) / 1000)}s.`,
      );
      void record(gid, 'raid', `${count} wejść w ${cfg.windowSec}s → ${cfg.action}`, count);
      if (cfg.autoLockdown) {
        const locked = await applyLockdown(member.guild, true, 'Auto anti-raid: fala wejść');
        await alert(
          member.guild,
          cfg.alertChannelId,
          `🔒 **Auto-lockdown:** zablokowano ${locked} kanałów. Zdejmij ręcznie: \`/lockdown off\``,
        );
      }
      const wave = [...recent];
      recentByGuild.set(gid, []);
      for (const r of wave) await punishWith(r.m, cfg.action, 'Anti-raid (fala wejść)');
    }
  });

  console.log('[antiraid] anti-raid aktywny (config per-serwer z panelu).');
}
