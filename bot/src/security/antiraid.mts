// Faza 7 / F6.3 — anti-raid: detektor fali wejść (N w oknie M s) → akcja na falę + alert.
// Opcjonalnie: bramka minimalnego wieku konta (młodsze konta = akcja). Config 'antiraid_config'.
import { type Client, Events, type Guild, type GuildMember, type TextChannel } from 'discord.js';
import { getSettings } from '../lib/db.mts';

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
};

let cfg: AntiRaidConfig = { ...DEFAULT };

function refresh(): void {
  const raw = getSettings()['antiraid_config'];
  try {
    cfg = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<AntiRaidConfig>) } : { ...DEFAULT };
  } catch {
    /* zostaw poprzedni */
  }
}

const recent: { m: GuildMember; at: number }[] = [];
let raidUntil = 0;

async function punishWith(member: GuildMember, action: Action, reason: string): Promise<void> {
  try {
    if (action === 'ban') await member.guild.bans.create(member.id, { reason });
    else if (action === 'kick') await member.kick(reason);
    else await member.timeout(10 * 60_000, reason);
  } catch {
    /* brak uprawnień / już wyszedł — ignoruj */
  }
}
async function punish(member: GuildMember, reason: string): Promise<void> {
  await punishWith(member, cfg.action, reason);
}

async function alert(guild: Guild, text: string): Promise<void> {
  if (!cfg.alertChannelId) return;
  const ch = await guild.channels.fetch(cfg.alertChannelId).catch(() => null);
  if (ch?.isTextBased() && 'send' in ch) await (ch as TextChannel).send(text).catch(() => {});
}

export function startAntiRaid(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);

  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    if (!cfg.enabled) return;
    const now = Date.now();

    // Bramka wieku konta (niezależna od fali).
    if (cfg.minAccountAgeDays > 0) {
      const ageDays = (now - member.user.createdTimestamp) / 86_400_000;
      if (ageDays < cfg.minAccountAgeDays) {
        await punish(member, `Anti-raid: konto młodsze niż ${cfg.minAccountAgeDays} dni`);
        await alert(
          member.guild,
          `🛡️ **Anti-raid:** <@${member.id}> — konto < ${cfg.minAccountAgeDays}d → ${cfg.action}.`,
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
          `🕵️ **Możliwy alt:** <@${member.id}> (\`${member.user.tag}\`) — ${reasons.join(', ')}.${
            cfg.altAction !== 'alert' ? ` → ${cfg.altAction}` : ''
          }`,
        );
        if (cfg.altAction !== 'alert')
          await punishWith(member, cfg.altAction, `Alt-detection: ${reasons.join(', ')}`);
      }
    }

    // Okno przesuwne wejść.
    recent.push({ m: member, at: now });
    const cut = now - cfg.windowSec * 1000;
    while (recent.length && recent[0].at < cut) recent.shift();

    // Już w trybie obronnym — karz każde kolejne wejście.
    if (now < raidUntil) {
      await punish(member, 'Anti-raid (fala wejść)');
      return;
    }

    // Próg przekroczony — start trybu obronnego + kara dla całej fali.
    if (cfg.joinCount > 0 && recent.length >= cfg.joinCount) {
      const count = recent.length;
      raidUntil = now + Math.max(cfg.windowSec, 30) * 1000;
      await alert(
        member.guild,
        `🚨 **Anti-raid:** ${count} wejść w ${cfg.windowSec}s — tryb obronny (${cfg.action}) na ~${Math.round((raidUntil - now) / 1000)}s.`,
      );
      const wave = [...recent];
      recent.length = 0;
      for (const r of wave) await punish(r.m, 'Anti-raid (fala wejść)');
    }
  });

  console.log('[antiraid] anti-raid aktywny (config z panelu).');
}
