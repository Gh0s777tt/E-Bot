import { twitchToken } from './tokens.mts';
import type { LiveStatus } from './types.mts';

// Czysty parser odpowiedzi Twitch helix/streams → LiveStatus. Brak `data[0]` = NIE live (channelName
// z `login` zostaje). KLUCZ: thumbnail z API ma PLACEHOLDERY `{width}`/`{height}` — MUSZĄ być podmienione
// na wymiary (1280×720), inaczej URL miniatury jest niepoprawny (404). channelName: `user_name ?? login`.
export function parseTwitchLive(j: unknown, login: string): LiveStatus {
  const s = (j as { data?: any[] })?.data?.[0];
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
  return parseTwitchLive(await r.json(), login);
}
