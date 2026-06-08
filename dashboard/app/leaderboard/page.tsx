import { ExternalLink } from 'lucide-react';
import LeaderboardBoard from '../../components/LeaderboardBoard';
import { topActive, topEco, topXp } from '../../lib/public';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const [xp, eco, active] = await Promise.all([topXp(15), topEco(15), topActive(15)]);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted">
          Rankingi serwera na żywo z Supabase. Kliknij gracza, by zobaczyć jego publiczną kartę.
          Top‑3 dostają podium 🥇🥈🥉.
        </p>
        <a
          href="/p/leaderboard"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-accent/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-accent transition hover:bg-accent hover:text-white"
        >
          Publiczny ranking <ExternalLink size={13} />
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LeaderboardBoard title="Top XP" icon="🏆" rows={xp} />
        <LeaderboardBoard title="Top ekonomia" icon="🪙" rows={eco} />
        <LeaderboardBoard title="Najaktywniejsi" icon="💬" rows={active} unit="wiad." />
      </div>
    </div>
  );
}
