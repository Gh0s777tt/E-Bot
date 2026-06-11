import Link from 'next/link';
import type { LbRow } from '../lib/public';

const MEDALS = ['🥇', '🥈', '🥉'];

// Tablica rankingowa w stylu kart — podium dla top-3, lista poniżej. Wiersze linkują do /p/u/[id].
export default function LeaderboardBoard({
  title,
  icon,
  rows,
  unit,
  emptyText = 'Brak danych.',
}: {
  title: string;
  icon?: string;
  rows: LbRow[];
  unit?: string;
  emptyText?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="panel-glow relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-card to-bg p-5">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgb(var(--accent-rgb) / 0.14), transparent 70%)',
        }}
      />
      <h2 className="relative mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
        {icon && <span className="text-lg">{icon}</span>}
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="relative text-sm text-muted">{emptyText}</p>
      ) : (
        <ol className="relative space-y-1.5">
          {rows.map((r, i) => {
            const top = i < 3;
            return (
              <li key={r.user_id}>
                <Link
                  href={`/p/u/${r.user_id}`}
                  className={`group flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${
                    top
                      ? 'border-accent/30 bg-accent/5 hover:border-accent/60 hover:bg-accent/10'
                      : 'border-transparent hover:border-line hover:bg-bg/40'
                  }`}
                >
                  <span className="w-7 shrink-0 text-center font-display text-base">
                    {top ? MEDALS[i] : <span className="text-muted">{i + 1}</span>}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium group-hover:text-white">
                    {r.username}
                  </span>
                  <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-elevated sm:block">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent-dark"
                      style={{ width: `${Math.max(4, (r.value / max) * 100)}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-right font-semibold tabular-nums text-accent">
                    {r.value.toLocaleString('pl-PL')}
                    {unit ? (
                      <span className="ml-1 text-[11px] font-normal text-muted">{unit}</span>
                    ) : null}
                  </span>
                  {r.sub && (
                    <span className="hidden w-24 shrink-0 truncate text-right text-[11px] text-muted md:block">
                      {r.sub}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
