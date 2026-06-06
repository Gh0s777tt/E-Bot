import { NextResponse } from 'next/server';
import { getOrigin, SESSION_COOKIE } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const origin = getOrigin(request);
  const res = NextResponse.redirect(`${origin}/login`);
  res.cookies.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' });
  return res;
}
