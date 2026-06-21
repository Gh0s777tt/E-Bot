// Faza 7 / F9.1 — patch-notes / aktualności gier ze Steam News API (publiczne, bez klucza).
// Config 'patchnotes_config' (PER-SERWER: lista appId + nazwa). Dedup PER-SERWER 'g:<id>:patchnotes_seen'.
// Apps różnią się per-serwer → fetch per-guild. Poll 1h.
import { type Client, EmbedBuilder, type Guild, type TextChannel } from 'discord.js';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';

type App = { appId: number; name: string };
type Cfg = { enabled: boolean; channelId: string; apps: App[] };
const DEFAULT: Cfg = { enabled: false, channelId: '', apps: [] };
function cfgFor(guildId: string): Cfg {
  const raw = getGuildSettings(guildId)['patchnotes_config'];
  try {
    return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<Cfg>) } : { ...DEFAULT };
  } catch {
    return { ...DEFAULT };
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

// Patch-notes dla JEDNEGO serwera (apps + dedup per-serwer; `guild.channels.fetch` = izolacja kanału).
async function tickForGuild(guild: Guild): Promise<void> {
  const c = cfgFor(guild.id);
  if (!c.enabled || !c.channelId || !c.apps.length) return;
  const ch = await guild.channels.fetch(c.channelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) return;

  const seenKey = `g:${guild.id}:patchnotes_seen`;
  let seen: string[] = [];
  try {
    seen = JSON.parse((await cloudGetSetting(seenKey)) || '[]') as string[];
  } catch {
    /* pusta lista */
  }

  let changed = false;
  for (const app of c.apps.slice(0, 20)) {
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
  if (changed) await cloudSetSetting(seenKey, JSON.stringify(seen.slice(-100))).catch(() => {});
}

async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  for (const guild of client.guilds.cache.values()) {
    await tickForGuild(guild).catch(() => {});
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
  log.info('[patchnotes] patch-notes Steam aktywne per-serwer (poll 1h, config z panelu).');
}
