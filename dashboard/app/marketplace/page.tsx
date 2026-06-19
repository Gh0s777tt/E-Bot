import MarketplaceGrid from '../../components/MarketplaceGrid';
import { getModuleStates } from '../../lib/moduleState';
import { tp } from '../../lib/panelI18n';
import { getPluginCatalog } from '../../lib/pluginCatalog';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

// M2 — UI marketplace: katalog pluginów z jednego źródła `getPluginCatalog` (first-party z
// kodu + community z DB) + interaktywny toggle enable/disable per-serwer (MarketplaceGrid).
// Stan first-party = getModuleStates (per-serwer, przez chokepoint getPrimaryGuildId).
export default async function MarketplacePage() {
  const [catalog, states, lang] = await Promise.all([
    getPluginCatalog(),
    getModuleStates(),
    getPanelLocale(),
  ]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">{tp(lang, 'ui.modules.intro')}</p>
      <MarketplaceGrid entries={catalog} initial={states} />
    </div>
  );
}
