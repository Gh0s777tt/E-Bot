import type { Game } from './types';

// Scala rekordy tej SAMEJ gry (identyczny igdb_id) w jeden wpis z listą platform i sumą czasu gry
// (audyt B-6). Wiersze bez igdb_id zostają osobno — nie da się ich bezpiecznie scalić. Kolejność
// wejścia zachowana (reprezentant = pierwsze wystąpienie). Używane dla shelfów CROSS-platform
// (Najczęściej grane / gatunki / ostatnio grane) — shelfy per-platforma dostają surową listę.
export function dedupeByIgdb(games: Game[]): Game[] {
  const seen = new Map<number, Game>();
  const out: Game[] = [];
  for (const g of games) {
    if (g.igdb_id == null) {
      out.push({ ...g, platforms: [g.platform] });
      continue;
    }
    const rep = seen.get(g.igdb_id);
    if (!rep) {
      const copy: Game = { ...g, platforms: [g.platform] };
      seen.set(g.igdb_id, copy);
      out.push(copy);
      continue;
    }
    rep.playtime_min += g.playtime_min;
    if (!rep.platforms?.includes(g.platform)) rep.platforms?.push(g.platform);
    if (!rep.cover_url && g.cover_url) rep.cover_url = g.cover_url;
    if ((g.last_played ?? 0) > (rep.last_played ?? 0)) rep.last_played = g.last_played;
  }
  return out;
}
