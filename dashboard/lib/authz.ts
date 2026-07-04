// Czysta logika autoryzacji tras panelu — wydzielona z proxy.ts (Next 16), by dało się ją
// przetestować bez uruchamiania frameworka (proxy.ts ciągnie next/server). proxy() jest teraz
// cienką powłoką: woła authorize() i wykonuje efekt (pass / redirect / 403) + nakłada CSP.
// KAŻDA zmiana tu = zmiana bramki bezpieczeństwa całego panelu → pilnowane testem authz.test.ts.

// Ścieżki publiczne (bez sesji). Kolejność/decyzje muszą być identyczne z historycznym isOpen.
// UWAGA: /api/kofi i /api/hook są EXACT (nie prefix) — inaczej otworzyłyby /api/kofi-config itd.
export function isPublicPath(pathname: string): boolean {
  return (
    pathname === '/login' ||
    pathname === '/' || // root: gość → landing (page.tsx rozgałęzia), zalogowany → panel
    pathname.startsWith('/wiki') || // publiczne wiki projektu (z linkiem w stopce)
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/img') ||
    pathname.startsWith('/api/twitch') || // webhook EventSub — Twitch woła bez sesji (auth = HMAC)
    pathname === '/api/kofi' || // webhook Ko-fi (auth = verification_token); EXACT, nie prefix
    pathname === '/api/hook' || // generic incoming webhook (auth = token)
    pathname === '/api/sentry' || // raport błędów z error-boundary (niezalogowani też)
    pathname.startsWith('/api/health') || // healthcheck + cron „bot down"
    pathname === '/api/bot-status' || // status bota dla paska (Topbar)
    pathname.startsWith('/p/') || // Tor M — publiczne profile/leaderboardy
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    /\.(png|jpe?g|gif|webp|svg|ico|txt|xml|woff2?)$/.test(pathname) // statyczne z public/
  );
}

export type AuthzInput = {
  pathname: string;
  method: string;
  hasSession: boolean;
  role: string | undefined; // brak (legacy/owner) → traktowane jak 'admin'
};

// 'public' = przepuść bez sesji · 'redirect-login' = brak sesji na chronionej · 'allow' = zalogowany OK ·
// { status, message } = odmowa (403) mimo sesji (zła rola).
export type AuthzResult =
  | 'public'
  | 'redirect-login'
  | 'allow'
  | { status: number; message: string };

const MUTATIONS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function authorize(inp: AuthzInput): AuthzResult {
  if (isPublicPath(inp.pathname)) return 'public';
  if (!inp.hasSession) return 'redirect-login';

  // Role: brak pola (legacy/owner) → admin (pełen dostęp). viewer = tylko odczyt.
  const role = inp.role ?? 'admin';
  if (role !== 'admin') {
    const isMutation = MUTATIONS.has(inp.method.toUpperCase());
    const adminOnly =
      inp.pathname.startsWith('/api/panel-staff') || inp.pathname === '/api/config/import';
    if (adminOnly) return { status: 403, message: 'Brak uprawnień (tylko admin).' };
    if (role === 'viewer' && isMutation && inp.pathname.startsWith('/api/')) {
      return { status: 403, message: 'Tryb tylko do odczytu (rola: viewer).' };
    }
  }
  return 'allow';
}
