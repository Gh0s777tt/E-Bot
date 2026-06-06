import type { LiveStatus } from './types.mts';

export async function getRumbleLive(apiUrl: string): Promise<LiveStatus> {
  const r = await fetch(apiUrl);
  const j = (await r.json()) as any;
  const s = j.livestreams?.[0];
  if (!s) return { platform: 'rumble', live: false, channelName: j.username };
  return {
    platform: 'rumble',
    live: true,
    title: s.title,
    channelName: j.username,
    viewers: s.watching_now ?? s.viewers,
    url: s.url ?? (s.link ? `https://rumble.com${s.link}` : undefined),
    thumbnail: typeof s.thumbnail === 'string' ? s.thumbnail : s.thumbnail?.url,
  };
}
