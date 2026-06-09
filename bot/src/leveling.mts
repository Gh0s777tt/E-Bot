// Leveling / XP — Faza 4 (strona bota).
// Config czytamy z lokalnych settings (klucz 'leveling_config', synchronizowane z panelu przez
// settings-sync). Dane piszemy do tabeli Supabase 'user_levels'. Panel czyta ranking z tej tabeli.
import { type Client, Events, type GuildMember, type Message } from 'discord.js';
import { xpMultiplier } from './economy/effects.mts';
import { resolveGuildLocale, t } from './i18n/index.mts';
import { tierAtLevel } from './lib/achievements.mts';
import {
  cloudGetSetting,
  cloudSelect,
  cloudSetSetting,
  cloudUpsert,
  hasCloud,
} from './lib/cloud.mts';
import { getSettings } from './lib/db.mts';

type Reward = { level: number; roleId: string };
type Multiplier = { roleId: string; factor: number };
type LevelingConfig = {
  enabled: boolean;
  xpPerMessage: number;
  xpPerVoiceMin: number;
  cooldownSec: number;
  announceChannelId: string;
  rewards: Reward[];
  // Faza 7 / F4:
  weekendBonus: number; // mnożnik w sob/niedz (1 = wyłączony)
  multipliers: Multiplier[]; // mnożnik XP za rolę (brany najwyższy)
  noXpChannels: string[];
  noXpRoles: string[];
  voiceAntiAfk: boolean; // wymagaj ≥2 osób + brak mute/deaf
  stackRewards: boolean; // nadawaj wszystkie role ≤ poziom (zamiast tylko najwyższej)
  levelUpMessage: string; // własny tekst awansu ({user}, {level}); pusty = domyślny
  levelUpDm: boolean; // wyślij też DM do użytkownika przy awansie
  achievementsEnabled: boolean; // ogłaszaj odznaki-tiery przy awansie (na kanale level-up)
  prestigeEnabled: boolean;
  prestigeLevel: number; // poziom wymagany do prestiżu
  prestigeRoleId: string; // rola za prestiż
};

const DEFAULT: LevelingConfig = {
  enabled: false,
  xpPerMessage: 15,
  xpPerVoiceMin: 10,
  cooldownSec: 60,
  announceChannelId: '',
  rewards: [],
  weekendBonus: 1,
  multipliers: [],
  noXpChannels: [],
  noXpRoles: [],
  voiceAntiAfk: true,
  stackRewards: false,
  levelUpMessage: '',
  levelUpDm: false,
  achievementsEnabled: false,
  prestigeEnabled: false,
  prestigeLevel: 100,
  prestigeRoleId: '',
};

// ── Config (cache odświeżany z lokalnej bazy co 30 s, żeby nie otwierać SQLite na każdą wiadomość) ──
let cfg: LevelingConfig = { ...DEFAULT };
function refreshConfig(): void {
  const raw = getSettings()['leveling_config'];
  if (!raw) {
    cfg = { ...DEFAULT };
    return;
  }
  try {
    cfg = { ...DEFAULT, ...(JSON.parse(raw) as Partial<LevelingConfig>) };
  } catch {
    cfg = { ...DEFAULT };
  }
}

// ── Formuła poziomów: do awansu z L na L+1 trzeba 5L² + 50L + 100 XP ──
function xpToNext(level: number): number {
  return 5 * level * level + 50 * level + 100;
}
export function levelForXp(xp: number): number {
  let lvl = 0;
  let acc = 0;
  while (lvl < 1000 && acc + xpToNext(lvl) <= xp) {
    acc += xpToNext(lvl);
    lvl++;
  }
  return lvl;
}

// ── Double-XP event (czasowy mnożnik globalny) — stan w pamięci + cloud key 'xp_event' ──
let xpEvent = { mult: 1, until: 0 };
export function getXpEvent(): { mult: number; until: number } {
  return xpEvent;
}
export async function setXpEvent(mult: number, minutes: number): Promise<void> {
  xpEvent =
    minutes > 0 && mult > 1
      ? { mult, until: Date.now() + minutes * 60_000 }
      : { mult: 1, until: 0 };
  if (hasCloud()) {
    try {
      await cloudSetSetting('xp_event', JSON.stringify(xpEvent));
    } catch {
      /* trudno */
    }
  }
}
async function loadXpEvent(): Promise<void> {
  if (!hasCloud()) return;
  try {
    const raw = await cloudGetSetting('xp_event');
    if (raw) xpEvent = JSON.parse(raw) as { mult: number; until: number };
  } catch {
    /* brak */
  }
}
function eventMult(): number {
  return xpEvent.until > Date.now() && xpEvent.mult > 1 ? xpEvent.mult : 1;
}

// ── Faza 7 / F4 — mnożniki, wykluczenia ──
function isWeekend(): boolean {
  const d = new Date().getUTCDay();
  return d === 0 || d === 6;
}
function effectiveXp(member: GuildMember, base: number): number {
  let mult = 1;
  for (const m of cfg.multipliers) {
    if (m.roleId && member.roles.cache.has(m.roleId)) mult = Math.max(mult, m.factor || 1);
  }
  if (isWeekend() && cfg.weekendBonus > 1) mult *= cfg.weekendBonus;
  mult *= xpMultiplier(member.guild.id, member.id); // Tor B — item XP-boost
  mult *= eventMult(); // Double-XP event (globalny, czasowy)
  return Math.max(0, Math.round(base * mult));
}
function noXpMember(member: GuildMember): boolean {
  return cfg.noXpRoles.some((r) => r && member.roles.cache.has(r));
}

const cooldowns = new Map<string, number>();

async function award(
  client: Client,
  guildId: string,
  userId: string,
  username: string,
  amount: number,
): Promise<void> {
  if (!hasCloud() || amount <= 0) return;
  try {
    const rows = await cloudSelect<{ xp: number; level: number }>(
      'user_levels',
      `select=xp,level&guild_id=eq.${guildId}&user_id=eq.${encodeURIComponent(userId)}`,
    );
    const curXp = rows[0]?.xp ?? 0;
    const curLevel = rows[0]?.level ?? 0;
    const newXp = curXp + amount;
    const newLevel = levelForXp(newXp);

    await cloudUpsert(
      'user_levels',
      [
        {
          guild_id: guildId,
          user_id: userId,
          username,
          xp: newXp,
          level: newLevel,
          last_grant: nowIso(),
        },
      ],
      'guild_id,user_id',
    );

    if (newLevel > curLevel) await onLevelUp(client, guildId, userId, newLevel);
  } catch (e) {
    console.warn('[leveling]', (e as Error).message);
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

async function onLevelUp(
  client: Client,
  guildId: string,
  userId: string,
  level: number,
): Promise<void> {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;

  // role-nagrody: stack (wszystkie ≤ poziom) lub tylko najwyższa
  const eligible = cfg.rewards.filter((r) => r.level <= level && r.roleId);
  if (eligible.length) {
    const member = await guild.members.fetch(userId).catch(() => null);
    if (member) {
      const sorted = [...eligible].sort((a, b) => b.level - a.level);
      const toAdd = cfg.stackRewards ? sorted : [sorted[0]];
      for (const r of toAdd) await member.roles.add(r.roleId).catch(() => {});
    }
  }

  if (cfg.announceChannelId) {
    const ch = await guild.channels.fetch(cfg.announceChannelId).catch(() => null);
    if (ch?.isTextBased() && 'send' in ch) {
      const text = cfg.levelUpMessage?.trim()
        ? cfg.levelUpMessage
            .replaceAll('{user}', `<@${userId}>`)
            .replaceAll('{level}', String(level))
        : `🏆 <@${userId}> awansował na **poziom ${level}**!`;
      await ch.send(text).catch(() => {});
      // Osiągnięcia-tiery — odznaka, gdy poziom trafia dokładnie w próg (config z panelu levelingu).
      const tier = cfg.achievementsEnabled ? tierAtLevel(level) : undefined;
      if (tier) {
        const loc = resolveGuildLocale();
        const badge = `${tier.emoji} ${t(loc, `achv.tier.${tier.key}`)}`;
        await ch
          .send(
            t(loc, 'achv.announce', { user: `<@${userId}>`, tier: badge, level: String(level) }),
          )
          .catch(() => {});
      }
    }
  }

  if (cfg.levelUpDm) {
    const u = await client.users.fetch(userId).catch(() => null);
    if (u) await u.send(`🏆 Awansowałeś na **poziom ${level}** na ${guild.name}!`).catch(() => {});
  }
}

export function startLeveling(client: Client): void {
  refreshConfig();
  setInterval(refreshConfig, 30_000);
  void loadXpEvent();

  // XP za wiadomości (nie potrzebujemy treści → wystarczy intent GuildMessages)
  client.on(Events.MessageCreate, (msg: Message) => {
    if (!cfg.enabled || msg.author.bot || !msg.guild) return;
    if (cfg.noXpChannels.includes(msg.channelId)) return;
    const member = msg.member;
    if (member && noXpMember(member)) return;
    const now = Date.now();
    const last = cooldowns.get(msg.author.id) ?? 0;
    if (now - last < cfg.cooldownSec * 1000) return;
    cooldowns.set(msg.author.id, now);
    const amount = member ? effectiveXp(member, cfg.xpPerMessage) : cfg.xpPerMessage;
    void award(client, msg.guild.id, msg.author.id, msg.author.username, amount);
  });

  // XP za voice — co 60 s dla każdego w kanale głosowym
  setInterval(() => {
    if (!cfg.enabled || cfg.xpPerVoiceMin <= 0) return;
    for (const guild of client.guilds.cache.values()) {
      for (const channel of guild.channels.cache.values()) {
        if (!channel.isVoiceBased() || channel.id === guild.afkChannelId) continue;
        if (cfg.noXpChannels.includes(channel.id)) continue;
        const humans = [...channel.members.values()].filter((m) => !m.user.bot);
        for (const member of humans) {
          if (noXpMember(member)) continue;
          if (cfg.voiceAntiAfk) {
            const v = member.voice;
            if (humans.length < 2 || v.selfMute || v.selfDeaf || v.serverDeaf) continue;
          }
          void award(
            client,
            guild.id,
            member.id,
            member.user.username,
            effectiveXp(member, cfg.xpPerVoiceMin),
          );
        }
      }
    }
  }, 60_000);

  console.log(
    '[leveling] aktywny (XP za czat/voice; config z panelu, dane → Supabase user_levels).',
  );
}
