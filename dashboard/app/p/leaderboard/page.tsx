import { Trophy } from 'lucide-react';
import LeaderboardBoard from '../../../components/LeaderboardBoard';
import { tp } from '../../../lib/panelI18n';
import { topActive, topEco, topXp } from '../../../lib/public';
import { getPanelLocale } from '../../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function PublicLeaderboard() {
  const [xp, eco, active, lang] = await Promise.all([
    topXp(15),
    topEco(15),
    topActive(15),
    getPanelLocale(),
  ]);
  const empty = tp(lang, 'ui.lb.empty');
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <header className="flex items-center gap-3">
        <Trophy className="h-7 w-7 text-accent" />
        <div>
          <h1 className="font-display text-3xl tracking-wide">{tp(lang, 'ui.pub.lbTitle')}</h1>
          <p className="text-sm text-muted">{tp(lang, 'ui.pub.lbSubtitle')}</p>
        </div>
      </header>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <LeaderboardBoard title={tp(lang, 'ui.lb.topXp')} icon="🏆" rows={xp} emptyText={empty} />
        <LeaderboardBoard title={tp(lang, 'ui.lb.topEco')} icon="🪙" rows={eco} emptyText={empty} />
        <LeaderboardBoard
          title={tp(lang, 'ui.lb.topActive')}
          icon="💬"
          rows={active}
          unit={tp(lang, 'ui.lb.msgUnit')}
          emptyText={empty}
        />
      </div>
    </div>
  );
}
