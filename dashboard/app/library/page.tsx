import { PlusCircle } from 'lucide-react';
import AddGameForm from '../../components/AddGameForm';
import LibraryBrowser from '../../components/LibraryBrowser';
import { getGames } from '../../lib/data';

export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  const games = await getGames();
  return (
    <div className="space-y-6">
      <details className="rounded-2xl border border-line bg-card p-4">
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold uppercase tracking-wide text-accent">
          <PlusCircle size={16} /> Dodaj grę ręcznie (Xbox / Epic / Ubisoft / dowolna)
        </summary>
        <div className="pt-4">
          <AddGameForm />
        </div>
      </details>

      {games.length ? (
        <LibraryBrowser games={games} />
      ) : (
        <p className="text-muted">
          Brak gier. Dodaj ręcznie powyżej albo uruchom{' '}
          <code className="text-accent">node ingest/sync.mts</code> (Steam/PSN/GOG).
        </p>
      )}
    </div>
  );
}
