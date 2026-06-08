// Discord OAuth2 (scope: identify) + whitelist właściciela.
import { getAuthSecret } from './session';

export const SESSION_COOKIE = 'ebot_session';
export const STATE_COOKIE = 'ebot_oauth_state';

export function authConfig() {
  return {
    clientId: process.env.DISCORD_CLIENT_ID || '',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    secret: getAuthSecret(),
    owners: (process.env.DASHBOARD_OWNER_IDS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export function getOrigin(request: Request): string {
  const h = request.headers;
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3001';
  const proto = h.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export function parseCookie(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  (header || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

export function authorizeUrl(origin: string, state: string): string {
  const c = authConfig();
  const params = new URLSearchParams({
    client_id: c.clientId,
    redirect_uri: `${origin}/api/auth/callback`,
    response_type: 'code',
    scope: 'identify',
    state,
    prompt: 'consent',
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCode(
  origin: string,
  code: string,
): Promise<{ access_token: string }> {
  const c = authConfig();
  const body = new URLSearchParams({
    client_id: c.clientId,
    client_secret: c.clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: `${origin}/api/auth/callback`,
  });
  const r = await fetch('https://discord.com/api/v10/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!r.ok) throw new Error(`token exchange ${r.status}: ${await r.text()}`);
  return (await r.json()) as { access_token: string };
}

export async function fetchDiscordUser(
  accessToken: string,
): Promise<{ id: string; username: string; global_name?: string; avatar?: string | null }> {
  const r = await fetch('https://discord.com/api/v10/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) throw new Error(`user fetch ${r.status}`);
  return (await r.json()) as {
    id: string;
    username: string;
    global_name?: string;
    avatar?: string | null;
  };
}
