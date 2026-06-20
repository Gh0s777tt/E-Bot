// ── Nagłówki bezpieczeństwa (GameVault — stosowane do wszystkich tras) ───────
// Identyczna polityka jak w panelu: CSP z 'unsafe-inline' dla script/style
// (Next inline bootstrap), 'unsafe-eval'/'ws:' tylko w dev (HMR). frame-ancestors
// 'none' + X-Frame-Options = anty-clickjacking; HSTS, nosniff, Referrer-Policy,
// Permissions-Policy; object-src 'none' + base-uri 'self'.
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
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
