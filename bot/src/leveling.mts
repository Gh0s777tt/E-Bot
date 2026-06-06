// Leveling / XP — Faza 4 (strona bota).
// Config czytamy z lokalnych settings (klucz 'leveling_config', synchronizowane z panelu przez
// settings-sync). Dane piszemy do tabeli Supabase 'user_levels'. Panel czyta ranking z tej tabeli.
import { type Client, Events, type Message, type VoiceState } from "discord.js";
import { cloudSelect, cloudUpsert, hasCloud } from "./lib/cloud.mts";
import { getSettings } from "./lib/db.mts";

type Reward = { level: number; roleId: string };
type LevelingConfig = {
  enabled: boolean;
  xpPerMessage: number;
  xpPerVoiceMin: number;
  cooldownSec: number;
  announceChannelId: string;
  rewards: Reward[];
};

const DEFAULT: LevelingConfig = {
  enabled: false,
  xpPerMessage: 15,
  xpPerVoiceMin: 10,
  cooldownSec: 60,
  announceChannelId: "",
  rewards: [],
};

// ── Config (cache odświeżany z lokalnej bazy co 30 s, żeby nie otwierać SQLite na każdą wiadomość) ──
let cfg: LevelingConfig = { ...DEFAULT };
function refreshConfig(): void {
  const raw = getSettings()["leveling_config"];
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
function levelForXp(xp: number): number {
  let lvl = 0;
  let acc = 0;
  while (lvl < 1000 && acc + xpToNext(lvl) <= xp) {
    acc += xpToNext(lvl);
    lvl++;
  }
  return lvl;
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
      "user_levels",
      `select=xp,level&guild_id=eq.${guildId}&user_id=eq.${encodeURIComponent(userId)}`,
    );
    const curXp = rows[0]?.xp ?? 0;
    const curLevel = rows[0]?.level ?? 0;
    const newXp = curXp + amount;
    const newLevel = levelForXp(newXp);

    await cloudUpsert(
      "user_levels",
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
      "guild_id,user_id",
    );

    if (newLevel > curLevel) await onLevelUp(client, guildId, userId, newLevel);
  } catch (e) {
    console.warn("[leveling]", (e as Error).message);
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

  // najwyższa rola-nagroda przysługująca na ten poziom
  const reward = cfg.rewards
    .filter((r) => r.level <= level && r.roleId)
    .sort((a, b) => b.level - a.level)[0];
  if (reward) {
    const member = await guild.members.fetch(userId).catch(() => null);
    await member?.roles.add(reward.roleId).catch(() => {});
  }

  if (cfg.announceChannelId) {
    const ch = await guild.channels.fetch(cfg.announceChannelId).catch(() => null);
    if (ch?.isTextBased() && "send" in ch) {
      await ch
        .send(`🏆 <@${userId}> awansował na **poziom ${level}**!`)
        .catch(() => {});
    }
  }
}

export function startLeveling(client: Client): void {
  refreshConfig();
  setInterval(refreshConfig, 30_000);

  // XP za wiadomości (nie potrzebujemy treści → wystarczy intent GuildMessages)
  client.on(Events.MessageCreate, (msg: Message) => {
    if (!cfg.enabled || msg.author.bot || !msg.guild) return;
    const now = Date.now();
    const last = cooldowns.get(msg.author.id) ?? 0;
    if (now - last < cfg.cooldownSec * 1000) return;
    cooldowns.set(msg.author.id, now);
    void award(client, msg.guild.id, msg.author.id, msg.author.username, cfg.xpPerMessage);
  });

  // XP za voice — co 60 s dla każdego w kanale głosowym
  setInterval(() => {
    if (!cfg.enabled || cfg.xpPerVoiceMin <= 0) return;
    for (const guild of client.guilds.cache.values()) {
      for (const channel of guild.channels.cache.values()) {
        if (!channel.isVoiceBased() || channel.id === guild.afkChannelId) continue;
        for (const [memberId, member] of channel.members) {
          if (member.user.bot) continue;
          const vs: VoiceState | null = member.voice;
          if (vs?.serverDeaf) continue;
          void award(client, guild.id, memberId, member.user.username, cfg.xpPerVoiceMin);
        }
      }
    }
  }, 60_000);

  console.log("[leveling] aktywny (XP za czat/voice; config z panelu, dane → Supabase user_levels).");
}
