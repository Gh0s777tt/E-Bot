import { Swords } from 'lucide-react';
import ClanBoard from '../../../components/ClanBoard';
import { tp } from '../../../lib/panelI18n';
import { topClans } from '../../../lib/public';
import { getPanelLocale } from '../../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

// Publiczna (bez logowania) strona rankingu klanów — udostępnialna, jak /p/leaderboard. Reużywa
// `topClans` (server-side z Supabase) i `ClanBoard`. Degraduje do pustki gdy brak chmury/klanów.
export default async function PublicClans() {
  const [clans, lang] = await Promise.all([topClans(25), getPanelLocale()]);
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <header className="flex items-center gap-3">
        <Swords className="h-7 w-7 text-accent" />
        <div>
          <h1 className="font-display text-3xl tracking-wide">{tp(lang, 'ui.pub.clansTitle')}</h1>
          <p className="text-sm text-muted">{tp(lang, 'ui.pub.clansSubtitle')}</p>
        </div>
      </header>
      <div className="mt-8">
        <ClanBoard
          title={tp(lang, 'ui.clans.rankTitle')}
          rows={clans}
          membersUnit={tp(lang, 'ui.clans.members')}
          emptyText={tp(lang, 'ui.clans.empty')}
        />
      </div>
    </div>
  );
}
