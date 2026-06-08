// Statystyki streamerów (Twitch/Kick) dla liczników kanałów.
// • Twitch WIDZOWIE (live) + Kick FOLLOWY/WIDZOWIE → token aplikacyjny (client_credentials), już używany do live.
// • Twitch FOLLOWY/SUBY → wymagają USER-tokena twórcy w env TWITCH_USER_TOKEN
//   (scope moderator:read:followers dla followów, channel:read:subscriptions dla subów).
// Degradacja jak w YouTube: brak tokena/danych → null → licznik nie jest aktualizowany (nie zeruje nazwy).
import { kickToken, twitchToken } from '../live/tokens.mts';

export type StreamerType = 'twFollowers' | 'twSubs' | 'twViewers' | 'kickFollowers' | 'kickViewers';
export const STREAMER_TYPES = new Set<StreamerType>([
  'twFollowers',
  'twSubs',
  'twViewers',
  'kickFollowers',
  'kickViewers',
]);

const TTL = 300_000; // 5 min
const metric = new Map<string, { val: number; ts: number }>();
const twIdCache = new Map<string, string>();

async function twitchUserId(login: string): Promise<string | null> {
  const cached = twIdCache.get(login);
  if (cached) return cached;
  try {
    const token = await twitchToken();
    const r = await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`, {
      headers: {
        'Client-Id': process.env.TWITCH_CLIENT_ID ?? '',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { data?: { id?: string }[] };
    const id = j.data?.[0]?.id ?? null;
    if (id) twIdCache.set(login, id);
    return id;
  } catch {
    return null;
  }
}

async function twitchTotal(login: string, path: string): Promise<number | null> {
  const userToken = process.env.TWITCH_USER_TOKEN;
  if (!userToken) return null; // brak tokena twórcy → degraduj
  const id = await twitchUserId(login);
  if (!id) return null;
  try {
    const r = await fetch(`https://api.twitch.tv/helix/${path}?broadcaster_id=${id}&first=1`, {
      headers: {
        'Client-Id': process.env.TWITCH_CLIENT_ID ?? '',
        Authorization: `Bearer ${userToken}`,
      },
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { total?: number };
    return typeof j.total === 'number' ? j.total : null;
  } catch {
    return null;
  }
}

async function twitchViewers(login: string): Promise<number | null> {
  try {
    const token = await twitchToken();
    const r = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(login)}`,
      {
        headers: {
          'Client-Id': process.env.TWITCH_CLIENT_ID ?? '',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!r.ok) return null;
    const j = (await r.json()) as { data?: { viewer_count?: number }[] };
    return j.data?.[0]?.viewer_count ?? 0; // offline → 0
  } catch {
    return null;
  }
}

type KickCh = { followers: number; viewers: number };
const kickCache = new Map<string, { data: KickCh; ts: number }>();

async function kickChannel(slug: string): Promise<KickCh | null> {
  const c = kickCache.get(slug);
  if (c && Date.now() - c.ts < TTL) return c.data;
  try {
    const token = await kickToken();
    const r = await fetch(
      `https://api.kick.com/public/v1/channels?slug=${encodeURIComponent(slug)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!r.ok) return c?.data ?? null;
    const j = (await r.json()) as {
      data?: {
        followers_count?: number;
        follower_count?: number;
        stream?: { is_live?: boolean; viewer_count?: number };
      }[];
    };
    const ch = j.data?.[0];
    if (!ch) return c?.data ?? null;
    const data: KickCh = {
      followers: ch.followers_count ?? ch.follower_count ?? 0,
      viewers: ch.stream?.is_live ? (ch.stream.viewer_count ?? 0) : 0,
    };
    kickCache.set(slug, { data, ts: Date.now() });
    return data;
  } catch {
    return c?.data ?? null;
  }
}

export async function streamerCount(type: StreamerType, arg?: string): Promise<number | null> {
  const isTwitch = type.startsWith('tw');
  const channel = arg || (isTwitch ? process.env.TWITCH_CHANNEL : process.env.KICK_CHANNEL) || '';
  if (!channel) return null;

  const key = `${type}:${channel}`;
  const cached = metric.get(key);
  if (cached && Date.now() - cached.ts < TTL) return cached.val;

  let val: number | null = null;
  switch (type) {
    case 'twFollowers':
      val = await twitchTotal(channel, 'channels/followers');
      break;
    case 'twSubs':
      val = await twitchTotal(channel, 'subscriptions');
      break;
    case 'twViewers':
      val = await twitchViewers(channel);
      break;
    case 'kickFollowers': {
      const k = await kickChannel(channel);
      val = k ? k.followers : null;
      break;
    }
    case 'kickViewers': {
      const k = await kickChannel(channel);
      val = k ? k.viewers : null;
      break;
    }
  }
  if (val === null) return cached ? cached.val : null; // błąd → trzymaj ostatnią dobrą wartość
  metric.set(key, { val, ts: Date.now() });
  return val;
}
