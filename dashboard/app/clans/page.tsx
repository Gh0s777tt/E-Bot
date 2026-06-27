import ClanBoard from '../../components/ClanBoard';
import { tp } from '../../lib/panelI18n';
import { topClans } from '../../lib/public';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

// Strona „Klany" — ranking klanów serwera wg wspólnego banku (dane z Supabase, server-side). Czyta
// `topClans`; degraduje do pustki (komunikat) gdy brak chmury / klanów. Konfiguracja klanów jest w
// bocie (`/clan`), tu tylko podgląd rankingu — spójnie z /leaderboard.
export default async function ClansPage() {
  const [clans, lang] = await Promise.all([topClans(25), getPanelLocale()]);
  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-muted">{tp(lang, 'ui.clans.intro')}</p>
      <ClanBoard
        title={tp(lang, 'ui.clans.rankTitle')}
        rows={clans}
        membersUnit={tp(lang, 'ui.clans.members')}
        emptyText={tp(lang, 'ui.clans.empty')}
      />
    </div>
  );
}
