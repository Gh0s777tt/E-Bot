// Faza 8 — powiadomienia o nowych postach z social (TikTok/IG/FB/Threads/X/YouTube/blog) przez RSS.
// Discord/te platformy nie dają darmowego API „nowy post" → uniwersalnie: user podaje URL RSS/Atom
// (np. z rss.app, nitter-bridge, kanału YouTube), bot pobiera i ogłasza nowe wpisy. Config
// 'social_feeds_config' (PER-SERWER). Dedup PER-SERWER 'g:<id>:social_feeds_seen'. Poll co 10 min.
// Feedy różnią się per-serwer → fetch per-guild. Pierwszy przebieg danego feedu = tylko seed (bez spamu).
import type { Client, Guild, TextChannel } from 'discord.js';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { parseFeed } from '../lib/rss.mts';

type Feed = { url: string; label: string };
type Cfg = { enabled: boolean; channelId: string; message: string; feeds: Feed[] };
const DEFAULT: Cfg = {
  enabled: false,
  channelId: '',
  message: '📣 Nowy post od **{label}**: {title}\n{link}',
  feeds: [],
};

export function cfgFor(guildId: string): Cfg {
  const raw = getGuildSettings(guildId)['social_feeds_config'];
  try {
    const c = raw ? (JSON.parse(raw) as Partial<Cfg>) : {};
    return { ...DEFAULT, ...c, feeds: Array.isArray(c.feeds) ? c.feeds : [] };
  } catch {
    return { ...DEFAULT };
  }
}

// Feedy JEDNEGO serwera (config + dedup per-serwer; `guild.channels.fetch` = izolacja kanału).
async function tickForGuild(guild: Guild): Promise<void> {
  const cfg = cfgFor(guild.id);
  if (!cfg.enabled || !cfg.channelId || !cfg.feeds.length) return;
  const ch = await guild.channels.fetch(cfg.channelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) return;

  const seenKey = `g:${guild.id}:social_feeds_seen`;
  let seen: string[] = [];
  try {
    seen = JSON.parse((await cloudGetSetting(seenKey)) || '[]') as string[];
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
  if (changed) {
    await cloudSetSetting(seenKey, JSON.stringify([...seenSet].slice(-500))).catch(() => {});
  }
}

// Eksport dla testów izolacji (social.isolation.test.ts): jeden cykl pollera.
export async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  for (const guild of client.guilds.cache.values()) {
    await tickForGuild(guild).catch(() => {});
  }
}

export function startSocialFeeds(client: Client): void {
  if (!hasCloud()) {
    log.info('[social] brak chmury — powiadomienia social wyłączone.');
    return;
  }
  void tick(client).catch(() => {});
  setInterval(() => void tick(client).catch((e) => log.warn('[social]', { err: e })), 10 * 60_000);
  log.info(
    '[social] powiadomienia social (RSS) aktywne per-serwer (poll 10 min, config z panelu).',
  );
}
