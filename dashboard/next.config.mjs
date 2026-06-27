// ── Nagłówki bezpieczeństwa (stosowane do wszystkich tras) ───────────────────
// CSP jest ustawiane PER-REQUEST z nonce w proxy.ts (script-src przez nonce + strict-dynamic zamiast
// 'unsafe-inline' — anty-XSS; skrypt motywu w layout.tsx dostaje nonce z `x-nonce`). style-src zostaje
// 'unsafe-inline' (Tailwind/Next inline-style, niski wektor XSS). 'unsafe-eval'/'ws:' tylko w dev (HMR).
// X-Frame-Options = anty-clickjacking; HSTS, nosniff, Referrer-Policy, Permissions-Policy poniżej.
const securityHeaders = [
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
