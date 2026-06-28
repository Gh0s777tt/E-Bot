// Sezon ekonomii — co miesiąc ogłasza top-eco (Hall of Fame), wypłaca podium nagrody (do historii
// transakcji jako „sezon") i opcjonalnie resetuje salda. Lustro analytics/seasons.mts (XP).
// Config 'eco_season_config'. Dedup miesiąca przez 'eco_season_last'.

import { type Client, EmbedBuilder, type Guild, type TextChannel } from 'discord.js';
import { ecoConfig } from '../economy/store.mts';
import { logTx } from '../economy/txlog.mts';
import {
  cloudGetSetting,
  cloudSelect,
  cloudSetSetting,
  cloudUpdate,
  cloudUpsert,
  hasCloud,
} from '../lib/cloud.mts';
import { getSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';

type Cfg = {
  enabled: boolean;
  channelId: string;
  reward1: number;
  reward2: number;
  reward3: number;
  reset: boolean;
};
const DEFAULT: Cfg = {
  enabled: false,
  channelId: '',
  reward1: 0,
  reward2: 0,
  reward3: 0,
  reset: false,
};
let cfg: Cfg = { ...DEFAULT };

function refresh(): void {
  const raw = getSettings()['eco_season_config'];
  try {
    cfg = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<Cfg>) } : { ...DEFAULT };
  } catch {
    /* zostaw poprzedni */
  }
}

type EcoRow = { user_id: string; username: string | null; wallet: number; bank: number };
const MEDAL = ['🥇', '🥈', '🥉'];

// Ranking sezonu eco: majątek = wallet+bank (DB sortuje tylko po wallet → re-sort po sumie, by ktoś
// z dużym bankiem a małym portfelem nie wypadł), malejąco, top N. Indeksy 0–2 = podium z nagrodą.
export function rankByTotal<T extends { wallet: number; bank: number }>(
  rows: T[],
  topN = 10,
): (T & { total: number })[] {
  return rows
    .map((r) => ({ ...r, total: (r.wallet || 0) + (r.bank || 0) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, topN);
}

async function snapshot(guild: Guild, endedMonth: string): Promise<void> {
  const rows = await cloudSelect<EcoRow>(
    'economy_users',
    `select=user_id,username,wallet,bank&guild_id=eq.${guild.id}&order=wallet.desc&limit=80`,
  );
  const sorted = rankByTotal(rows);
  if (!sorted.length) return;

  const cur = ecoConfig(guild.id).currency;
  const rewards = [cfg.reward1, cfg.reward2, cfg.reward3];

  const ch = await guild.channels.fetch(cfg.channelId).catch(() => null);
  if (ch?.isTextBased() && 'send' in ch) {
    const lines = sorted
      .map(
        (r, i) =>
          `${MEDAL[i] ?? `**${i + 1}.**`} <@${r.user_id}> — ${r.total.toLocaleString('pl-PL')} ${cur}${
            i < 3 && rewards[i] > 0 ? ` → 🎁 +${rewards[i].toLocaleString('pl-PL')} ${cur}` : ''
          }`,
      )
      .join('\n');
    const embed = new EmbedBuilder()
      .setColor(0xe50914)
      .setTitle(`🏆 Sezon ekonomii — ${endedMonth}`)
      .setDescription(lines)
      .setFooter({ text: cfg.reset ? 'Salda zresetowane — nowy sezon startuje!' : 'Nowy sezon!' })
      .setTimestamp(new Date());
    await (ch as TextChannel).send({ embeds: [embed] }).catch(() => {});
  }

  // Reset (opcjonalny) — najpierw zerujemy wszystkim, potem podium dostaje nagrodę (przeżywa reset).
  if (cfg.reset) {
    await cloudUpdate('economy_users', `guild_id=eq.${guild.id}`, { wallet: 0, bank: 0 }).catch(
      (e) => log.warn('[ecoSeason] reset sald', { err: e }),
    );
  }
  for (let i = 0; i < sorted.length && i < 3; i++) {
    const reward = rewards[i] || 0;
    if (reward <= 0) continue;
    const base = cfg.reset ? 0 : sorted[i].wallet || 0;
    await cloudUpsert(
      'economy_users',
      [
        {
          guild_id: guild.id,
          user_id: sorted[i].user_id,
          wallet: base + reward,
          updated_at: new Date().toISOString(),
        },
      ],
      'guild_id,user_id',
    ).catch((e) => log.warn('[ecoSeason] wypłata podium', { err: e }));
    logTx(guild.id, sorted[i].user_id, reward, 'sezon');
  }
}

async function tick(client: Client): Promise<void> {
  if (!cfg.enabled || !cfg.channelId || !hasCloud()) return;
  const cur = new Date().toISOString().slice(0, 7); // YYYY-MM
  const last = await cloudGetSetting('eco_season_last').catch(() => null);
  if (!last) {
    await cloudSetSetting('eco_season_last', cur).catch((e) =>
      log.warn('[ecoSeason] dedup write', { err: e }),
    ); // baseline, bez wypłaty
    return;
  }
  if (last === cur) return;

  const parent = await client.channels.fetch(cfg.channelId).catch(() => null);
  if (parent && 'guild' in parent) {
    await snapshot((parent as TextChannel).guild, last).catch((e) =>
      log.warn('[ecoSeason]', { err: e }),
    );
  }
  await cloudSetSetting('eco_season_last', cur).catch((e) =>
    log.warn('[ecoSeason] dedup write', { err: e }),
  );
}

export function startEcoSeason(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);
  if (!hasCloud()) {
    log.info('[ecoSeason] brak chmury — sezon ekonomii wyłączony.');
    return;
  }
  void tick(client).catch(() => {});
  setInterval(
    () => void tick(client).catch((e) => log.warn('[ecoSeason]', { err: e })),
    6 * 3_600_000,
  );
  log.info('[ecoSeason] sezon ekonomii aktywny (sprawdzanie co 6h).');
}
