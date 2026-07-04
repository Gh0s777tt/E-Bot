import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { authorize, isPublicPath } from './lib/authz';
import { getAuthSecret, verifySession } from './lib/session';

const SESSION_COOKIE = 'ebot_session';

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

  // Szybka ścieżka publiczna — bez odczytu/weryfikacji sesji dla statyków/webhooków (jak dawny isOpen).
  if (isPublicPath(pathname)) return pass();

  const secret = getAuthSecret();
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token, secret) : null;

  const decision = authorize({
    pathname,
    method: req.method,
    hasSession: !!session,
    role: session?.role,
  });

  if (decision === 'public' || decision === 'allow') return pass();
  if (decision === 'redirect-login') {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return withCsp(NextResponse.redirect(url));
  }
  return withCsp(new NextResponse(decision.message, { status: decision.status }));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
