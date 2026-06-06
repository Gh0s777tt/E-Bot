import LibraryBrowser from '../../components/LibraryBrowser';
import { getGames } from '../../lib/data';

export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  const games = await getGames();
  if (!games.length) {
    return (
      <p className="text-muted">
        Brak gier. Uruchom <code className="text-accent">node ingest/sync.mts</code> w katalogu
        głównym.
      </p>
    );
  }
  return <LibraryBrowser games={games} />;
}
