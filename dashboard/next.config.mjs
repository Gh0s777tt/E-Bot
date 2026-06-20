// ── Nagłówki bezpieczeństwa (stosowane do wszystkich tras) ───────────────────
// CSP celowo dopuszcza 'unsafe-inline' dla script/style (Next wstrzykuje inline
// bootstrap + skrypt motywu w layout.tsx; pełne CSP z nonce to osobny, większy
// krok). 'unsafe-eval'/'ws:' tylko w dev (HMR Next). frame-ancestors 'none' +
// X-Frame-Options = anty-clickjacking; do tego HSTS, nosniff, Referrer-Policy,
// Permissions-Policy. object-src 'none' + base-uri 'self' domykają wektory CSP.
const isDev = process.env.NODE_ENV !== 'production';
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
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

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

/** @type {import('next').NextConfig} */
export default {
  // React Compiler 1.0 — automatyczna memoizacja (mniej zbędnych re-renderów).
  reactCompiler: true,
  // Allowlist zdalnych hostów obrazów — fundament pod migrację <img> → next/image (dziś NIEAKTYWNE:
  // komponenty używają jeszcze <img>). Discord (awatary/ikony), IGDB (okładki wishlist), Steam (okładki).
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
      { protocol: 'https', hostname: 'images.igdb.com' },
      { protocol: 'https', hostname: '**.steamstatic.com' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
