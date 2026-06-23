import { kickToken } from './tokens.mts';
import type { LiveStatus } from './types.mts';

// Czysty parser odpowiedzi Kick channels → LiveStatus. UWAGA: kanał ISTNIEJE zawsze — o transmisji
// decyduje WYŁĄCZNIE `stream.is_live` (offline → live:false, ale channelName=slug zostaje). Niezaufany
// kształt JSON (`?.`) → bez wyjątku; puste `game`/`thumbnail` → undefined (nie pusty string).
export function parseKickLive(j: unknown, slug: string): LiveStatus {
  const c = (j as { data?: any[] })?.data?.[0];
  if (!c?.stream?.is_live) return { platform: 'kick', live: false, channelName: slug };
  return {
    platform: 'kick',
    live: true,
    title: c.stream_title,
    game: c.category?.name || undefined,
    viewers: c.stream.viewer_count,
    channelName: slug,
    url: `https://kick.com/${slug}`,
    thumbnail: c.stream.thumbnail || undefined,
  };
}

export async function getKickLive(slug: string): Promise<LiveStatus> {
  const token = await kickToken();
  const r = await fetch(
    `https://api.kick.com/public/v1/channels?slug=${encodeURIComponent(slug)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return parseKickLive(await r.json(), slug);
}
