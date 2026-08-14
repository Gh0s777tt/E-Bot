// Proxy/cache okładek: przeglądarka pobiera z origin (Next), serwer ściąga z CDN — działa też tam,
// gdzie przeglądarka nie ma dostępu do CDN. Whitelist hostów = ochrona przed SSRF. Cache na BRZEGU
// Vercela (s-maxage per unikalny `?u=`) + stale-while-revalidate → mniej uderzeń w CDN gier.
// Kształt pliku trzymamy 1:1 z dashboard/app/api/img/route.ts (ten sam hardening po obu stronach).
import { clientIp, rateLimited } from '../../../lib/rateLimit';

export const runtime = 'nodejs'; // deterministyczne redirect:'manual' + AbortSignal (audyt C-3)

const ALLOW = new Set([
  'cdn.cloudflare.steamstatic.com',
  'shared.cloudflare.steamstatic.com',
  'cdn.akamai.steamstatic.com',
  'images.igdb.com',
  'image.api.playstation.com',
  'psnobj.prod.dl.playstation.net',
]);

const TIMEOUT_MS = 8000;
const MAX_BYTES = 12 * 1024 * 1024; // okładki są małe; limit anty-nadużycie (open-relay)
const MAX_REDIRECTS = 3;
// Trasa jest PUBLICZNA i pobiera z sieci, więc druga połowa naprawy C-3 („rate-limit per-IP") ląduje
// tutaj. Limit dobrany pod realny ruch: jeden ekran biblioteki to ~60 okładek, a po pierwszym
// wyświetleniu odpowiada cache przeglądarki/brzegu — 240/min zostawia zapas ~4 pełnych ekranów.
const RATE_LIMIT = 240;

// SSRF: https + host z whitelisty. Sprawdzane na KAŻDYM skoku przekierowania.
function allowed(url: URL): boolean {
  return url.protocol === 'https:' && ALLOW.has(url.hostname);
}

export async function GET(request: Request): Promise<Response> {
  // Audyt: helper był importowany, ale NIGDY nie wywołany — trasa realnie nie miała limitu.
  // 429 przed jakimkolwiek fetchem do CDN → proxy nie da się użyć jako darmowy relay/amplifikator.
  if (rateLimited(`img:${clientIp(request)}`, RATE_LIMIT)) {
    return new Response('rate limited', { status: 429, headers: { 'Retry-After': '60' } });
  }
  const u = new URL(request.url).searchParams.get('u');
  if (!u) return new Response('missing u', { status: 400 });

  let target: URL;
  try {
    target = new URL(u);
  } catch {
    return new Response('bad url', { status: 400 });
  }
  if (!allowed(target)) return new Response('forbidden host', { status: 403 });

  // Ręczne podążanie za redirectami z RE-WALIDACJĄ hosta na każdym skoku (audyt C-3):
  // whitelistowany host nie może przekierować proxy na adres wewnętrzny (anty-SSRF).
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let upstream: Response;
    try {
      upstream = await fetch(target.toString(), {
        headers: { 'User-Agent': 'GameVault/0.1' },
        redirect: 'manual',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      return new Response('upstream timeout', { status: 504 });
    }

    if (upstream.status >= 300 && upstream.status < 400) {
      const loc = upstream.headers.get('location');
      if (!loc) return new Response('bad redirect', { status: 502 });
      let next: URL;
      try {
        next = new URL(loc, target);
      } catch {
        return new Response('bad redirect', { status: 502 });
      }
      if (!allowed(next)) return new Response('forbidden redirect host', { status: 403 });
      target = next;
      continue;
    }

    if (!upstream.ok || !upstream.body) {
      return new Response(`upstream ${upstream.status}`, { status: 502 });
    }
    // Proxy relayuje TYLKO obrazy i tylko do rozsądnego rozmiaru.
    const ctype = upstream.headers.get('content-type') ?? '';
    if (!ctype.startsWith('image/')) return new Response('not an image', { status: 415 });
    if (Number(upstream.headers.get('content-length') ?? '0') > MAX_BYTES) {
      return new Response('too large', { status: 413 });
    }

    // Content-Length to deklaracja CDN-u, nie fakt (brak nagłówka / chunked / kłamstwo → limit
    // wyżej nic nie łapie). Trasa jest publiczna, więc liczymy bajty W LOCIE i zrywamy strumień
    // po przekroczeniu MAX_BYTES — anty open-relay/amplifikacja (audyt C-3, lustro dashboard/).
    let seen = 0;
    const capped = upstream.body.pipeThrough(
      new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
          seen += chunk.byteLength;
          if (seen > MAX_BYTES) {
            // Błąd strumienia = przerwane ciało odpowiedzi + anulowany pobór z CDN (pipeThrough).
            controller.error(new Error('image too large'));
            return;
          }
          controller.enqueue(chunk);
        },
      }),
    );

    return new Response(capped, {
      status: 200,
      headers: {
        'Content-Type': ctype || 'image/jpeg',
        // Przeglądarka (max-age) + brzeg Vercela (s-maxage) + serwuj stare w tle (SWR).
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  }
  return new Response('too many redirects', { status: 502 });
}
