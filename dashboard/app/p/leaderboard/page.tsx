import { Trophy } from 'lucide-react';
import LeaderboardBoard from '../../../components/LeaderboardBoard';
import { topActive, topEco, topXp } from '../../../lib/public';

export const dynamic = 'force-dynamic';

export default async function PublicLeaderboard() {
  const [xp, eco, active] = await Promise.all([topXp(15), topEco(15), topActive(15)]);
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <header className="flex items-center gap-3">
        <Trophy className="h-7 w-7 text-accent" />
        <div>
          <h1 className="font-display text-3xl tracking-wide">Ranking serwera</h1>
          <p className="text-sm text-muted">Publiczny ranking — E-Bot. Kliknij gracza po kartę.</p>
        </div>
      </header>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <LeaderboardBoard title="Top XP" icon="🏆" rows={xp} />
        <LeaderboardBoard title="Top ekonomia" icon="🪙" rows={eco} />
        <LeaderboardBoard title="Najaktywniejsi" icon="💬" rows={active} unit="wiad." />
      </div>
    </div>
  );
}
