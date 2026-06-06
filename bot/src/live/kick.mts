import { kickToken } from './tokens.mts';
import type { LiveStatus } from './types.mts';

export async function getKickLive(slug: string): Promise<LiveStatus> {
  const token = await kickToken();
  const r = await fetch(`https://api.kick.com/public/v1/channels?slug=${encodeURIComponent(slug)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const j = (await r.json()) as { data?: any[] };
  const c = j.data?.[0];
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
