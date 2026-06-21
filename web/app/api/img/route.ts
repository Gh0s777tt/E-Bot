// Proxy/cache okładek: przeglądarka pobiera z origin (Next), serwer ściąga z CDN — działa też tam,
// gdzie przeglądarka nie ma dostępu do CDN. Whitelist hostów = ochrona przed SSRF. Cache na BRZEGU
// Vercela (s-maxage per unikalny `?u=`) + stale-while-revalidate → mniej uderzeń w CDN gier (wcześniej
// `force-dynamic` wymuszał obejście cache; każda okładka biła w serwer). Fetch z timeoutem (anty-zawis).
const ALLOW = new Set([
  'cdn.cloudflare.steamstatic.com',
  'shared.cloudflare.steamstatic.com',
  'cdn.akamai.steamstatic.com',
  'images.igdb.com',
  'image.api.playstation.com',
  'psnobj.prod.dl.playstation.net',
]);

const TIMEOUT_MS = 8000;

export async function GET(request: Request): Promise<Response> {
  const u = new URL(request.url).searchParams.get('u');
  if (!u) return new Response('missing u', { status: 400 });

  let target: URL;
  try {
    target = new URL(u);
  } catch {
    return new Response('bad url', { status: 400 });
  }
  if (target.protocol !== 'https:' || !ALLOW.has(target.hostname)) {
    return new Response('forbidden host', { status: 403 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      headers: { 'User-Agent': 'GameVault/0.1' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return new Response('upstream timeout', { status: 504 });
  }
  if (!upstream.ok || !upstream.body) {
    return new Response(`upstream ${upstream.status}`, { status: 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'image/jpeg',
      // Przeglądarka (max-age) + brzeg Vercela (s-maxage) + serwuj stare w tle (SWR).
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
