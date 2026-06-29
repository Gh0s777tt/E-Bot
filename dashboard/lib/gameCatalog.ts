// Kuratorowany katalog źródeł patch-notes (gry · GPU/sprzęt · aktualności) — „tryb PatchBot".
// Wybór po NAZWIE w panelu zamiast ręcznego AppID. Każdy wpis ma `source`, którego kształt jest
// IDENTYCZNY z `PatchSource` (dashboard/lib/community.ts) i `Source` (bot/src/gaming/patchnotes.mts):
//   { kind:'steam', appId }  → Steam News API (bogata treść, bez klucza)
//   { kind:'rss', url }      → dowolny feed RSS/Atom (Riot/Blizzard/oficjalne blogi/sprzęt/newsy)
// Bot czyta `source` zapisany w configu serwera — NIE potrzebuje tego katalogu w runtime.
// Feedy RSS poniżej są potwierdzone jako działające (200 + poprawny XML) z UA przeglądarkowym;
// Steam-owe AppID to popularne, stabilne tytuły. Dokładanie kolejnych = jedna linia.

export type CatalogSource = { kind: 'steam'; appId: number } | { kind: 'rss'; url: string };
export type CatalogCategory = 'game' | 'gpu' | 'news';
export type CatalogEntry = {
  slug: string;
  name: string;
  category: CatalogCategory;
  source: CatalogSource;
  image?: string;
  aliases?: string[];
};

// Okładka Steam (nagłówek) — ładna miniatura w embedzie.
const steamImg = (appId: number): string =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;

const steam = (slug: string, name: string, appId: number, aliases?: string[]): CatalogEntry => ({
  slug,
  name,
  category: 'game',
  source: { kind: 'steam', appId },
  image: steamImg(appId),
  aliases,
});
const feed = (
  slug: string,
  name: string,
  category: CatalogCategory,
  url: string,
  aliases?: string[],
): CatalogEntry => ({ slug, name, category, source: { kind: 'rss', url }, aliases });

export const GAME_CATALOG: CatalogEntry[] = [
  // ── Gry (Steam News API) ──────────────────────────────────────────────────
  steam('cs2', 'Counter-Strike 2', 730, ['cs', 'csgo', 'counter strike']),
  steam('dota2', 'Dota 2', 570, ['dota']),
  steam('tf2', 'Team Fortress 2', 440),
  steam('pubg', 'PUBG: BATTLEGROUNDS', 578080),
  steam('apex', 'Apex Legends', 1172470),
  steam('rust', 'Rust', 252490),
  steam('gtav', 'Grand Theft Auto V', 271590, ['gta']),
  steam('cyberpunk2077', 'Cyberpunk 2077', 1091500, ['cyberpunk']),
  steam('eldenring', 'Elden Ring', 1245620),
  steam('bg3', "Baldur's Gate 3", 1086940, ['baldurs gate']),
  steam('terraria', 'Terraria', 105600),
  steam('stardew', 'Stardew Valley', 413150),
  steam('destiny2', 'Destiny 2', 1085660, ['destiny']),
  steam('warframe', 'Warframe', 230410),
  steam('dbd', 'Dead by Daylight', 381210),
  steam('r6siege', 'Rainbow Six Siege', 359550, ['rainbow six', 'r6']),
  steam('ark', 'ARK: Survival Evolved', 346110),
  steam('palworld', 'Palworld', 1623730),
  steam('helldivers2', 'Helldivers 2', 553850, ['helldivers']),
  steam('nomanssky', "No Man's Sky", 275850),
  steam('valheim', 'Valheim', 892970),
  steam('thefinals', 'THE FINALS', 2073850),
  steam('marvelrivals', 'Marvel Rivals', 2767030),
  steam('deadlock', 'Deadlock', 1422450),
  steam('gmod', "Garry's Mod", 4000),
  steam('l4d2', 'Left 4 Dead 2', 550),
  steam('satisfactory', 'Satisfactory', 526870),
  steam('factorio', 'Factorio', 427520),
  steam('rocketleague', 'Rocket League', 252950, ['rl']),
  steam('amongus', 'Among Us', 945360),
  steam('phasmophobia', 'Phasmophobia', 739630),
  steam('drg', 'Deep Rock Galactic', 548430),
  steam('warthunder', 'War Thunder', 236390),
  steam('seaofthieves', 'Sea of Thieves', 1172620, ['sot']),
  steam('civ6', 'Sid Meier’s Civilization VI', 289070, ['civilization', 'civ']),
  steam('mhworld', 'Monster Hunter: World', 582010, ['monster hunter']),
  steam('mhrise', 'Monster Hunter Rise', 1446780),
  steam('sf6', 'Street Fighter 6', 1364780),
  steam('tekken8', 'Tekken 8', 1778820),
  steam('hades2', 'Hades II', 1145350),
  steam('enshrouded', 'Enshrouded', 1203620),
  steam('lethalcompany', 'Lethal Company', 1966720),

  // ── Gry (oficjalne feedy RSS — potwierdzone) ──────────────────────────────
  feed('poe', 'Path of Exile', 'game', 'https://www.pathofexile.com/news/rss', ['poe']),
  feed('gw2', 'Guild Wars 2', 'game', 'https://www.guildwars2.com/en/feed/', ['guild wars']),

  // ── GPU / sprzęt (sterowniki NVIDIA/AMD/Intel + premiery kart) ─────────────
  feed(
    'toms-hardware',
    'Sprzęt & GPU — Tom’s Hardware',
    'gpu',
    'https://www.tomshardware.com/feeds/all',
    ['gpu', 'nvidia', 'amd', 'intel', 'sterowniki', 'drivers', 'karta graficzna'],
  ),
  feed('engadget', 'Technologia — Engadget', 'gpu', 'https://www.engadget.com/rss.xml', ['tech']),

  // ── Aktualności gier ───────────────────────────────────────────────────────
  feed('pcgamer', 'PC Gamer', 'news', 'https://www.pcgamer.com/rss/'),
  feed('rps', 'Rock Paper Shotgun', 'news', 'https://www.rockpapershotgun.com/feed'),
  feed('eurogamer', 'Eurogamer', 'news', 'https://www.eurogamer.net/feed'),
  feed('gamespot', 'GameSpot', 'news', 'https://www.gamespot.com/feeds/news/'),
  feed('ign', 'IGN', 'news', 'https://feeds.feedburner.com/ign/games-all'),
];

export const CATALOG_COUNT = GAME_CATALOG.length;

export function getCatalogEntry(slug: string): CatalogEntry | undefined {
  return GAME_CATALOG.find((e) => e.slug === slug);
}

// Wyszukiwarka katalogu (nazwa / slug / aliasy). „Zaczyna się od" przed „zawiera". Limit do podglądu.
export function searchCatalog(query: string, limit = 8): CatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: { e: CatalogEntry; s: number }[] = [];
  for (const e of GAME_CATALOG) {
    const hay = [e.name, e.slug, ...(e.aliases ?? [])].map((x) => x.toLowerCase());
    let s = -1;
    for (const h of hay) {
      if (h === q) s = Math.max(s, 3);
      else if (h.startsWith(q)) s = Math.max(s, 2);
      else if (h.includes(q)) s = Math.max(s, 1);
    }
    if (s >= 0) scored.push({ e, s });
  }
  return scored
    .sort((a, b) => b.s - a.s || a.e.name.localeCompare(b.e.name))
    .slice(0, limit)
    .map((x) => x.e);
}
