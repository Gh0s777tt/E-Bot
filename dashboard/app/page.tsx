import { getStats, getGames, activeSource } from '../lib/data';
import { getIntegrations } from '../lib/integrations';
import StatCard from '../components/StatCard';
import GameCard from '../components/GameCard';
import { Gamepad2, Clock, Layers, Database } from 'lucide-react';

export const dynamic = 'force-dynamic';

const PLATFORM_LABEL: Record<string, string> = { steam: 'Steam', psn: 'PlayStation', gog: 'GOG', ubisoft: 'Ubisoft' };

export default async function OverviewPage() {
  const [stats, games, src, integrations] = await Promise.all([
    getStats(),
    getGames(),
    activeSource(),
    Promise.resolve(getIntegrations()),
  ]);
  const recent = games.slice(0, 12);
  const okCount = integrations.filter((i) => i.ok).length;

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Gry w bibliotece" value={stats.total} icon={<Gamepad2 size={16} />} accent />
        <StatCard label="Platformy" value={stats.platforms} hint={Object.keys(stats.byPlatform).map((p) => PLATFORM_LABEL[p] ?? p).join(', ')} icon={<Layers size={16} />} />
        <StatCard label="Łączny czas gry" value={`${stats.totalHours} h`} icon={<Clock size={16} />} />
        <StatCard label="Źródło danych" value={src === 'supabase' ? 'Supabase' : src === 'sqlite' ? 'SQLite (lokalnie)' : 'brak'} hint={`${okCount}/${integrations.length} integracji OK`} icon={<Database size={16} />} />
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold">Najczęściej grane</h2>
          <a href="/library" className="text-sm text-muted transition hover:text-white">
            Cała biblioteka →
          </a>
        </div>
        {recent.length ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {recent.map((g) => (
              <GameCard key={`${g.platform}-${g.platform_app_id}`} game={g} />
            ))}
          </div>
        ) : (
          <p className="text-muted">Brak gier. Uruchom <code className="text-accent">node ingest/sync.mts</code>.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Rozkład platform</h2>
        <div className="space-y-2">
          {Object.entries(stats.byPlatform).map(([p, n]) => (
            <div key={p} className="flex items-center gap-3">
              <span className="w-24 text-sm text-muted">{PLATFORM_LABEL[p] ?? p}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-elevated">
                <div className="h-full rounded-full bg-accent" style={{ width: `${stats.total ? (n / stats.total) * 100 : 0}%` }} />
              </div>
              <span className="w-10 text-right text-sm">{n}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
