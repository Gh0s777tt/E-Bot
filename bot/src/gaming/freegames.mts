// Faza 7 / F9.1 — feed darmowych gier z Epic Games Store (publiczny endpoint, bez klucza).
// Config 'freegames_config' (PER-SERWER). Dedup PER-SERWER 'g:<id>:freegames_seen' / '...itad_seen'.
// Fetch z API RAZ (te same gry dla wszystkich serwerów), post + dedup per-serwer. Poll co 6h.
import { type Client, EmbedBuilder, type Guild, type TextChannel } from 'discord.js';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';

type Cfg = { enabled: boolean; channelId: string; multiStore?: boolean };
const DEFAULT: Cfg = { enabled: false, channelId: '', multiStore: false };
function cfgFor(guildId: string): Cfg {
  const raw = getGuildSettings(guildId)['freegames_config'];
  try {
    return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<Cfg>) } : { ...DEFAULT };
  } catch {
    return { ...DEFAULT };
  }
}

const EPIC =
  'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=pl-PL&country=PL&allowCountries=PL';

type FreeGame = { id: string; title: string; url: string; image: string; end: string };

export function parseFree(d: unknown): FreeGame[] {
  const elements = (d as any)?.data?.Catalog?.searchStore?.elements ?? [];
  const out: FreeGame[] = [];
  for (const el of elements as any[]) {
    const offer = el?.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0];
    const free = el?.price?.totalPrice?.discountPrice === 0;
    if (!offer || !free) continue;
    const slug = el?.catalogNs?.mappings?.[0]?.pageSlug || el?.productSlug || el?.urlSlug;
    const img = (
      el?.keyImages?.find((k: any) => k?.type === 'OfferImageWide') || el?.keyImages?.[0]
    )?.url;
    out.push({
      id: String(el?.id ?? el?.title),
      title: String(el?.title ?? 'Gra'),
      url: slug
        ? `https://store.epicgames.com/p/${slug}`
        : 'https://store.epicgames.com/free-games',
      image: img ?? '',
      end: offer?.endDate ?? '',
    });
  }
  return out;
}

// Wczytuje + zapisuje listę „widzianych" ID dla jednego serwera (per-serwer dedup).
async function loadSeen(key: string): Promise<string[]> {
  try {
    return JSON.parse((await cloudGetSetting(key)) || '[]') as string[];
  } catch {
    return [];
  }
}

// Post nowych gier Epic na kanał JEDNEGO serwera (config + dedup per-serwer; `guild.channels.fetch`
// = izolacja: tylko kanały tej gildii).
async function postEpicForGuild(guild: Guild, games: FreeGame[]): Promise<void> {
  const c = cfgFor(guild.id);
  if (!c.enabled || !c.channelId) return;
  const ch = await guild.channels.fetch(c.channelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) return;
  const seenKey = `g:${guild.id}:freegames_seen`;
  const seen = await loadSeen(seenKey);
  let changed = false;
  for (const g of games) {
    if (seen.includes(g.id)) continue;
    const endTs = g.end ? Math.floor(new Date(g.end).getTime() / 1000) : 0;
    const embed = new EmbedBuilder()
      .setColor(0xe50914)
      .setTitle(`🆓 Za darmo na Epic: ${g.title}`)
      .setURL(g.url)
      .setDescription(endTs ? `Odbierz do <t:${endTs}:R>.` : 'Odbierz teraz!')
      .setTimestamp(new Date());
    if (g.image) embed.setImage(g.image);
    await (ch as TextChannel).send({ embeds: [embed] }).catch(() => {});
    seen.push(g.id);
    changed = true;
  }
  if (changed) await cloudSetSetting(seenKey, JSON.stringify(seen.slice(-50))).catch(() => {});
}

// Eksport dla testów izolacji (freegames.isolation.test.ts): jeden cykl pollera Epic.
export async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  const r = await fetch(EPIC, { signal: AbortSignal.timeout(15_000) }).catch(() => null);
  if (!r?.ok) return;
  const games = parseFree(await r.json().catch(() => ({})));
  if (!games.length) return;
  for (const guild of client.guilds.cache.values()) {
    await postEpicForGuild(guild, games).catch(() => {});
  }
}

type ItadDeal = { id: string; title: string; url: string | null; shop: string };

export function parseItad(d: unknown): ItadDeal[] {
  const list = Array.isArray((d as { list?: unknown[] })?.list)
    ? (d as { list: unknown[] }).list
    : [];
  const out: ItadDeal[] = [];
  for (const itRaw of list) {
    const it = itRaw as {
      id?: string;
      slug?: string;
      title?: string;
      deal?: { cut?: number; price?: { amount?: number }; shop?: { name?: string }; url?: string };
    };
    const deal = it.deal;
    if (!deal) continue;
    const free = (deal.cut ?? 0) >= 100 || deal.price?.amount === 0;
    if (!free) continue;
    const id = `itad:${it.id ?? it.slug ?? deal.url ?? it.title ?? ''}`;
    if (id === 'itad:') continue;
    out.push({
      id,
      title: String(it.title ?? 'Gra'),
      url: deal.url || null,
      shop: deal.shop?.name ?? 'sklepie',
    });
  }
  return out;
}

async function postItadForGuild(guild: Guild, deals: ItadDeal[]): Promise<void> {
  const c = cfgFor(guild.id);
  if (!c.enabled || !c.multiStore || !c.channelId) return;
  const ch = await guild.channels.fetch(c.channelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) return;
  const seenKey = `g:${guild.id}:freegames_itad_seen`;
  const seen = await loadSeen(seenKey);
  let changed = false;
  for (const d of deals) {
    if (seen.includes(d.id)) continue;
    const embed = new EmbedBuilder()
      .setColor(0xe50914)
      .setTitle(`🆓 Za darmo: ${d.title}`)
      .setURL(d.url)
      .setDescription(`Darmowe rozdanie w **${d.shop}** — odbierz!`)
      .setTimestamp(new Date());
    await (ch as TextChannel).send({ embeds: [embed] }).catch(() => {});
    seen.push(d.id);
    changed = true;
  }
  if (changed) await cloudSetSetting(seenKey, JSON.stringify(seen.slice(-80))).catch(() => {});
}

// Faza 8 — multi-store darmowe gry przez ITAD (deals −100%). Defensywne: zła odpowiedź → pusto.
async function tickItad(client: Client): Promise<void> {
  const key = process.env.ITAD_API_KEY;
  if (!hasCloud() || !key) return;
  const r = await fetch(
    `https://api.isthereanydeal.com/deals/v2?key=${key}&country=PL&limit=50&sort=-cut`,
    { signal: AbortSignal.timeout(15_000) },
  ).catch(() => null);
  if (!r?.ok) return;
  const deals = parseItad(await r.json().catch(() => ({})));
  if (!deals.length) return;
  for (const guild of client.guilds.cache.values()) {
    await postItadForGuild(guild, deals).catch(() => {});
  }
}

export function startFreeGames(client: Client): void {
  if (!hasCloud()) {
    log.info('[freegames] brak chmury — feed darmowych gier wyłączony.');
    return;
  }
  void tick(client).catch(() => {});
  void tickItad(client).catch(() => {});
  setInterval(() => {
    void tick(client).catch((e) => log.warn('[freegames]', { err: e }));
    void tickItad(client).catch((e) => log.warn('[freegames:itad]', { err: e }));
  }, 6 * 3_600_000);
  log.info(
    '[freegames] feed darmowych gier (Epic + multi-store ITAD) aktywny per-serwer (poll 6h).',
  );
}
