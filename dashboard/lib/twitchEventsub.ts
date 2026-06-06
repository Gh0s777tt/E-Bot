// Helpery Twitch EventSub: app token (client_credentials) + dane streamu (dla ładnego embeda).
const HELIX = 'https://api.twitch.tv/helix';

export function eventsubSecret(): string {
  return process.env.TWITCH_EVENTSUB_SECRET || '';
}

export async function getAppToken(): Promise<string> {
  const id = process.env.TWITCH_CLIENT_ID;
  const secret = process.env.TWITCH_CLIENT_SECRET;
  if (!id || !secret) throw new Error('brak TWITCH_CLIENT_ID/SECRET');
  const r = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${secret}&grant_type=client_credentials`,
    { method: 'POST' },
  );
  if (!r.ok) throw new Error(`twitch token ${r.status}`);
  return ((await r.json()) as { access_token: string }).access_token;
}

export async function getStreamInfo(
  login: string,
): Promise<{ title: string; game: string; thumbnail: string } | null> {
  try {
    const token = await getAppToken();
    const id = process.env.TWITCH_CLIENT_ID || '';
    const r = await fetch(`${HELIX}/streams?user_login=${encodeURIComponent(login)}`, {
      headers: { 'Client-Id': id, Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    const s = (
      (await r.json()) as { data: { title: string; game_name: string; thumbnail_url: string }[] }
    ).data?.[0];
    if (!s) return null;
    return {
      title: s.title,
      game: s.game_name,
      thumbnail: (s.thumbnail_url || '').replace('{width}', '1280').replace('{height}', '720'),
    };
  } catch {
    return null;
  }
}
