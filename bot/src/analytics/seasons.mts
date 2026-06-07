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
import { getSettings } from '../lib/db.mts';

type Cfg = { enabled: boolean; channelId: string; top: number; reset: boolean };
const DEFAULT: Cfg = { enabled: false, channelId: '', top: 10, reset: false };
let cfg: Cfg = { ...DEFAULT };

function refresh(): void {
  const raw = getSettings()['seasons_config'];
  try {
    cfg = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<Cfg>) } : { ...DEFAULT };
  } catch {
    /* zostaw poprzedni */
  }
}

type LevelRow = { user_id: string; username: string | null; xp: number; level: number };
const MEDAL = ['🥇', '🥈', '🥉'];

async function snapshot(guild: Guild, endedMonth: string): Promise<void> {
  const top = Math.max(1, Math.min(25, cfg.top || 10));
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
  ).catch((e) => console.warn('[seasons]', (e as Error).message));

  const ch = await guild.channels.fetch(cfg.channelId).catch(() => null);
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

  if (cfg.reset) {
    await cloudUpdate('user_levels', `guild_id=eq.${guild.id}&xp=gt.0`, { xp: 0, level: 0 }).catch(
      () => {},
    );
  }
}

async function tick(client: Client): Promise<void> {
  if (!cfg.enabled || !cfg.channelId || !hasCloud()) return;
  const cur = new Date().toISOString().slice(0, 7); // YYYY-MM
  const last = await cloudGetSetting('hof_last_month').catch(() => null);
  if (!last) {
    await cloudSetSetting('hof_last_month', cur).catch(() => {}); // baseline, bez snapshotu
    return;
  }
  if (last === cur) return;

  const parent = await client.channels.fetch(cfg.channelId).catch(() => null);
  if (parent && 'guild' in parent) {
    await snapshot((parent as TextChannel).guild, last).catch((e) =>
      console.warn('[seasons]', (e as Error).message),
    );
  }
  await cloudSetSetting('hof_last_month', cur).catch(() => {});
}

export function startSeasons(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);
  if (!hasCloud()) {
    console.log('[seasons] brak chmury — sezonowe rankingi wyłączone.');
    return;
  }
  void tick(client).catch(() => {});
  setInterval(
    () => void tick(client).catch((e) => console.warn('[seasons]', (e as Error).message)),
    6 * 3_600_000,
  );
  console.log('[seasons] sezonowe rankingi aktywne (sprawdzanie co 6h).');
}
