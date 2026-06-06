// Proxy/cache okładek: przeglądarka pobiera z localhost, serwer Next ściąga z CDN.
// Whitelist hostów = ochrona przed SSRF.
const ALLOW = new Set([
  'cdn.cloudflare.steamstatic.com',
  'shared.cloudflare.steamstatic.com',
  'cdn.akamai.steamstatic.com',
  'images.igdb.com',
  'image.api.playstation.com',
  'psnobj.prod.dl.playstation.net',
]);

export const dynamic = 'force-dynamic';

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

  const upstream = await fetch(target.toString(), {
    headers: { 'User-Agent': 'GameVault/0.1' },
  });
  if (!upstream.ok || !upstream.body) {
    return new Response(`upstream ${upstream.status}`, { status: 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
