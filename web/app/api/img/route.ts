// Proxy/cache okładek: przeglądarka pobiera z origin (Next), serwer ściąga z CDN — działa też tam,
// gdzie przeglądarka nie ma dostępu do CDN. Whitelist hostów = ochrona przed SSRF. Cache na BRZEGU
// Vercela (s-maxage per unikalny `?u=`) + stale-while-revalidate → mniej uderzeń w CDN gier.
export const runtime = 'nodejs';

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

// SSRF: https + host z whitelisty. Sprawdzane na KAŻDYM skoku przekierowania.
function allowed(url: URL): boolean {
  return url.protocol === 'https:' && ALLOW.has(url.hostname);
}

export async function GET(request: Request): Promise<Response> {
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

    return new Response(upstream.body, {
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
