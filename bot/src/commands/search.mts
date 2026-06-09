// /search — Wikipedia (bez klucza, subdomena wg języka) · gra→IGDB (Twitch creds) · YouTube (klucz).
// Źródła wymagające kluczy działają jako graceful no-op (komunikat „dodaj klucz"), reszta gotowa.
import { type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { type Locale, resolveLocale, t } from '../i18n/index.mts';
import { twitchToken } from '../live/tokens.mts';

const ACCENT = 0xe50914;
const NO_KEY = Symbol('no-key');
type Hit = { title: string; description: string; url?: string; image?: string; footer: string };
type Result = Hit | null | typeof NO_KEY;

// Lokale, które są jednocześnie kodami subdomen Wikipedii (wszystkie nasze 14 są).
const WIKI_LANGS = new Set<Locale>([
  'en',
  'de',
  'es',
  'it',
  'fr',
  'pt',
  'zh',
  'ko',
  'ru',
  'uk',
  'ja',
  'ar',
  'id',
  'pl',
]);

function clamp(text: string, max = 600): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

type WikiPage = {
  title: string;
  extract?: string;
  fullurl?: string;
  thumbnail?: { source?: string };
};

async function searchWiki(q: string, locale: Locale): Promise<Result> {
  const lang = WIKI_LANGS.has(locale) ? locale : 'en';
  const url =
    `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&redirects=1` +
    `&prop=extracts|info|pageimages&exintro&explaintext&inprop=url&piprop=thumbnail&pithumbsize=200` +
    `&generator=search&gsrlimit=1&gsrsearch=${encodeURIComponent(q)}`;
  const r = await fetch(url, {
    headers: { 'User-Agent': 'E-BOT Discord bot (search command)' },
    signal: AbortSignal.timeout(8000),
  });
  const j = (await r.json()) as { query?: { pages?: Record<string, WikiPage> } };
  const pages = j.query?.pages;
  const page = pages ? Object.values(pages)[0] : undefined;
  if (!page?.extract) return null;
  return {
    title: page.title,
    description: clamp(page.extract),
    url: page.fullurl,
    image: page.thumbnail?.source,
    footer: 'Wikipedia',
  };
}

type IgdbGame = {
  name: string;
  summary?: string;
  first_release_date?: number;
  rating?: number;
  url?: string;
  cover?: { url?: string };
};

async function searchGame(q: string): Promise<Result> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  if (!clientId) return NO_KEY;
  let token: string;
  try {
    token = await twitchToken();
  } catch {
    return NO_KEY;
  }
  const r = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Client-ID': clientId,
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body:
      `search "${q.replaceAll('"', '')}"; ` +
      'fields name,summary,first_release_date,rating,url,cover.url; limit 1;',
    signal: AbortSignal.timeout(8000),
  });
  const arr = (await r.json()) as IgdbGame[];
  const g = Array.isArray(arr) ? arr[0] : undefined;
  if (!g) return null;
  const meta: string[] = [];
  if (g.first_release_date) meta.push(`📅 ${new Date(g.first_release_date * 1000).getFullYear()}`);
  if (g.rating) meta.push(`⭐ ${Math.round(g.rating)}/100`);
  const body = clamp(g.summary ?? '—');
  return {
    title: g.name,
    description: meta.length ? `${meta.join(' · ')}\n\n${body}` : body,
    url: g.url,
    image: g.cover?.url ? `https:${g.cover.url.replace('t_thumb', 't_cover_big')}` : undefined,
    footer: 'IGDB',
  };
}

type YtItem = {
  id?: { videoId?: string };
  snippet?: {
    title: string;
    description?: string;
    channelTitle?: string;
    thumbnails?: { default?: { url?: string } };
  };
};

async function searchYouTube(q: string): Promise<Result> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return NO_KEY;
  const url =
    'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1' +
    `&q=${encodeURIComponent(q)}&key=${key}`;
  const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const j = (await r.json()) as { items?: YtItem[] };
  const item = j.items?.[0];
  if (!item?.snippet) return null;
  const vid = item.id?.videoId;
  return {
    title: item.snippet.title,
    description: clamp(item.snippet.description || '—'),
    url: vid ? `https://youtu.be/${vid}` : undefined,
    image: item.snippet.thumbnails?.default?.url,
    footer: `YouTube · ${item.snippet.channelTitle ?? ''}`.trim(),
  };
}

export const data = new SlashCommandBuilder()
  .setName('search')
  .setDescription('Szukaj w Wikipedii, grach (IGDB) lub na YouTube.')
  .addStringOption((o) =>
    o.setName('zapytanie').setDescription('Czego szukasz?').setRequired(true).setMaxLength(200),
  )
  .addStringOption((o) =>
    o
      .setName('zrodlo')
      .setDescription('Źródło (domyślnie Wikipedia)')
      .addChoices(
        { name: 'Wikipedia', value: 'wiki' },
        { name: 'Gra (IGDB)', value: 'game' },
        { name: 'YouTube', value: 'youtube' },
      ),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const q = interaction.options.getString('zapytanie', true);
  const source = interaction.options.getString('zrodlo') ?? 'wiki';
  await interaction.deferReply();
  try {
    const hit =
      source === 'game'
        ? await searchGame(q)
        : source === 'youtube'
          ? await searchYouTube(q)
          : await searchWiki(q, locale);

    if (hit === NO_KEY) {
      await interaction.editReply({ content: t(locale, 'search.noKey') });
      return;
    }
    if (!hit) {
      await interaction.editReply({ content: t(locale, 'search.notFound', { query: q }) });
      return;
    }
    const embed = new EmbedBuilder()
      .setColor(ACCENT)
      .setTitle(clamp(hit.title, 250))
      .setDescription(hit.description)
      .setFooter({ text: hit.footer });
    if (hit.url) embed.setURL(hit.url);
    if (hit.image) embed.setThumbnail(hit.image);
    await interaction.editReply({ embeds: [embed] });
  } catch {
    await interaction.editReply({ content: t(locale, 'search.error') });
  }
}
