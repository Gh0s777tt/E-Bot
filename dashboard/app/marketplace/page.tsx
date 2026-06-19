import Link from 'next/link';
import MarketplaceGrid from '../../components/MarketplaceGrid';
import { billingEnabled, getGuildTier } from '../../lib/billing';
import { communityEnabled } from '../../lib/communityPlugins';
import { getPrimaryGuildId } from '../../lib/guild';
import { getModuleStates } from '../../lib/moduleState';
import { tp } from '../../lib/panelI18n';
import { currentSession, resolveRole } from '../../lib/panelRoles';
import { getPluginCatalog } from '../../lib/pluginCatalog';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

// M2 — UI marketplace: katalog (first-party z kodu + community z DB) + interaktywny toggle
// enable/disable per-serwer. M5 — gating tierów (premium na 'free' zablokowany). M6 — linki:
// zgłoszenie pluginu (gdy community on) + moderacja (owner/staff). Stan first-party =
// getModuleStates (per-serwer, przez chokepoint getPrimaryGuildId).
export default async function MarketplacePage() {
  const session = await currentSession();
  const isMod = session ? (await resolveRole(session.uid)) === 'admin' : false;
  const communityOn = communityEnabled();
  const [catalog, states, tier, lang] = await Promise.all([
    getPluginCatalog(),
    getModuleStates(),
    getPrimaryGuildId().then(getGuildTier),
    getPanelLocale(),
  ]);
  const linkCls = 'inline-flex items-center gap-1 text-xs text-accent transition hover:underline';
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">{tp(lang, 'ui.modules.intro')}</p>
      {(communityOn || isMod) && (
        <div className="flex flex-wrap gap-4">
          {communityOn && (
            <Link href="/marketplace/submit" className={linkCls}>
              Zgłoś plugin community →
            </Link>
          )}
          {isMod && (
            <Link href="/marketplace/review" className={linkCls}>
              Moderacja community →
            </Link>
          )}
        </div>
      )}
      <MarketplaceGrid
        entries={catalog}
        initial={states}
        guildTier={tier}
        billingOn={billingEnabled()}
      />
    </div>
  );
}
