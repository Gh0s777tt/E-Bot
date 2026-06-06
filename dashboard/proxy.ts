import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifySession } from './lib/session';

const SESSION_COOKIE = 'ebot_session';

function isOpen(pathname: string): boolean {
  return (
    pathname === '/login' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/img') ||
    pathname.startsWith('/api/twitch') || // webhook EventSub — Twitch woła bez sesji (auth = HMAC)
    pathname.startsWith('/api/health') || // healthcheck + cron „bot down" — monitor/Vercel bez sesji
    pathname === '/api/bot-status' || // status bota dla paska (czytany przez Topbar)
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    // pliki statyczne z public/ (logo, baner, favicon, fonty) — publiczne z natury,
    // muszą działać też dla niezalogowanych (strona /login ich używa)
    /\.(png|jpe?g|gif|webp|svg|ico|txt|xml|woff2?)$/.test(pathname)
  );
}

// Next 16: konwencja `proxy` zastępuje `middleware` (ten sam mechanizm: gating tras + redirect).
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isOpen(pathname)) return NextResponse.next();

  const secret = process.env.AUTH_SECRET || 'dev-insecure-secret-change-me';
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token, secret) : null;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
