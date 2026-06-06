import { getGames } from '../../lib/data';
import GameCard from '../../components/GameCard';
import { Gamepad2 } from 'lucide-react';

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
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
              <Gamepad2 size={16} className="text-accent" /> {PLATFORM_LABEL[p] ?? p}
              <span className="text-sm font-normal normal-case text-muted">· {items.length}</span>
            </h2>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
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
