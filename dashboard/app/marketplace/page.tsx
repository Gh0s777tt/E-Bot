import Link from 'next/link';
import MarketplaceGrid from '../../components/MarketplaceGrid';
import { billingEnabled, getGuildTier } from '../../lib/billing';
import { communityEnabled, getGuildCommunityStates } from '../../lib/communityPlugins';
import { getPrimaryGuildId } from '../../lib/guild';
import { getModuleStates } from '../../lib/moduleState';
import { tp } from '../../lib/panelI18n';
import { currentSession, resolveRole } from '../../lib/panelRoles';
import { getPluginCatalog } from '../../lib/pluginCatalog';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

// M2/M6 — UI marketplace: katalog (first-party z kodu + community z DB) + interaktywny toggle
// enable/disable per-serwer (first-party → settings; community → guild_plugins). M5 — gating tierów.
// Stan: getModuleStates (first-party) + getGuildCommunityStates (community), oba przez chokepoint.
export default async function MarketplacePage() {
  const session = await currentSession();
  const isMod = session ? (await resolveRole(session.uid)) === 'admin' : false;
  const communityOn = communityEnabled();
  const guildId = await getPrimaryGuildId();
  const [catalog, modStates, tier, comStates, lang] = await Promise.all([
    getPluginCatalog(),
    getModuleStates(),
    getGuildTier(guildId),
    getGuildCommunityStates(guildId),
    getPanelLocale(),
  ]);
  const states = { ...modStates, ...comStates };
  const linkCls = 'inline-flex items-center gap-1 text-xs text-accent transition hover:underline';
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">{tp(lang, 'ui.modules.intro')}</p>
      {(communityOn || isMod) && (
        <div className="flex flex-wrap gap-4">
          {communityOn && (
            <Link href="/marketplace/submit" className={linkCls}>
              {tp(lang, 'ui.mkt.submit')} →
            </Link>
          )}
          {isMod && (
            <Link href="/marketplace/review" className={linkCls}>
              {tp(lang, 'ui.mkt.moderate')} →
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
