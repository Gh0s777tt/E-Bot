// Leveling / XP — Faza 4 (strona bota).
// Config czytamy z lokalnych settings (klucz 'leveling_config', synchronizowane z panelu przez
// settings-sync). Dane piszemy do tabeli Supabase 'user_levels'. Panel czyta ranking z tej tabeli.

import { type Client, Events, type GuildMember, type Message } from 'discord.js';
import { xpMultiplier } from './economy/effects.mts';
import {
  ecoConfig,
  fmt,
  getUser as getEcoUser,
  saveUser as saveEcoUser,
} from './economy/store.mts';
import { logTx } from './economy/txlog.mts';
import { resolveGuildLocale, t } from './i18n/index.mts';
import { tierAtLevel } from './lib/achievements.mts';
import {
  cloudGetSetting,
  cloudSelect,
  cloudSetSetting,
  cloudUpsert,
  hasCloud,
} from './lib/cloud.mts';
import { getGuildSettings } from './lib/db.mts';
import { log } from './lib/log.mts';

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
  difficulty: 'easy' | 'normal' | 'hard'; // preset tempa XP (łatwa ×1.5 / normalna ×1 / trudna ×0.6)
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
  difficulty: 'normal',
};

// Preset tempa zdobywania XP (mnożnik na wierzchu pozostałych): łatwa = szybciej, trudna = wolniej.
const DIFFICULTY_MULT: Record<'easy' | 'normal' | 'hard', number> = {
  easy: 1.5,
  normal: 1,
  hard: 0.6,
};

// ── Config PER-SERWER (Etap K): cache z TTL 30 s per guild — nie otwiera SQLite na każdą wiadomość,
// a każdy serwer ma własny config (override g:<id>:leveling_config z fallbackiem do globalnego). ──
const cfgCache = new Map<string, { cfg: LevelingConfig; at: number }>();
function cfgFor(guildId: string): LevelingConfig {
  const hit = cfgCache.get(guildId);
  if (hit && Date.now() - hit.at < 30_000) return hit.cfg;
  const raw = getGuildSettings(guildId)['leveling_config'];
  let cfg: LevelingConfig;
  try {
    cfg = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<LevelingConfig>) } : { ...DEFAULT };
  } catch {
    cfg = { ...DEFAULT };
  }
  cfgCache.set(guildId, { cfg, at: Date.now() });
  return cfg;
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

// Jedyne źródło prawdy dla rozbicia poziomu (level + XP w bieżącym poziomie + ile do następnego).
// /rank, /profile i giveaway korzystają z tej funkcji zamiast lokalnych kopii (anty-rozjazd formuły).
export function levelInfo(xp: number): { level: number; xpInto: number; xpFor: number } {
  let lvl = 0;
  let acc = 0;
  while (lvl < 1000 && acc + xpToNext(lvl) <= xp) {
    acc += xpToNext(lvl);
    lvl++;
  }
  return { level: lvl, xpInto: xp - acc, xpFor: xpToNext(lvl) };
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
  const cfg = cfgFor(member.guild.id);
  let mult = 1;
  for (const m of cfg.multipliers) {
    if (m.roleId && member.roles.cache.has(m.roleId)) mult = Math.max(mult, m.factor || 1);
  }
  if (isWeekend() && cfg.weekendBonus > 1) mult *= cfg.weekendBonus;
  mult *= xpMultiplier(member.guild.id, member.id); // Tor B — item XP-boost
  mult *= eventMult(); // Double-XP event (globalny, czasowy)
  mult *= DIFFICULTY_MULT[cfg.difficulty] ?? 1; // preset trudności (krzywa XP)
  return Math.max(0, Math.round(base * mult));
}
function noXpMember(member: GuildMember): boolean {
  return cfgFor(member.guild.id).noXpRoles.some((r) => r && member.roles.cache.has(r));
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
    log.warn('[leveling]', { err: e });
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
  const cfg = cfgFor(guildId);

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

  // Most eko↔leveling: nagroda pieniężna za awans (panel ekonomii: levelUpMoney).
  let moneyLine = '';
  const eco = ecoConfig(guildId);
  if (eco.enabled && eco.levelUpMoney > 0) {
    try {
      const u = await getEcoUser(guildId, userId);
      await saveEcoUser({
        guild_id: guildId,
        user_id: userId,
        username: u.username,
        wallet: u.wallet + eco.levelUpMoney,
      });
      logTx(guildId, userId, eco.levelUpMoney, 'level-up');
      moneyLine = t(resolveGuildLocale(), 'eco.levelReward', {
        user: `<@${userId}>`,
        amount: fmt(eco.levelUpMoney, eco.currency),
        level: String(level),
      });
    } catch (e) {
      log.warn('[leveling] level-up money:', { err: e });
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
      if (moneyLine) await ch.send(moneyLine).catch(() => {});
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
  void loadXpEvent();

  // XP za wiadomości (nie potrzebujemy treści → wystarczy intent GuildMessages)
  client.on(Events.MessageCreate, (msg: Message) => {
    if (msg.author.bot || !msg.guild) return;
    const cfg = cfgFor(msg.guild.id);
    if (!cfg.enabled) return;
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
    for (const guild of client.guilds.cache.values()) {
      const cfg = cfgFor(guild.id);
      if (!cfg.enabled || cfg.xpPerVoiceMin <= 0) continue;
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

  log.info('[leveling] aktywny (XP za czat/voice; config z panelu, dane → Supabase user_levels).');
}
