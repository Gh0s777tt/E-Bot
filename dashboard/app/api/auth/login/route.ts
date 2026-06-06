import { NextResponse } from 'next/server';
import { authorizeUrl, getOrigin, STATE_COOKIE } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const origin = getOrigin(request);
  const state = crypto.randomUUID();
  const res = NextResponse.redirect(authorizeUrl(origin, state));
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
    secure: origin.startsWith('https'),
  });
  return res;
}
