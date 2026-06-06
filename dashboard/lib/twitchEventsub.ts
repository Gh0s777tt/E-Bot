// Helpery Twitch EventSub: app token (client_credentials) + dane streamu (dla ładnego embeda)
// + tworzenie wydarzenia Discord (Faza 6 / B4 — auto live-event na stream.online).
const HELIX = 'https://api.twitch.tv/helix';

// Tworzy zewnętrzne wydarzenie Discord (entity_type=3) wskazujące na live. Wymaga uprawnienia
// bota „Zarządzanie wydarzeniami" — przy braku zwraca null (graceful). Zwraca ID wydarzenia.
export async function createLiveDiscordEvent(opts: {
  guildId: string;
  name: string;
  url: string;
  description?: string;
}): Promise<string | null> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken || !opts.guildId) return null;
  const start = new Date(Date.now() + 2 * 60_000).toISOString();
  const end = new Date(Date.now() + 4 * 60 * 60_000).toISOString();
  try {
    const r = await fetch(`https://discord.com/api/v10/guilds/${opts.guildId}/scheduled-events`, {
      method: 'POST',
      headers: { Authorization: `Bot ${botToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: opts.name.slice(0, 100),
        privacy_level: 2,
        scheduled_start_time: start,
        scheduled_end_time: end,
        entity_type: 3,
        entity_metadata: { location: opts.url.slice(0, 100) },
        description: (opts.description || '').slice(0, 1000) || undefined,
      }),
    });
    if (!r.ok) return null;
    return ((await r.json()) as { id: string }).id ?? null;
  } catch {
    return null;
  }
}

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
