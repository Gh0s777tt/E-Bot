import { PlusCircle } from 'lucide-react';
import AddGameForm from '../../components/AddGameForm';
import LibraryBrowser from '../../components/LibraryBrowser';
import { getGames } from '../../lib/data';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  const [games, lang] = await Promise.all([getGames(), getPanelLocale()]);
  return (
    <div className="space-y-6">
      <details className="rounded-2xl border border-line bg-card p-4">
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold uppercase tracking-wide text-accent">
          <PlusCircle size={16} /> {tp(lang, 'ui.library.addGameSummary')}
        </summary>
        <div className="pt-4">
          <AddGameForm />
        </div>
      </details>

      {games.length ? (
        <LibraryBrowser games={games} />
      ) : (
        <p className="text-muted">
          {tp(lang, 'ui.library.emptyPre')}
          <code className="text-accent">node ingest/sync.mts</code>
          {tp(lang, 'ui.library.emptyPost')}
        </p>
      )}
    </div>
  );
}
