import { twitchToken } from './tokens.mts';
import type { LiveStatus } from './types.mts';

export async function getTwitchLive(login: string): Promise<LiveStatus> {
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
  const j = (await r.json()) as { data?: any[] };
  const s = j.data?.[0];
  if (!s) return { platform: 'twitch', live: false, channelName: login };
  return {
    platform: 'twitch',
    live: true,
    title: s.title,
    game: s.game_name,
    viewers: s.viewer_count,
    channelName: s.user_name ?? login,
    url: `https://twitch.tv/${login}`,
    thumbnail: String(s.thumbnail_url ?? '')
      .replace('{width}', '1280')
      .replace('{height}', '720'),
  };
}
