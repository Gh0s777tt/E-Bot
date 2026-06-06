import { existsSync } from 'node:fs';
import path from 'node:path';

let envLoaded = false;
function ensureEnv(): void {
  if (envLoaded) return;
  envLoaded = true;
  const c = [path.join(process.cwd(), '..', '.env'), path.join(process.cwd(), '.env')];
  const f = c.find((p) => existsSync(p));
  if (f) {
    try {
      (process as unknown as { loadEnvFile: (p: string) => void }).loadEnvFile(f);
    } catch {
      /* Vercel: env ze zmiennych projektu */
    }
  }
}

export type Live = {
  platform: 'twitch' | 'kick' | 'youtube' | 'rumble';
  label: string;
  channel: string;
  color: string;
  configured: boolean;
  live: boolean;
  title?: string;
  game?: string;
  viewers?: number;
  url?: string;
  thumbnail?: string;
};

const COLORS = { twitch: '#9146FF', kick: '#53FC18', youtube: '#FF0000', rumble: '#85C742' };

let twTok: { t: string; exp: number } | null = null;
let kkTok: { t: string; exp: number } | null = null;

async function twitchToken(): Promise<string> {
  if (twTok && twTok.exp > Date.now() + 60_000) return twTok.t;
  const r = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' },
  );
  const j = (await r.json()) as any;
  twTok = { t: j.access_token, exp: Date.now() + (j.expires_in ?? 3600) * 1000 };
  return twTok.t;
}
async function kickToken(): Promise<string> {
  if (kkTok && kkTok.exp > Date.now() + 60_000) return kkTok.t;
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.KICK_CLIENT_ID ?? '',
    client_secret: process.env.KICK_CLIENT_SECRET ?? '',
  });
  const r = await fetch('https://id.kick.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const j = (await r.json()) as any;
  kkTok = { t: j.access_token, exp: Date.now() + (j.expires_in ?? 3600) * 1000 };
  return kkTok.t;
}

async function twitch(): Promise<Live> {
  const channel = process.env.TWITCH_CHANNEL ?? '';
  const base: Live = {
    platform: 'twitch', label: 'Twitch', channel, color: COLORS.twitch,
    configured: !!(process.env.TWITCH_CLIENT_ID && channel), live: false,
    url: channel ? `https://twitch.tv/${channel}` : undefined,
  };
  if (!base.configured) return base;
  try {
    const tok = await twitchToken();
    const r = await fetch(`https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(channel)}`, {
      headers: { 'Client-Id': process.env.TWITCH_CLIENT_ID!, Authorization: `Bearer ${tok}` },
      cache: 'no-store',
    });
    const s = ((await r.json()) as any).data?.[0];
    if (s) return { ...base, live: true, title: s.title, game: s.game_name, viewers: s.viewer_count, thumbnail: String(s.thumbnail_url ?? '').replace('{width}', '640').replace('{height}', '360') };
  } catch { /* offline */ }
  return base;
}
async function kick(): Promise<Live> {
  const channel = process.env.KICK_CHANNEL ?? '';
  const base: Live = {
    platform: 'kick', label: 'Kick', channel, color: COLORS.kick,
    configured: !!(process.env.KICK_CLIENT_ID && channel), live: false,
    url: channel ? `https://kick.com/${channel}` : undefined,
  };
  if (!base.configured) return base;
  try {
    const tok = await kickToken();
    const r = await fetch(`https://api.kick.com/public/v1/channels?slug=${encodeURIComponent(channel)}`, {
      headers: { Authorization: `Bearer ${tok}` }, cache: 'no-store',
    });
    const c = ((await r.json()) as any).data?.[0];
    if (c?.stream?.is_live) return { ...base, live: true, title: c.stream_title, game: c.category?.name || undefined, viewers: c.stream.viewer_count, thumbnail: c.stream.thumbnail || undefined };
  } catch { /* offline */ }
  return base;
}
async function rumble(): Promise<Live> {
  const url = process.env.RUMBLE_LIVESTREAM_API_URL ?? '';
  const base: Live = { platform: 'rumble', label: 'Rumble', channel: '', color: COLORS.rumble, configured: !!url, live: false };
  if (!base.configured) return base;
  try {
    const j = (await (await fetch(url, { cache: 'no-store' })).json()) as any;
    base.channel = j.username ?? '';
    const s = j.livestreams?.[0];
    if (s) return { ...base, live: true, title: s.title, viewers: s.watching_now ?? s.viewers, url: s.url ?? (s.link ? `https://rumble.com${s.link}` : undefined), thumbnail: typeof s.thumbnail === 'string' ? s.thumbnail : s.thumbnail?.url };
  } catch { /* offline */ }
  return base;
}
async function youtube(): Promise<Live> {
  const ch = process.env.YOUTUBE_LIVE_CHANNEL_ID ?? '';
  const key = process.env.YOUTUBE_API_KEY ?? '';
  const base: Live = { platform: 'youtube', label: 'YouTube', channel: ch, color: COLORS.youtube, configured: !!(key && ch), live: false };
  if (!base.configured) return base;
  try {
    const j = (await (await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${ch}&eventType=live&type=video&maxResults=1&key=${key}`, { cache: 'no-store' })).json()) as any;
    const item = j.items?.[0];
    if (item) return { ...base, live: true, title: item.snippet?.title, url: `https://youtube.com/watch?v=${item.id?.videoId}`, thumbnail: item.snippet?.thumbnails?.high?.url };
  } catch { /* offline */ }
  return base;
}

export async function getLiveStatuses(): Promise<Live[]> {
  ensureEnv();
  return Promise.all([twitch(), kick(), rumble(), youtube()]);
}
