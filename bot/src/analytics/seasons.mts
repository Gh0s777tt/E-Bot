// Faza 7 / F10.2 — sezonowe rankingi levelingu: przy zmianie miesiąca robi snapshot top XP do
// 'xp_hall_of_fame', ogłasza i (opcjonalnie) resetuje XP. Config 'seasons_config'. Dedup 'hof_last_month'.

import { type Client, EmbedBuilder, type Guild, type TextChannel } from 'discord.js';
import {
  cloudGetSetting,
  cloudInsert,
  cloudSelect,
  cloudSetSetting,
  cloudUpdate,
  hasCloud,
} from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';

type Cfg = { enabled: boolean; channelId: string; top: number; reset: boolean };
const DEFAULT: Cfg = { enabled: false, channelId: '', top: 10, reset: false };

// Etap K — config per-serwer: świeży odczyt (poller miesięczny), fallback global.
function cfg(guildId: string): Cfg {
  const raw = getGuildSettings(guildId)['seasons_config'];
  try {
    return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<Cfg>) } : { ...DEFAULT };
  } catch {
    return { ...DEFAULT };
  }
}

type LevelRow = { user_id: string; username: string | null; xp: number; level: number };
const MEDAL = ['🥇', '🥈', '🥉'];

async function snapshot(guild: Guild, endedMonth: string, c: Cfg): Promise<void> {
  const top = Math.max(1, Math.min(25, c.top || 10));
  const rows = await cloudSelect<LevelRow>(
    'user_levels',
    `select=user_id,username,xp,level&guild_id=eq.${guild.id}&xp=gt.0&order=xp.desc&limit=${top}`,
  );
  if (!rows.length) return;

  await cloudInsert(
    'xp_hall_of_fame',
    rows.map((r, i) => ({
      guild_id: guild.id,
      month: endedMonth,
      user_id: r.user_id,
      username: r.username,
      xp: r.xp,
      level: r.level,
      rank: i + 1,
    })),
  ).catch((e) => log.warn('[seasons]', { err: e }));

  const ch = await guild.channels.fetch(c.channelId).catch(() => null);
  if (ch?.isTextBased() && 'send' in ch) {
    const lines = rows
      .map(
        (r, i) =>
          `${MEDAL[i] ?? `**${i + 1}.**`} <@${r.user_id}> — lvl ${r.level} · ${r.xp.toLocaleString('pl-PL')} XP`,
      )
      .join('\n');
    const embed = new EmbedBuilder()
      .setColor(0xe50914)
      .setTitle(`🏆 Hall of Fame — sezon ${endedMonth}`)
      .setDescription(lines)
      .setTimestamp(new Date());
    await (ch as TextChannel).send({ embeds: [embed] }).catch(() => {});
  }

  if (c.reset) {
    await cloudUpdate('user_levels', `guild_id=eq.${guild.id}&xp=gt.0`, { xp: 0, level: 0 }).catch(
      () => {},
    );
  }
}

async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  const cur = new Date().toISOString().slice(0, 7); // YYYY-MM
  // Etap K — per-serwer: iterujemy serwery, dedup miesiąca per-serwer (hof_last_month:<guildId>).
  for (const guild of client.guilds.cache.values()) {
    const c = cfg(guild.id);
    if (!c.enabled || !c.channelId) continue;
    const dedupKey = `hof_last_month:${guild.id}`;
    const last = await cloudGetSetting(dedupKey).catch(() => null);
    if (!last) {
      await cloudSetSetting(dedupKey, cur).catch(() => {}); // baseline, bez snapshotu
      continue;
    }
    if (last === cur) continue;
    await snapshot(guild, last, c).catch((e) => log.warn('[seasons]', { err: e }));
    await cloudSetSetting(dedupKey, cur).catch(() => {});
  }
}

export function startSeasons(client: Client): void {
  if (!hasCloud()) {
    log.info('[seasons] brak chmury — sezonowe rankingi wyłączone.');
    return;
  }
  void tick(client).catch(() => {});
  setInterval(
    () => void tick(client).catch((e) => log.warn('[seasons]', { err: e })),
    6 * 3_600_000,
  );
  log.info('[seasons] sezonowe rankingi aktywne (sprawdzanie co 6h).');
}
