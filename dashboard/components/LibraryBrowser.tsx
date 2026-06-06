'use client';

import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Game } from '../lib/data';
import GameCard from './GameCard';

const PLATFORM_LABEL: Record<string, string> = {
  steam: 'Steam',
  psn: 'PlayStation',
  gog: 'GOG',
  ubisoft: 'Ubisoft',
};

export default function LibraryBrowser({ games }: { games: Game[] }) {
  const [q, setQ] = useState('');
  const [platform, setPlatform] = useState('all');
  const [genre, setGenre] = useState('all');

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
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Szukaj gry…"
            className="w-full rounded-md border border-line bg-elevated py-2 pl-9 pr-3 text-sm outline-none focus:border-accent"
          />
        </div>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className={selectCls}
        >
          <option value="all">Wszystkie platformy</option>
          {platforms.map((p) => (
            <option key={p} value={p}>
              {PLATFORM_LABEL[p] ?? p}
            </option>
          ))}
        </select>
        <select value={genre} onChange={(e) => setGenre(e.target.value)} className={selectCls}>
          <option value="all">Wszystkie gatunki</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs uppercase tracking-wide text-muted">
        {filtered.length} / {games.length} gier
      </p>

      {filtered.length ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
          {filtered.map((g) => (
            <GameCard key={`${g.platform}-${g.platform_app_id}`} game={g} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-muted">Brak wyników dla wybranych filtrów.</p>
      )}
    </div>
  );
}
