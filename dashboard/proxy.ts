import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAuthSecret, verifySession } from './lib/session';

const SESSION_COOKIE = 'ebot_session';

function isOpen(pathname: string): boolean {
  return (
    pathname === '/login' ||
    pathname === '/' || // root: gość → landing (page.tsx rozgałęzia), zalogowany → panel
    pathname.startsWith('/wiki') || // publiczne wiki projektu (z linkiem w stopce)
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/img') ||
    pathname.startsWith('/api/twitch') || // webhook EventSub — Twitch woła bez sesji (auth = HMAC)
    pathname === '/api/kofi' || // webhook Ko-fi — woła bez sesji (auth = verification_token); EXACT, nie prefix (by nie otworzyć /api/kofi-config)
    pathname === '/api/hook' || // generic incoming webhook — zewnętrzny serwis woła bez sesji (auth = token)
    pathname === '/api/sentry' || // raport błędów z error-boundary — może renderować się dla niezalogowanych
    pathname.startsWith('/api/health') || // healthcheck + cron „bot down" — monitor/Vercel bez sesji
    pathname === '/api/bot-status' || // status bota dla paska (czytany przez Topbar)
    pathname.startsWith('/p/') || // Tor M — publiczne profile/leaderboardy (bez logowania)
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    // pliki statyczne z public/ (logo, baner, favicon, fonty) — publiczne z natury,
    // muszą działać też dla niezalogowanych (strona /login ich używa)
    /\.(png|jpe?g|gif|webp|svg|ico|txt|xml|woff2?)$/.test(pathname)
  );
}

// CSP per-request z nonce — anty-XSS: script-src przez nonce + strict-dynamic zamiast 'unsafe-inline'.
// Next czyta nonce z nagłówka CSP ŻĄDANIA i nakłada na swoje skrypty; skrypt motywu w layout.tsx czyta
// `x-nonce`. style-src zostaje 'unsafe-inline' (Tailwind/Next inline-style — niski wektor XSS).
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production';
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self' https: wss:${isDev ? ' ws:' : ''}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

// Next 16: konwencja `proxy` zastępuje `middleware` (ten sam mechanizm: gating tras + redirect).
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set('x-nonce', nonce);
  reqHeaders.set('content-security-policy', csp); // Next bierze stąd nonce dla swoich skryptów
  const pass = () => {
    const r = NextResponse.next({ request: { headers: reqHeaders } });
    r.headers.set('Content-Security-Policy', csp);
    return r;
  };
  const withCsp = (r: NextResponse): NextResponse => {
    r.headers.set('Content-Security-Policy', csp);
    return r;
  };

  if (isOpen(pathname)) return pass();

  const secret = getAuthSecret();
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token, secret) : null;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return withCsp(NextResponse.redirect(url));
  }

  // Role: brak pola (legacy/owner sesja) → admin. Admin = pełen dostęp.
  // viewer = tylko odczyt (blokuj mutacje API). Sekcje adminowe = tylko admin.
  const role = session.role ?? 'admin';
  if (role !== 'admin') {
    const method = req.method.toUpperCase();
    const isMutation =
      method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
    const adminOnly = pathname.startsWith('/api/panel-staff') || pathname === '/api/config/import';
    if (adminOnly) {
      return withCsp(new NextResponse('Brak uprawnień (tylko admin).', { status: 403 }));
    }
    if (role === 'viewer' && isMutation && pathname.startsWith('/api/')) {
      return withCsp(new NextResponse('Tryb tylko do odczytu (rola: viewer).', { status: 403 }));
    }
  }
  return pass();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
