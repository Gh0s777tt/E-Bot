import { Trophy } from 'lucide-react';
import { type LbRow, topEco, topXp } from '../../../lib/public';

export const dynamic = 'force-dynamic';

function Board({ title, rows }: { title: string; rows: LbRow[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="panel-glow rounded-2xl border border-line bg-card p-5">
      <h2 className="mb-4 text-base font-semibold uppercase tracking-wide">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">Brak danych.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={r.user_id} className="flex items-center gap-3 text-sm">
              <span className="w-6 text-right text-muted">{i + 1}</span>
              <span className="w-40 truncate">{r.username}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${(r.value / max) * 100}%` }}
                />
              </div>
              <span className="w-28 text-right text-muted">
                {r.value.toLocaleString('pl-PL')}
                {r.sub ? ` · ${r.sub}` : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default async function PublicLeaderboard() {
  const [xp, eco] = await Promise.all([topXp(15), topEco(15)]);
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <header className="flex items-center gap-3">
        <Trophy className="h-7 w-7 text-accent" />
        <div>
          <h1 className="font-display text-3xl tracking-wide">Ranking serwera</h1>
          <p className="text-sm text-muted">Publiczny ranking — E-Bot.</p>
        </div>
      </header>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Board title="🏆 Top XP" rows={xp} />
        <Board title="🪙 Top ekonomia" rows={eco} />
      </div>
    </div>
  );
}
