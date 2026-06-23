import type { LiveStatus } from './types.mts';

// Czysty parser odpowiedzi Rumble → LiveStatus. Brak `livestreams[0]` = NIE live (channelName z
// `username` zostaje też offline). Fallbacki na niespójny kształt API: widzowie `watching_now ?? viewers`,
// URL `url` ALBO zbudowany z względnego `link`, thumbnail może być stringiem LUB obiektem `{url}`.
export function parseRumbleLive(j: unknown): LiveStatus {
  const d = j as any;
  const s = d?.livestreams?.[0];
  if (!s) return { platform: 'rumble', live: false, channelName: d?.username };
  return {
    platform: 'rumble',
    live: true,
    title: s.title,
    channelName: d?.username,
    viewers: s.watching_now ?? s.viewers,
    url: s.url ?? (s.link ? `https://rumble.com${s.link}` : undefined),
    thumbnail: typeof s.thumbnail === 'string' ? s.thumbnail : s.thumbnail?.url,
  };
}

export async function getRumbleLive(apiUrl: string): Promise<LiveStatus> {
  const r = await fetch(apiUrl);
  return parseRumbleLive(await r.json());
}
