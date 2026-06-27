// Faza 7 / F9.3 — śledzenie cen (IsThereAnyDeal): sprawdza gry z listy życzeń SERWERA i ogłasza promocje.
// Config 'pricetracker_config' (PER-SERWER). Klucz ITAD_API_KEY w env. Dedup PER-SERWER 'g:<id>:pricetracker_seen'.
// Lista życzeń filtrowana per `guild_id` (izolacja). Poll 12h, iteracja gildii.
import { type Client, EmbedBuilder, type Guild, type TextChannel } from 'discord.js';
import { cloudGetSetting, cloudSelect, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';

type Cfg = { enabled: boolean; channelId: string };
const DEFAULT: Cfg = { enabled: false, channelId: '' };
function cfgFor(guildId: string): Cfg {
  const raw = getGuildSettings(guildId)['pricetracker_config'];
  try {
    return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<Cfg>) } : { ...DEFAULT };
  } catch {
    return { ...DEFAULT };
  }
}

const BASE = 'https://api.isthereanydeal.com';
export type Money = { amount: number; currency: string };
export type Deal = {
  shop?: { name?: string };
  price?: Money;
  regular?: Money;
  cut?: number;
  url?: string;
};
type PriceRow = { id: string; historyLow?: { all?: Money }; deals?: Deal[] };

// Wybór deala do ogłoszenia: kandydaci to tylko REALNE promocje (`cut > 0`) z CENĄ; spośród nich
// NAJTAŃSZY wg `price.amount` (nie wg największego %!). Brak kandydatów → undefined. Remis → pierwszy.
export function bestDeal(deals: Deal[]): Deal | undefined {
  const onSale = deals.filter((d) => (d.cut ?? 0) > 0 && d.price);
  if (!onSale.length) return undefined;
  return onSale.reduce((a, b) => ((a.price?.amount ?? 1e9) <= (b.price?.amount ?? 1e9) ? a : b));
}

// Czy cena to (blisko) historyczne minimum — najmocniejszy sygnał „kupuj teraz", odróżniany od zwykłej
// promocji. Tolerancja w % (ceny drgają groszami: 3% nad ATL nadal traktujemy jako „najniżej w historii").
// Różne waluty / brak danych / ATL≤0 → false. Czysta funkcja (test: pricetracker.bestdeal).
export function isHistoricalLow(
  price: Money | undefined,
  historyLow: Money | undefined,
  tolerancePct = 3,
): boolean {
  if (!price || !historyLow || historyLow.amount <= 0) return false;
  if (price.currency !== historyLow.currency) return false;
  return price.amount <= historyLow.amount * (1 + tolerancePct / 100);
}

// ── Osobiste alerty cenowe (per-user, per-serwer) ──────────────────────────────────────────────
// Bez nowej tabeli: mapa userId → [{title, target}] trzymana w ustawieniu serwera 'g:<id>:price_targets'.
// Komenda /pricealert pisze, poller pricetracker DM-uje przy spadku. Czyste operacje na mapie (testowalne).
export type PriceTarget = { title: string; target: number };
export type TargetMap = Record<string, PriceTarget[]>;
export function targetsKey(guildId: string): string {
  return `g:${guildId}:price_targets`;
}
export function addTarget(
  map: TargetMap,
  userId: string,
  title: string,
  target: number,
  cap = 25,
): TargetMap {
  const t = title.trim();
  const lower = t.toLowerCase();
  const list = (map[userId] ?? []).filter((x) => x.title.toLowerCase() !== lower);
  list.push({ title: t, target });
  return { ...map, [userId]: list.slice(-cap) };
}
export function removeTarget(map: TargetMap, userId: string, title: string): TargetMap {
  const lower = title.trim().toLowerCase();
  const list = (map[userId] ?? []).filter((x) => x.title.toLowerCase() !== lower);
  const next = { ...map };
  if (list.length) next[userId] = list;
  else delete next[userId];
  return next;
}
export function isTargetHit(priceAmount: number, targetAmount: number): boolean {
  return targetAmount > 0 && priceAmount <= targetAmount;
}

// Czysta decyzja „kto dostaje DM" (testowalna): dla mapy targetów + cen (klucz=tytuł lowercase) + listy
// już powiadomionych zwraca trafienia do wysłania. Pomija inną walutę, brak ceny i już-powiadomione.
export function targetsToNotify(
  map: TargetMap,
  priceByTitle: Map<string, Money>,
  seen: string[],
): { userId: string; title: string; target: number }[] {
  const out: { userId: string; title: string; target: number }[] = [];
  for (const [userId, list] of Object.entries(map)) {
    for (const t of list ?? []) {
      const price = priceByTitle.get(t.title.toLowerCase());
      if (!price) continue;
      if (price.currency !== 'PLN' || !isTargetHit(price.amount, t.target)) continue;
      if (seen.includes(`${userId}:${t.title.toLowerCase()}:${Math.round(t.target * 100)}`))
        continue;
      out.push({ userId, title: t.title, target: t.target });
    }
  }
  return out;
}

async function lookupId(key: string, title: string): Promise<string | null> {
  const r = await fetch(`${BASE}/games/lookup/v1?key=${key}&title=${encodeURIComponent(title)}`, {
    signal: AbortSignal.timeout(12_000),
  }).catch(() => null);
  if (!r?.ok) return null;
  const d = (await r.json().catch(() => ({}))) as { found?: boolean; game?: { id?: string } };
  return d.found && d.game?.id ? d.game.id : null;
}

// Śledzenie cen dla JEDNEGO serwera: lista życzeń TEGO serwera (filtr guild_id = izolacja multi-tenant),
// config + dedup per-serwer, kanał przez `guild.channels.fetch` (tylko kanały tej gildii).
async function tickForGuild(guild: Guild, key: string): Promise<void> {
  const c = cfgFor(guild.id);
  if (!c.enabled || !c.channelId) return;

  const wl = await cloudSelect<{ title: string }>(
    'wishlist',
    `select=title&guild_id=eq.${guild.id}&limit=100`,
  );
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

  const ch = await guild.channels.fetch(c.channelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) return;

  const seenKey = `g:${guild.id}:pricetracker_seen`;
  let seen: string[] = [];
  try {
    seen = JSON.parse((await cloudGetSetting(seenKey)) || '[]') as string[];
  } catch {
    /* pusta */
  }

  let changed = false;
  for (const row of rows) {
    const best = bestDeal(row.deals ?? []);
    if (!best?.price) continue;
    const price = best.price;
    const dedupKey = `${row.id}:${best.cut}:${Math.round(price.amount * 100)}`;
    if (seen.includes(dedupKey)) continue;

    const title = idToTitle.get(row.id) ?? 'Gra';
    const low = row.historyLow?.all;
    // Historyczne minimum = osobny, mocniejszy alert (💎 zielony) vs zwykła promocja (🔥 czerwony).
    const atLow = isHistoricalLow(price, low);
    const embed = new EmbedBuilder()
      .setColor(atLow ? 0x2ecc71 : 0xe50914)
      .setTitle(`${atLow ? '💎 Najniższa cena w historii' : '🔥 Promocja'}: ${title}`)
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
  if (changed) await cloudSetSetting(seenKey, JSON.stringify(seen.slice(-150))).catch(() => {});
}

// Per-user alerty cenowe: dla targetów serwera ('g:<id>:price_targets') sprawdza ceny i DM-uje
// użytkownika przy spadku ≤ jego próg. Dedup per-trafienie ('g:<id>:pricetarget_seen'). Niezależne od
// kanału ogłoszeń (DM nie wymaga kanału). Decyzja „kto" w czystej targetsToNotify (test).
async function checkTargetsForGuild(guild: Guild, key: string): Promise<void> {
  const raw = await cloudGetSetting(targetsKey(guild.id));
  if (!raw) return;
  let map: TargetMap;
  try {
    map = JSON.parse(raw) as TargetMap;
  } catch {
    return;
  }
  const titles = [...new Set(Object.values(map).flatMap((l) => (l ?? []).map((t) => t.title)))];
  if (!titles.length) return;

  const titleToId = new Map<string, string>();
  for (const title of titles) {
    const id = await lookupId(key, title);
    if (id) titleToId.set(title, id);
  }
  if (!titleToId.size) return;

  const pr = await fetch(`${BASE}/games/prices/v3?key=${key}&country=PL`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([...new Set(titleToId.values())]),
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);
  if (!pr?.ok) return;
  const rows = (await pr.json().catch(() => [])) as PriceRow[];
  const bestById = new Map<string, Deal | undefined>();
  for (const row of rows) bestById.set(row.id, bestDeal(row.deals ?? []));

  const priceByTitle = new Map<string, Money>();
  const dealByTitle = new Map<string, Deal>();
  for (const [title, id] of titleToId) {
    const best = bestById.get(id);
    if (best?.price) {
      priceByTitle.set(title.toLowerCase(), best.price);
      dealByTitle.set(title.toLowerCase(), best);
    }
  }

  const seenKey = `g:${guild.id}:pricetarget_seen`;
  let seen: string[] = [];
  try {
    seen = JSON.parse((await cloudGetSetting(seenKey)) || '[]') as string[];
  } catch {
    /* pusta */
  }

  const toNotify = targetsToNotify(map, priceByTitle, seen);
  for (const n of toNotify) {
    const deal = dealByTitle.get(n.title.toLowerCase());
    const user = await guild.client.users.fetch(n.userId).catch(() => null);
    if (user && deal?.price) {
      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle(`🔔 Cena spadła: ${n.title}`)
        .setURL(deal.url || null)
        .setDescription(
          `**${deal.price.amount.toFixed(2)} ${deal.price.currency}** (−${deal.cut}%) w ${deal.shop?.name ?? 'sklepie'}\nTwój próg: ≤ ${n.target.toFixed(2)} zł · serwer **${guild.name}**`,
        )
        .setTimestamp(new Date());
      await user.send({ embeds: [embed] }).catch(() => {});
    }
    seen.push(`${n.userId}:${n.title.toLowerCase()}:${Math.round(n.target * 100)}`);
  }
  if (toNotify.length)
    await cloudSetSetting(seenKey, JSON.stringify(seen.slice(-300))).catch(() => {});
}

// Eksport dla testów izolacji (pricetracker.isolation.test.ts): jeden cykl pollera ITAD.
export async function tick(client: Client): Promise<void> {
  const key = process.env.ITAD_API_KEY;
  if (!hasCloud() || !key) return;
  for (const guild of client.guilds.cache.values()) {
    await tickForGuild(guild, key).catch(() => {});
    await checkTargetsForGuild(guild, key).catch(() => {});
  }
}

export function startPriceTracker(client: Client): void {
  if (!hasCloud()) {
    log.info('[pricetracker] brak chmury — śledzenie cen wyłączone.');
    return;
  }
  if (!process.env.ITAD_API_KEY) {
    log.info('[pricetracker] brak ITAD_API_KEY — śledzenie cen wyłączone.');
    return;
  }
  void tick(client).catch(() => {});
  setInterval(
    () => void tick(client).catch((e) => log.warn('[pricetracker]', { err: e })),
    12 * 3_600_000,
  );
  log.info('[pricetracker] śledzenie cen ITAD aktywne per-serwer (poll 12h, config z panelu).');
}
