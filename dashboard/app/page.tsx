import { Clock, Gamepad2, Layers, Plug, UserPlus } from 'lucide-react';
import GameCard from '../components/GameCard';
import StatCard from '../components/StatCard';
import { activeSource, getGames, getStats } from '../lib/data';
import { getIntegrations } from '../lib/integrations';
import { botInviteUrl } from '../lib/invite';

export const dynamic = 'force-dynamic';

const PLATFORM_LABEL: Record<string, string> = {
  steam: 'Steam',
  psn: 'PlayStation',
  gog: 'GOG',
  ubisoft: 'Ubisoft',
};

export default async function OverviewPage() {
  const [stats, games, src, integrations] = await Promise.all([
    getStats(),
    getGames(),
    activeSource(),
    Promise.resolve(getIntegrations()),
  ]);
  const recent = games.slice(0, 20);
  const okCount = integrations.filter((i) => i.ok).length;
  const coverPct = stats.total ? Math.round((stats.withCover / stats.total) * 100) : 0;
  const inviteUrl = botInviteUrl();

  return (
    <div className="space-y-6">
      {/* ===== HERO / PROFIL ===== */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-card p-5">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgb(var(--accent-rgb) / 0.16), transparent 70%)',
          }}
        />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center">
          <div className="flex items-center gap-4">
            <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-xl border-2 border-accent bg-bg font-display text-3xl text-accent shadow-glow">
              E
              <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 rounded bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                BOT
              </span>
            </div>
            <div>
              <h1 className="font-display text-3xl tracking-wide">E-BOT</h1>
              <p className="text-sm text-muted">Discord · gry · live · bezpieczeństwo</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-green-500/40 bg-green-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {src === 'supabase' ? 'Supabase' : src === 'sqlite' ? 'SQLite' : 'brak danych'}
              </span>
              <div className="mt-3">
                <a
                  href={inviteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold transition hover:bg-accent-hover"
                >
                  <UserPlus size={15} /> Zaproś bota na serwer
                </a>
              </div>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Gry w bibliotece"
              value={stats.total}
              icon={<Gamepad2 size={14} />}
              accent
            />
            <StatCard
              label="Platformy"
              value={stats.platforms}
              hint={Object.keys(stats.byPlatform)
                .map((p) => PLATFORM_LABEL[p] ?? p)
                .join(', ')}
              icon={<Layers size={14} />}
            />
            <StatCard
              label="Łączny czas gry"
              value={`${stats.totalHours} h`}
              icon={<Clock size={14} />}
            />
            <StatCard
              label="Integracje"
              value={`${okCount}/${integrations.length}`}
              icon={<Plug size={14} />}
            />
          </div>
        </div>

        <div className="relative mt-5">
          <div className="flex justify-between text-[11px] uppercase tracking-wide text-muted">
            <span>Pokrycie okładek</span>
            <span>
              {stats.withCover}/{stats.total}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-elevated">
            <div className="h-full rounded-full bg-accent" style={{ width: `${coverPct}%` }} />
          </div>
        </div>
      </section>

      {/* ===== 2 KOLUMNY: PLATFORMY | INTEGRACJE ===== */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel-glow rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
            <Layers size={16} className="text-accent" /> Rozkład platform
          </h2>
          <div className="space-y-3">
            {Object.entries(stats.byPlatform).map(([p, n]) => (
              <div key={p} className="flex items-center gap-3">
                <span className="w-24 text-sm text-muted">{PLATFORM_LABEL[p] ?? p}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${stats.total ? (n / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm">{n}</span>
              </div>
            ))}
            {!Object.keys(stats.byPlatform).length && (
              <p className="text-sm text-muted">Brak danych.</p>
            )}
          </div>
        </section>

        <section className="panel-glow rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
            <Plug size={16} className="text-accent" /> Integracje
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {integrations.map((i) => (
              <div
                key={i.name}
                className="flex items-center justify-between rounded-md border border-line bg-bg/40 px-3 py-2 text-sm"
              >
                <span>{i.name}</span>
                <span className={`h-2 w-2 rounded-full ${i.ok ? 'bg-green-500' : 'bg-accent'}`} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== NAJCZĘŚCIEJ GRANE ===== */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
            <Gamepad2 size={16} className="text-accent" /> Najczęściej grane
          </h2>
          <a
            href="/library"
            className="text-xs uppercase tracking-wide text-muted transition hover:text-white"
          >
            Cała biblioteka ›
          </a>
        </div>
        {recent.length ? (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            {recent.map((g) => (
              <GameCard key={`${g.platform}-${g.platform_app_id}`} game={g} />
            ))}
          </div>
        ) : (
          <p className="text-muted">
            Brak gier. Uruchom <code className="text-accent">node ingest/sync.mts</code>.
          </p>
        )}
      </section>
    </div>
  );
}
