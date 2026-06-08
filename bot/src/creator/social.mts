// Faza 8 — powiadomienia o nowych postach z social (TikTok/IG/FB/Threads/X/YouTube/blog) przez RSS.
// Discord/te platformy nie dają darmowego API „nowy post" → uniwersalnie: user podaje URL RSS/Atom
// (np. z rss.app, nitter-bridge, kanału YouTube), bot pobiera i ogłasza nowe wpisy. Config
// 'social_feeds_config'. Dedup w cloud 'social_feeds_seen'. Poll co 10 min. Pierwszy przebieg
// danego feedu = tylko seed (bez spamu historią).
import type { Client, TextChannel } from 'discord.js';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getSettings } from '../lib/db.mts';

type Feed = { url: string; label: string };
type Cfg = { enabled: boolean; channelId: string; message: string; feeds: Feed[] };
const DEFAULT: Cfg = {
  enabled: false,
  channelId: '',
  message: '📣 Nowy post od **{label}**: {title}\n{link}',
  feeds: [],
};
let cfg: Cfg = { ...DEFAULT };

function refresh(): void {
  const raw = getSettings()['social_feeds_config'];
  try {
    const c = raw ? (JSON.parse(raw) as Partial<Cfg>) : {};
    cfg = { ...DEFAULT, ...c, feeds: Array.isArray(c.feeds) ? c.feeds : [] };
  } catch {
    /* zostaw poprzedni */
  }
}

type Item = { id: string; title: string; link: string };

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}
function firstTag(block: string, tag: string): string {
  const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(block);
  return m?.[1] ? decode(m[1]) : '';
}
function atomLink(block: string): string {
  const m = /<link[^>]*href="([^"]+)"/i.exec(block);
  return m?.[1] ?? '';
}

function parseFeed(xml: string): Item[] {
  const items: Item[] = [];
  const blocks = xml.match(/<(item|entry)[\s\S]*?<\/(?:item|entry)>/gi) ?? [];
  for (const b of blocks.slice(0, 10)) {
    const title = firstTag(b, 'title');
    let link = firstTag(b, 'link');
    if (!link || link.length > 500 || !/^https?:/i.test(link)) link = atomLink(b);
    const guid = firstTag(b, 'guid') || firstTag(b, 'id') || link || title;
    if (title) items.push({ id: guid.slice(0, 200), title: title.slice(0, 300), link });
  }
  return items;
}

async function tick(client: Client): Promise<void> {
  if (!cfg.enabled || !cfg.channelId || !cfg.feeds.length || !hasCloud()) return;
  const ch = await client.channels.fetch(cfg.channelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) return;

  let seen: string[] = [];
  try {
    seen = JSON.parse((await cloudGetSetting('social_feeds_seen')) || '[]') as string[];
  } catch {
    /* pusta lista */
  }
  const seenSet = new Set(seen);
  let changed = false;

  for (const feed of cfg.feeds.slice(0, 15)) {
    if (!feed.url) continue;
    const r = await fetch(feed.url, {
      signal: AbortSignal.timeout(15_000),
      headers: { 'User-Agent': 'E-Bot/1.0 (+rss)' },
    }).catch(() => null);
    if (!r?.ok) continue;
    const xml = await r.text().catch(() => '');
    const items = parseFeed(xml);
    const firstRun = !seen.some((k) => k.startsWith(`${feed.url}::`));
    for (const it of items) {
      const key = `${feed.url}::${it.id}`;
      if (seenSet.has(key)) continue;
      seenSet.add(key);
      changed = true;
      if (firstRun) continue; // pierwszy raz: tylko zapamiętaj, nie spamuj historią
      const text = (cfg.message || '{title} {link}')
        .replaceAll('{label}', feed.label || 'social')
        .replaceAll('{title}', it.title)
        .replaceAll('{link}', it.link);
      await (ch as TextChannel)
        .send({ content: text.slice(0, 2000), allowedMentions: { parse: [] } })
        .catch(() => {});
    }
  }
  if (changed)
    await cloudSetSetting('social_feeds_seen', JSON.stringify([...seenSet].slice(-500))).catch(
      () => {},
    );
}

export function startSocialFeeds(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);
  if (!hasCloud()) {
    console.log('[social] brak chmury — powiadomienia social wyłączone.');
    return;
  }
  void tick(client).catch(() => {});
  setInterval(
    () => void tick(client).catch((e) => console.warn('[social]', (e as Error).message)),
    10 * 60_000,
  );
  console.log('[social] powiadomienia social (RSS) aktywne (poll 10 min, config z panelu).');
}
