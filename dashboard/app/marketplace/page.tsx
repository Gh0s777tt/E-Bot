import MarketplaceGrid from '../../components/MarketplaceGrid';
import { billingEnabled, getGuildTier } from '../../lib/billing';
import { getPrimaryGuildId } from '../../lib/guild';
import { getModuleStates } from '../../lib/moduleState';
import { tp } from '../../lib/panelI18n';
import { getPluginCatalog } from '../../lib/pluginCatalog';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

// M2 — UI marketplace: katalog (first-party z kodu + community z DB) + interaktywny toggle
// enable/disable per-serwer. M5 — gating tierów: premium-pluginy zablokowane na serwerze 'free'
// (tylko gdy billing włączony). Stan first-party = getModuleStates (przez chokepoint).
export default async function MarketplacePage() {
  const [catalog, states, tier, lang] = await Promise.all([
    getPluginCatalog(),
    getModuleStates(),
    getPrimaryGuildId().then(getGuildTier),
    getPanelLocale(),
  ]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">{tp(lang, 'ui.modules.intro')}</p>
      <MarketplaceGrid
        entries={catalog}
        initial={states}
        guildTier={tier}
        billingOn={billingEnabled()}
      />
    </div>
  );
}
