// Faza 7 / F9.1 — feed darmowych gier z Epic Games Store (publiczny endpoint, bez klucza).
// Config 'freegames_config'. Dedup w cloud setting 'freegames_seen'. Poll co 6h.
import { type Client, EmbedBuilder, type TextChannel } from 'discord.js';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getSettings } from '../lib/db.mts';

type Cfg = { enabled: boolean; channelId: string; multiStore?: boolean };
const DEFAULT: Cfg = { enabled: false, channelId: '', multiStore: false };
let cfg: Cfg = { ...DEFAULT };

function refresh(): void {
  const raw = getSettings()['freegames_config'];
  try {
    cfg = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<Cfg>) } : { ...DEFAULT };
  } catch {
    /* zostaw poprzedni */
  }
}

const EPIC =
  'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=pl-PL&country=PL&allowCountries=PL';

type FreeGame = { id: string; title: string; url: string; image: string; end: string };

function parseFree(d: unknown): FreeGame[] {
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

async function tick(client: Client): Promise<void> {
  if (!cfg.enabled || !cfg.channelId || !hasCloud()) return;
  const r = await fetch(EPIC, { signal: AbortSignal.timeout(15_000) }).catch(() => null);
  if (!r?.ok) return;
  const games = parseFree(await r.json().catch(() => ({})));
  if (!games.length) return;

  let seen: string[] = [];
  try {
    seen = JSON.parse((await cloudGetSetting('freegames_seen')) || '[]') as string[];
  } catch {
    /* pusta lista */
  }
  const ch = await client.channels.fetch(cfg.channelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) return;

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
  if (changed)
    await cloudSetSetting('freegames_seen', JSON.stringify(seen.slice(-50))).catch(() => {});
}

// Faza 8 — multi-store darmowe gry przez ITAD (deals −100%). Defensywne: zła odpowiedź → pusto.
async function tickItad(client: Client): Promise<void> {
  const key = process.env.ITAD_API_KEY;
  if (!cfg.enabled || !cfg.multiStore || !cfg.channelId || !hasCloud() || !key) return;
  const r = await fetch(
    `https://api.isthereanydeal.com/deals/v2?key=${key}&country=PL&limit=50&sort=-cut`,
    { signal: AbortSignal.timeout(15_000) },
  ).catch(() => null);
  if (!r?.ok) return;
  const d = (await r.json().catch(() => ({}))) as { list?: unknown[] };
  const list = Array.isArray(d?.list) ? d.list : [];
  if (!list.length) return;

  let seen: string[] = [];
  try {
    seen = JSON.parse((await cloudGetSetting('freegames_itad_seen')) || '[]') as string[];
  } catch {
    /* pusta lista */
  }
  const ch = await client.channels.fetch(cfg.channelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) return;

  let changed = false;
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
    if (id === 'itad:' || seen.includes(id)) continue;
    const embed = new EmbedBuilder()
      .setColor(0xe50914)
      .setTitle(`🆓 Za darmo: ${it.title ?? 'Gra'}`)
      .setURL(deal.url || null)
      .setDescription(`Darmowe rozdanie w **${deal.shop?.name ?? 'sklepie'}** — odbierz!`)
      .setTimestamp(new Date());
    await (ch as TextChannel).send({ embeds: [embed] }).catch(() => {});
    seen.push(id);
    changed = true;
  }
  if (changed)
    await cloudSetSetting('freegames_itad_seen', JSON.stringify(seen.slice(-80))).catch(() => {});
}

export function startFreeGames(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);
  if (!hasCloud()) {
    console.log('[freegames] brak chmury — feed darmowych gier wyłączony.');
    return;
  }
  void tick(client).catch(() => {});
  void tickItad(client).catch(() => {});
  setInterval(() => {
    void tick(client).catch((e) => console.warn('[freegames]', (e as Error).message));
    void tickItad(client).catch((e) => console.warn('[freegames:itad]', (e as Error).message));
  }, 6 * 3_600_000);
  console.log('[freegames] feed darmowych gier (Epic + multi-store ITAD) aktywny (poll 6h).');
}
