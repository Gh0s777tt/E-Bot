import { NextResponse } from 'next/server';
import { authorizeUrl, getOrigin, STATE_COOKIE } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const origin = getOrigin(request);
  // `next` — dokąd wrócić po logowaniu. TYLKO ścieżki względne (anty open-redirect). Używane przez
  // publiczny formularz odwołań (/p/appeal), żeby banowany wrócił do swojego odwołania po OAuth.
  const next = new URL(request.url).searchParams.get('next') ?? '';
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next.slice(0, 300) : '';
  const state = crypto.randomUUID();
  const res = NextResponse.redirect(authorizeUrl(origin, state));
  const opts = {
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 600,
    path: '/',
    secure: origin.startsWith('https'),
  };
  res.cookies.set(STATE_COOKIE, state, opts);
  if (safeNext) res.cookies.set('ebot_oauth_next', safeNext, opts);
  return res;
}
