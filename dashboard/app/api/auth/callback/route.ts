import { NextResponse } from 'next/server';
import {
  authConfig,
  exchangeCode,
  fetchDiscordUser,
  getOrigin,
  parseCookie,
  SESSION_COOKIE,
  STATE_COOKIE,
  selfServeEnabled,
} from '../../../../lib/auth';
import { enrollFromDiscord } from '../../../../lib/enroll';
import { resolveRole } from '../../../../lib/panelRoles';
import { captureError } from '../../../../lib/sentry';
import { signSession } from '../../../../lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const origin = getOrigin(request);
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookies = parseCookie(request.headers.get('cookie'));

  if (!code || !state || state !== cookies[STATE_COOKIE]) {
    return NextResponse.redirect(`${origin}/login?e=state`);
  }
  try {
    const tok = await exchangeCode(origin, code);
    const user = await fetchDiscordUser(tok.access_token);
    let role = await resolveRole(user.id);
    // M4 — self-serve (env-gated): nie-owner/staff, ale admin serwera z botem → wejście + enrollment.
    if (!role && selfServeEnabled()) {
      const enrolled = await enrollFromDiscord(user.id, tok.access_token);
      if (enrolled) role = 'admin';
    }
    if (!role) return NextResponse.redirect(`${origin}/login?e=denied`);

    const avatar = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
      : undefined;
    const token = await signSession(
      {
        uid: user.id,
        uname: user.global_name || user.username,
        avatar,
        role,
        exp: Date.now() + 7 * 24 * 3600 * 1000,
      },
      authConfig().secret,
    );
    const res = NextResponse.redirect(`${origin}/`);
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 3600,
      path: '/',
      secure: origin.startsWith('https'),
    });
    res.cookies.set(STATE_COOKIE, '', { maxAge: 0, path: '/' });
    return res;
  } catch (e) {
    // Cały łańcuch OAuth (token exchange / fetch usera / enrollment / sesja) ginął cicho → Sentry.
    await captureError(`OAuth callback: ${(e as Error).message}`, {
      label: 'auth-callback',
      stack: (e as Error)?.stack,
    });
    return NextResponse.redirect(`${origin}/login?e=oauth`);
  }
}
