// Faza 7 / F9.1 — patch-notes / aktualności gier ze Steam News API (publiczne, bez klucza).
// Config 'patchnotes_config' (lista appId + nazwa). Dedup w cloud setting 'patchnotes_seen'. Poll 1h.
import { type Client, EmbedBuilder, type TextChannel } from 'discord.js';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getSettings } from '../lib/db.mts';

type App = { appId: number; name: string };
type Cfg = { enabled: boolean; channelId: string; apps: App[] };
const DEFAULT: Cfg = { enabled: false, channelId: '', apps: [] };
let cfg: Cfg = { ...DEFAULT };

function refresh(): void {
  const raw = getSettings()['patchnotes_config'];
  try {
    cfg = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<Cfg>) } : { ...DEFAULT };
  } catch {
    /* zostaw poprzedni */
  }
}

type News = { gid: string; title: string; url: string; contents: string; date: number };

function strip(s: string): string {
  return s
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 400);
}

async function fetchNews(appId: number): Promise<News[]> {
  const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=3&maxlength=600`;
  const r = await fetch(url, { signal: AbortSignal.timeout(15_000) }).catch(() => null);
  if (!r?.ok) return [];
  const d = (await r.json().catch(() => ({}))) as {
    appnews?: { newsitems?: News[] };
  };
  return d.appnews?.newsitems ?? [];
}

async function tick(client: Client): Promise<void> {
  if (!cfg.enabled || !cfg.channelId || !cfg.apps.length || !hasCloud()) return;
  const ch = await client.channels.fetch(cfg.channelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) return;

  let seen: string[] = [];
  try {
    seen = JSON.parse((await cloudGetSetting('patchnotes_seen')) || '[]') as string[];
  } catch {
    /* pusta lista */
  }

  let changed = false;
  for (const app of cfg.apps.slice(0, 20)) {
    const items = (await fetchNews(app.appId)).reverse(); // od najstarszej
    for (const it of items) {
      if (!it.gid || seen.includes(it.gid)) continue;
      const embed = new EmbedBuilder()
        .setColor(0xe50914)
        .setTitle(`📰 ${app.name}: ${it.title}`.slice(0, 256))
        .setURL(it.url)
        .setDescription(strip(it.contents || '') || '—')
        .setTimestamp(new Date((it.date || 0) * 1000));
      await (ch as TextChannel).send({ embeds: [embed] }).catch(() => {});
      seen.push(it.gid);
      changed = true;
    }
  }
  if (changed) {
    await cloudSetSetting('patchnotes_seen', JSON.stringify(seen.slice(-100))).catch(() => {});
  }
}

export function startPatchNotes(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);
  if (!hasCloud()) {
    console.log('[patchnotes] brak chmury — patch-notes wyłączone.');
    return;
  }
  void tick(client).catch(() => {});
  setInterval(
    () => void tick(client).catch((e) => console.warn('[patchnotes]', (e as Error).message)),
    3_600_000,
  );
  console.log('[patchnotes] patch-notes Steam aktywne (poll 1h, config z panelu).');
}
