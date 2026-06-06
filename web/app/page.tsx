import { getGames } from '../lib/db';
import type { Game, Shelf } from '../lib/types';
import TopNav from '../components/TopNav';
import Hero from '../components/Hero';
import Row from '../components/Row';

// Zawsze czytaj świeże dane z bazy (nie cache'uj na buildzie).
export const dynamic = 'force-dynamic';

function shelvesByGenre(games: Game[]): Shelf[] {
  const map = new Map<string, Game[]>();
  for (const g of games) {
    for (const gen of g.genres) {
      if (!map.has(gen)) map.set(gen, []);
      map.get(gen)!.push(g);
    }
  }
  return [...map.entries()]
    .filter(([, items]) => items.length >= 3)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([title, items]) => ({ title, items }));
}

const PLATFORM_LABEL: Record<string, string> = {
  steam: 'Steam',
  psn: 'PlayStation',
  gog: 'GOG',
  ubisoft: 'Ubisoft',
};

export default function Page() {
  const games = getGames();

  const byPlaytime = [...games].sort((a, b) => b.playtime_min - a.playtime_min);
  const featured = byPlaytime[0];

  const recentlyPlayed = [...games]
    .filter((g) => g.last_played)
    .sort((a, b) => (b.last_played ?? 0) - (a.last_played ?? 0));

  const platforms = [...new Set(games.map((g) => g.platform))];

  const shelves: Shelf[] = [
    recentlyPlayed.length >= 1 ? { title: 'Kontynuuj granie', items: recentlyPlayed } : null,
    byPlaytime.length ? { title: 'Najczęściej grane', items: byPlaytime } : null,
    ...platforms.map((p) => ({
      title: PLATFORM_LABEL[p] ?? p,
      items: games.filter((g) => g.platform === p),
    })),
    ...shelvesByGenre(games),
  ].filter((s): s is Shelf => s !== null && s.items.length > 0);

  return (
    <main className="min-h-screen bg-bg pb-24">
      <TopNav />

      {featured ? (
        <Hero game={featured} />
      ) : (
        <div className="h-16" />
      )}

      <div className="relative z-10 -mt-20 md:-mt-28 space-y-1">
        {shelves.map((s) => (
          <Row key={s.title} title={s.title} items={s.items} />
        ))}
      </div>

      {games.length === 0 && (
        <div className="px-6 md:px-12 py-20 text-center text-muted">
          <p className="text-xl mb-2">Biblioteka jest pusta.</p>
          <p>
            Uruchom ingestię: <code className="text-accent">node ingest/sync.mts</code>
          </p>
        </div>
      )}

      <footer className="px-4 md:px-12 mt-12 text-xs text-muted/60">
        GameVault · {games.length} gier · dane: Steam + IGDB
      </footer>
    </main>
  );
}
