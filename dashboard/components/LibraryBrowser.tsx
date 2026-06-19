'use client';

import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Game } from '../lib/data';
import { tp } from '../lib/panelI18n';
import GameCard from './GameCard';
import GameDetailModal from './GameDetailModal';
import { useLang } from './LangContext';

const PLATFORM_LABEL: Record<string, string> = {
  steam: 'Steam',
  psn: 'PlayStation',
  gog: 'GOG',
  ubisoft: 'Ubisoft',
};

export default function LibraryBrowser({ games }: { games: Game[] }) {
  const { lang } = useLang();
  const [q, setQ] = useState('');
  const [platform, setPlatform] = useState('all');
  const [genre, setGenre] = useState('all');
  const [selected, setSelected] = useState<Game | null>(null);

  const platforms = useMemo(() => [...new Set(games.map((g) => g.platform))], [games]);
  const genres = useMemo(() => {
    const s = new Set<string>();
    for (const g of games) {
      for (const x of g.genres) s.add(x);
    }
    return [...s].sort();
  }, [games]);

  const filtered = useMemo(
    () =>
      games.filter(
        (g) =>
          (platform === 'all' || g.platform === platform) &&
          (genre === 'all' || g.genres.includes(genre)) &&
          (!q || g.title.toLowerCase().includes(q.toLowerCase())),
      ),
    [games, q, platform, genre],
  );

  const selectCls =
    'rounded-md border border-line bg-elevated px-3 py-2 text-sm uppercase tracking-wide outline-none focus:border-accent';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-card p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tp(lang, 'ui.library.searchPlaceholder')}
            className="w-full rounded-md border border-line bg-elevated py-2 ps-9 pe-3 text-sm outline-none focus:border-accent"
          />
        </div>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className={selectCls}
        >
          <option value="all">{tp(lang, 'ui.library.allPlatforms')}</option>
          {platforms.map((p) => (
            <option key={p} value={p}>
              {PLATFORM_LABEL[p] ?? p}
            </option>
          ))}
        </select>
        <select value={genre} onChange={(e) => setGenre(e.target.value)} className={selectCls}>
          <option value="all">{tp(lang, 'ui.library.allGenres')}</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs uppercase tracking-wide text-muted">
        {filtered.length} / {games.length} {tp(lang, 'ui.library.countSuffix')}
      </p>

      {filtered.length ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
          {filtered.map((g) => (
            <GameCard
              key={`${g.platform}-${g.platform_app_id}`}
              game={g}
              onClick={() => setSelected(g)}
            />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-muted">{tp(lang, 'ui.library.noResults')}</p>
      )}

      <GameDetailModal game={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
