// Faza 7 / F9.1 + „tryb PatchBot" — patch-notes / aktualności gier i oprogramowania.
// Źródła per-wpis: Steam News API (publiczne, bez klucza) ALBO dowolny kanał RSS/Atom (Riot, Epic,
// Blizzard, sterowniki GPU NVIDIA/AMD/Intel itd.) — kuratorowany katalog wybiera się w panelu po nazwie.
// Config 'patchnotes_config' (PER-SERWER). Dedup PER-SERWER 'g:<id>:patchnotes_seen'.
// Per-wpis: własny kanał (fallback domyślny) + ping roli + auto-pin; kanały tekstowe, głosowe i forum.
// Tryb dostarczania: instant (od razu) lub daily (digest o danej godzinie UTC). Opcjonalne AI-streszczenie.
// Apps różnią się per-serwer → fetch per-guild (z cache w obrębie jednego ticka). Poll 1h.
import {
  ChannelType,
  type Client,
  EmbedBuilder,
  type ForumChannel,
  type Guild,
  type GuildBasedChannel,
  type Message,
  type TextChannel,
} from 'discord.js';
import { aiConfig, callModel } from '../lib/ai.mts';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';
import { parseFeed } from '../lib/rss.mts';

// ── Źródło wpisu: Steam (po AppID) lub RSS/Atom (po URL). Kształt współdzielony z katalogiem panelu. ──
export type Source = { kind: 'steam'; appId: number } | { kind: 'rss'; url: string };

// Nowy kształt wpisu (per-gra): nazwa + źródło + opcjonalne nadpisania routingu.
type Item = {
  slug?: string;
  name: string;
  source?: Source;
  appId?: number; // skrót dla source steam (wstecznie)
  channelId?: string; // własny kanał (fallback: domyślny)
  roleId?: string; // ping roli
  pin?: boolean; // auto-pin wiadomości
  image?: string; // miniatura/okładka
};

type LegacyApp = { appId: number; name: string };

type Cfg = {
  enabled: boolean;
  channelId: string; // kanał domyślny
  digest: 'instant' | 'daily';
  digestHour: number; // 0–23 (UTC) — godzina wysyłki digestu
  aiSummary: boolean; // streszczanie patcha przez AI bota
  items: Item[]; // nowy kształt
  apps: LegacyApp[]; // STARY kształt (wstecznie kompatybilny)
};
const DEFAULT: Cfg = {
  enabled: false,
  channelId: '',
  digest: 'instant',
  digestHour: 12,
  aiSummary: false,
  items: [],
  apps: [],
};
function cfgFor(guildId: string): Cfg {
  return mergeConfig(getGuildSettings(guildId)['patchnotes_config'], DEFAULT);
}

// Znormalizowany feed (z items + legacy apps) gotowy do pobrania i publikacji.
type Feed = {
  name: string;
  source: Source;
  channelId?: string;
  roleId?: string;
  pin?: boolean;
  image?: string;
};
function feedsOf(c: Cfg): Feed[] {
  const feeds: Feed[] = [];
  for (const it of c.items ?? []) {
    const src: Source | null = it.source ?? (it.appId ? { kind: 'steam', appId: it.appId } : null);
    if (!src) continue;
    feeds.push({
      name: it.name,
      source: src,
      channelId: it.channelId,
      roleId: it.roleId,
      pin: it.pin,
      image: it.image,
    });
  }
  for (const a of c.apps ?? [])
    feeds.push({ name: a.name, source: { kind: 'steam', appId: a.appId } });
  return feeds.slice(0, 40);
}

// Jednolity element po pobraniu (Steam lub RSS).
type FetchedItem = { id: string; title: string; url: string; contents?: string; date?: number };

export function strip(s: string): string {
  return s
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 400);
}

type SteamNews = { gid: string; title: string; url: string; contents: string; date: number };
async function fetchSteam(appId: number): Promise<FetchedItem[]> {
  const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=3&maxlength=600`;
  const r = await fetch(url, { signal: AbortSignal.timeout(15_000) }).catch(() => null);
  if (!r?.ok) return [];
  const d = (await r.json().catch(() => ({}))) as { appnews?: { newsitems?: SteamNews[] } };
  return (d.appnews?.newsitems ?? []).map((n) => ({
    id: n.gid,
    title: n.title,
    url: n.url,
    contents: n.contents,
    date: n.date,
  }));
}

// UA przeglądarkowy + Accept: wiele feedów (Tom's Hardware, PC Gamer, RPS…) odrzuca puste/Node-owe UA.
const RSS_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
};
async function fetchRss(url: string): Promise<FetchedItem[]> {
  const r = await fetch(url, {
    headers: RSS_HEADERS,
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);
  if (!r?.ok) return [];
  const xml = await r.text().catch(() => '');
  // Prefiks `r:` żeby ID z RSS nie kolidowały z numerycznymi gid-ami Steama w jednej liście „seen".
  return parseFeed(xml).map((f) => ({ id: `r:${f.id}`, title: f.title, url: f.link }));
}

async function fetchFeed(
  source: Source,
  cache: Map<string, FetchedItem[]>,
): Promise<FetchedItem[]> {
  const key = source.kind === 'steam' ? `steam:${source.appId}` : `rss:${source.url}`;
  const cached = cache.get(key);
  if (cached) return cached;
  let items: FetchedItem[] = [];
  try {
    items = source.kind === 'steam' ? await fetchSteam(source.appId) : await fetchRss(source.url);
  } catch {
    items = [];
  }
  cache.set(key, items);
  return items;
}

// Opcjonalne AI-streszczenie treści patcha. Bez flagi / bez infry AI / błąd → undefined (fallback do strip).
async function summarize(contents: string | undefined, c: Cfg): Promise<string | undefined> {
  if (!c.aiSummary || !contents) return undefined;
  const ai = aiConfig();
  if (!ai.enabled) return undefined;
  try {
    const { text } = await callModel(
      ai.model,
      [
        {
          role: 'system',
          content:
            'Streszczasz patch-notes gry po polsku w 2–4 zwięzłych punktach (każdy zaczynaj od „• "). Zwróć WYŁĄCZNIE punkty, bez wstępu i zakończenia.',
        },
        { role: 'user', content: contents.slice(0, 4000) },
      ],
      200,
    );
    const out = text.trim();
    return out ? out.slice(0, 1000) : undefined;
  } catch {
    return undefined;
  }
}

function buildEmbed(
  feedName: string,
  it: FetchedItem,
  image?: string,
  desc?: string,
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle(`📰 ${feedName}: ${it.title}`.slice(0, 256))
    .setDescription((desc || '—').slice(0, 4096));
  if (it.url && /^https?:/i.test(it.url)) embed.setURL(it.url);
  if (image && /^https?:/i.test(image)) embed.setThumbnail(image);
  if (it.date) embed.setTimestamp(new Date(it.date * 1000));
  return embed;
}

type Payload = { content?: string; embeds: EmbedBuilder[]; threadName?: string };
// Publikacja na kanał tekstowy/głosowy (send) albo forum (nowy wątek). Zwraca wiadomość (do pin) lub null.
async function postTo(ch: GuildBasedChannel, p: Payload): Promise<Message | null> {
  if (ch.type === ChannelType.GuildForum) {
    const created = await (ch as ForumChannel).threads
      .create({
        name: (p.threadName || 'Aktualizacja').slice(0, 100),
        message: { content: p.content, embeds: p.embeds },
      })
      .catch(() => null);
    return created?.lastMessage ?? null;
  }
  if (ch.isTextBased())
    return (
      (await (ch as TextChannel)
        .send({ content: p.content, embeds: p.embeds })
        .catch(() => null)) ?? null
    );
  return null;
}

async function loadJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await cloudGetSetting(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

type DigestEntry = { name: string; title: string; url: string };

// Patch-notes dla JEDNEGO serwera (feeds + dedup per-serwer; `guild.channels.fetch` = izolacja kanału).
async function tickForGuild(guild: Guild, cache: Map<string, FetchedItem[]>): Promise<void> {
  const c = cfgFor(guild.id);
  if (!c.enabled) return;
  const feeds = feedsOf(c);
  if (!feeds.length) return;

  const seenKey = `g:${guild.id}:patchnotes_seen`;
  const digestKey = `g:${guild.id}:patchnotes_digest`;
  const seen = await loadJson<string[]>(seenKey, []);
  let buffer = c.digest === 'daily' ? await loadJson<DigestEntry[]>(digestKey, []) : [];
  let seenChanged = false;
  let bufChanged = false;

  for (const f of feeds) {
    const items = (await fetchFeed(f.source, cache)).slice().reverse(); // od najstarszej
    for (const it of items) {
      if (!it.id || seen.includes(it.id)) continue;
      if (c.digest === 'daily') {
        buffer.push({ name: f.name, title: it.title, url: it.url });
        seen.push(it.id);
        seenChanged = true;
        bufChanged = true;
        continue;
      }
      const chId = f.channelId || c.channelId;
      if (!chId) continue;
      const ch = await guild.channels.fetch(chId).catch(() => null);
      if (!ch) continue;
      const desc = (await summarize(it.contents, c)) ?? (strip(it.contents || '') || '—');
      const sent = await postTo(ch, {
        content: f.roleId ? `<@&${f.roleId}>` : undefined,
        embeds: [buildEmbed(f.name, it, f.image, desc)],
        threadName: `${f.name}: ${it.title}`,
      });
      if (f.pin && sent) await sent.pin().catch(() => {});
      seen.push(it.id);
      seenChanged = true;
    }
  }

  // Flush digestu: raz dziennie, gdy wybijemy zadaną godzinę UTC i bufor niepusty.
  if (c.digest === 'daily' && buffer.length) {
    const dayKey = `g:${guild.id}:patchnotes_digest_day`;
    const today = new Date().toISOString().slice(0, 10);
    const lastDay = await cloudGetSetting(dayKey).catch(() => null);
    if (new Date().getUTCHours() >= c.digestHour && lastDay !== today && c.channelId) {
      const ch = await guild.channels.fetch(c.channelId).catch(() => null);
      if (ch) {
        const lines = buffer
          .slice(0, 40)
          .map((b) => `• **${b.name}** — [${b.title || 'aktualizacja'}](${b.url})`)
          .join('\n')
          .slice(0, 4000);
        const embed = new EmbedBuilder()
          .setColor(0xe50914)
          .setTitle('📰 Codzienny digest patch-notes')
          .setDescription(lines || '—')
          .setTimestamp(new Date());
        await postTo(ch, { embeds: [embed] });
      }
      buffer = [];
      bufChanged = true;
      await cloudSetSetting(dayKey, today).catch(() => {});
    }
  }

  if (seenChanged) await cloudSetSetting(seenKey, JSON.stringify(seen.slice(-150))).catch(() => {});
  if (bufChanged)
    await cloudSetSetting(digestKey, JSON.stringify(buffer.slice(-100))).catch(() => {});
}

// Eksport dla testów izolacji (patchnotes.isolation.test.ts): jeden cykl pollera.
export async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  const cache = new Map<string, FetchedItem[]>();
  for (const guild of client.guilds.cache.values()) {
    await tickForGuild(guild, cache).catch(() => {});
  }
}

export function startPatchNotes(client: Client): void {
  if (!hasCloud()) {
    log.info('[patchnotes] brak chmury — patch-notes wyłączone.');
    return;
  }
  void tick(client).catch(() => {});
  setInterval(
    () => void tick(client).catch((e) => log.warn('[patchnotes]', { err: e })),
    3_600_000,
  );
  log.info('[patchnotes] patch-notes aktywne per-serwer (Steam + RSS, poll 1h, config z panelu).');
}
