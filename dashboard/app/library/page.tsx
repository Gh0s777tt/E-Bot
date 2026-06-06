import { getGames } from '../../lib/data';
import GameCard from '../../components/GameCard';

export const dynamic = 'force-dynamic';

const PLATFORM_LABEL: Record<string, string> = { steam: 'Steam', psn: 'PlayStation', gog: 'GOG', ubisoft: 'Ubisoft' };

export default async function LibraryPage() {
  const games = await getGames();
  const platforms = [...new Set(games.map((g) => g.platform))];

  return (
    <div className="space-y-10">
      <p className="text-sm text-muted">{games.length} gier w bibliotece.</p>
      {platforms.map((p) => {
        const items = games.filter((g) => g.platform === p);
        return (
          <section key={p}>
            <h2 className="mb-3 text-base font-semibold">
              {PLATFORM_LABEL[p] ?? p} <span className="text-sm font-normal text-muted">· {items.length}</span>
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {items.map((g) => (
                <GameCard key={`${g.platform}-${g.platform_app_id}`} game={g} />
              ))}
            </div>
          </section>
        );
      })}
      {!games.length && (
        <p className="text-muted">
          Brak gier. Uruchom <code className="text-accent">node ingest/sync.mts</code> w katalogu głównym.
        </p>
      )}
    </div>
  );
}
