import { ExternalLink } from 'lucide-react';
import LeaderboardBoard from '../../components/LeaderboardBoard';
import { tp } from '../../lib/panelI18n';
import { topActive, topEco, topXp } from '../../lib/public';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const [xp, eco, active, lang] = await Promise.all([
    topXp(15),
    topEco(15),
    topActive(15),
    getPanelLocale(),
  ]);
  const empty = tp(lang, 'ui.lb.empty');
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted">{tp(lang, 'ui.lb.intro')}</p>
        <a
          href="/p/leaderboard"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-accent/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-accent transition hover:bg-accent hover:text-white"
        >
          {tp(lang, 'ui.lb.public')} <ExternalLink size={13} />
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
