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
  // Anty host-header poisoning OAuth (opt-in): gdy DASHBOARD_ALLOWED_HOSTS ustawione, host MUSI być
  // na liście — inaczej fallback na pierwszy dozwolony (atakujący nie wpłynie na redirect_uri/callback).
  // Bez env = zachowanie sprzed zmiany (zero regresji dla istniejących wdrożeń).
  const allowed = (process.env.DASHBOARD_ALLOWED_HOSTS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.length > 0 && !allowed.includes(host)) {
    const fb = allowed[0];
    return `${fb.includes('localhost') ? 'http' : 'https'}://${fb}`;
  }
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
    scope: selfServeEnabled() ? 'identify guilds' : 'identify',
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

// ── M4 — self-serve multi-tenant (env-gated) ────────────────────────────────
// Gdy włączone, admini serwerów (MANAGE_GUILD) mogą logować się do panelu i zarządzać
// SWOIM serwerem (izolacja przez guild_members + chokepoint getPrimaryGuildId). Domyślnie
// WYŁĄCZONE — panel pozostaje jednowłaścicielski (owner/staff). Aktywacja: env
// MARKETPLACE_SELF_SERVE=1 (wtedy OAuth prosi dodatkowo o scope `guilds`).
export function selfServeEnabled(): boolean {
  const v = process.env.MARKETPLACE_SELF_SERVE;
  return v === '1' || v === 'true';
}

export const MANAGE_GUILD = 0x20n; // bit uprawnienia „Zarządzanie serwerem" (Manage Guild)

export type UserGuild = { id: string; name: string; owner?: boolean; permissions?: string };

// Serwery użytkownika z OAuth (scope `guilds`). Pusto przy błędzie / braku scope.
export async function fetchUserGuilds(accessToken: string): Promise<UserGuild[]> {
  try {
    const r = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!r.ok) return [];
    return (await r.json()) as UserGuild[];
  } catch {
    return [];
  }
}

// Czy user może zarządzać serwerem (właściciel serwera lub uprawnienie MANAGE_GUILD).
export function canManageGuild(g: UserGuild): boolean {
  if (g.owner) return true;
  try {
    return (BigInt(g.permissions ?? '0') & MANAGE_GUILD) !== 0n;
  } catch {
    return false;
  }
}
