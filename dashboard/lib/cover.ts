import type { Game } from './data';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450">' +
      '<rect width="100%" height="100%" fill="#232323"/>' +
      '<text x="50%" y="50%" fill="#666" font-family="sans-serif" font-size="18" text-anchor="middle" dominant-baseline="middle">brak okładki</text>' +
      '</svg>',
  );

export function proxied(u: string): string {
  if (u.startsWith('data:')) return u;
  return `/api/img?u=${encodeURIComponent(u)}`;
}

export function coverFallbacks(g: Game): string[] {
  const list: string[] = [];
  if (g.cover_url) list.push(proxied(g.cover_url));
  if (g.platform === 'steam') {
    list.push(
      proxied(
        `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.platform_app_id}/library_600x900_2x.jpg`,
      ),
    );
    list.push(
      proxied(`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.platform_app_id}/header.jpg`),
    );
  }
  list.push(PLACEHOLDER);
  return [...new Set(list)];
}
