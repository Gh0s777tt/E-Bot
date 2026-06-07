// Faza 7 / F9.3 — śledzenie cen (IsThereAnyDeal): sprawdza gry z listy życzeń i ogłasza promocje.
// Config 'pricetracker_config'. Klucz ITAD_API_KEY w env (Railway). Dedup w 'pricetracker_seen'. Poll 12h.
import { type Client, EmbedBuilder, type TextChannel } from 'discord.js';
import { cloudGetSetting, cloudSelect, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getSettings } from '../lib/db.mts';

type Cfg = { enabled: boolean; channelId: string };
const DEFAULT: Cfg = { enabled: false, channelId: '' };
let cfg: Cfg = { ...DEFAULT };

function refresh(): void {
  const raw = getSettings()['pricetracker_config'];
  try {
    cfg = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<Cfg>) } : { ...DEFAULT };
  } catch {
    /* zostaw poprzedni */
  }
}

const BASE = 'https://api.isthereanydeal.com';
type Money = { amount: number; currency: string };
type Deal = {
  shop?: { name?: string };
  price?: Money;
  regular?: Money;
  cut?: number;
  url?: string;
};
type PriceRow = { id: string; historyLow?: { all?: Money }; deals?: Deal[] };

async function lookupId(key: string, title: string): Promise<string | null> {
  const r = await fetch(`${BASE}/games/lookup/v1?key=${key}&title=${encodeURIComponent(title)}`, {
    signal: AbortSignal.timeout(12_000),
  }).catch(() => null);
  if (!r?.ok) return null;
  const d = (await r.json().catch(() => ({}))) as { found?: boolean; game?: { id?: string } };
  return d.found && d.game?.id ? d.game.id : null;
}

async function tick(client: Client): Promise<void> {
  const key = process.env.ITAD_API_KEY;
  if (!cfg.enabled || !cfg.channelId || !hasCloud() || !key) return;

  const wl = await cloudSelect<{ title: string }>('wishlist', 'select=title&limit=100');
  if (!wl.length) return;

  // Tytuł → ID ITAD (po jednym; lista życzeń jest mała).
  const idToTitle = new Map<string, string>();
  for (const w of wl) {
    if (!w.title) continue;
    const id = await lookupId(key, w.title);
    if (id) idToTitle.set(id, w.title);
  }
  if (!idToTitle.size) return;

  const pr = await fetch(`${BASE}/games/prices/v3?key=${key}&country=PL`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([...idToTitle.keys()]),
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);
  if (!pr?.ok) return;
  const rows = (await pr.json().catch(() => [])) as PriceRow[];

  let seen: string[] = [];
  try {
    seen = JSON.parse((await cloudGetSetting('pricetracker_seen')) || '[]') as string[];
  } catch {
    /* pusta */
  }
  const ch = await client.channels.fetch(cfg.channelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) return;

  let changed = false;
  for (const row of rows) {
    const onSale = (row.deals ?? []).filter((d) => (d.cut ?? 0) > 0 && d.price);
    if (!onSale.length) continue;
    const best = onSale.reduce((a, b) =>
      (a.price?.amount ?? 1e9) <= (b.price?.amount ?? 1e9) ? a : b,
    );
    const price = best.price;
    if (!price) continue;
    const dedupKey = `${row.id}:${best.cut}:${Math.round(price.amount * 100)}`;
    if (seen.includes(dedupKey)) continue;

    const title = idToTitle.get(row.id) ?? 'Gra';
    const low = row.historyLow?.all;
    const embed = new EmbedBuilder()
      .setColor(0xe50914)
      .setTitle(`🔥 Promocja: ${title}`)
      .setURL(best.url || null)
      .setDescription(
        `**${price.amount.toFixed(2)} ${price.currency}** (−${best.cut}%) w ${best.shop?.name ?? 'sklepie'}` +
          (low ? `\nNajniżej w historii: ${low.amount.toFixed(2)} ${low.currency}` : ''),
      )
      .setTimestamp(new Date());
    await (ch as TextChannel).send({ embeds: [embed] }).catch(() => {});
    seen.push(dedupKey);
    changed = true;
  }
  if (changed) {
    await cloudSetSetting('pricetracker_seen', JSON.stringify(seen.slice(-150))).catch(() => {});
  }
}

export function startPriceTracker(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);
  if (!hasCloud()) {
    console.log('[pricetracker] brak chmury — śledzenie cen wyłączone.');
    return;
  }
  if (!process.env.ITAD_API_KEY) {
    console.log('[pricetracker] brak ITAD_API_KEY — śledzenie cen wyłączone.');
    return;
  }
  void tick(client).catch(() => {});
  setInterval(
    () => void tick(client).catch((e) => console.warn('[pricetracker]', (e as Error).message)),
    12 * 3_600_000,
  );
  console.log('[pricetracker] śledzenie cen ITAD aktywne (poll 12h, config z panelu).');
}
