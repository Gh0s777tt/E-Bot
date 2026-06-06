// App-tokeny (client_credentials) z cache do wygaśnięcia.
type Cached = { token: string; exp: number };

let tw: Cached | null = null;
let kk: Cached | null = null;

export async function twitchToken(): Promise<string> {
  if (tw && tw.exp > Date.now() + 60_000) return tw.token;
  const id = process.env.TWITCH_CLIENT_ID;
  const secret = process.env.TWITCH_CLIENT_SECRET;
  const r = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${secret}&grant_type=client_credentials`,
    { method: 'POST' },
  );
  const j = (await r.json()) as { access_token: string; expires_in: number };
  tw = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return tw.token;
}

export async function kickToken(): Promise<string> {
  if (kk && kk.exp > Date.now() + 60_000) return kk.token;
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
  const j = (await r.json()) as { access_token: string; expires_in: number };
  kk = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return kk.token;
}
