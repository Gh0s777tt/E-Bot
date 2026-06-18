import { Banknote, ShoppingCart, Trophy } from 'lucide-react';
import EconomyForm from '../../components/EconomyForm';
import EcoSeasonForm from '../../components/EcoSeasonForm';
import ShopManager from '../../components/ShopManager';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getEcoSeason, getServerEconomy, getShopItems } from '../../lib/serverEconomy';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function EcoPage() {
  const [cfg, items, guild, season, lang] = await Promise.all([
    getServerEconomy(),
    getShopItems(),
    getGuildMeta(),
    getEcoSeason(),
    getPanelLocale(),
  ]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        {tp(lang, 'ui.eco.introPre')}
        <code className="text-accent">/eco</code>
        {
          ' (balance · daily · work · rob · pay · deposit · withdraw · gamble · slots · shop · buy · top). '
        }
        {tp(lang, 'ui.eco.introReq')}
        <code>f3-economy-schema.sql</code>
        {tp(lang, 'ui.eco.introReqPost')}{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">{tp(lang, 'ui.eco.enabledOn')}</span>
        ) : (
          <span className="font-semibold text-accent">{tp(lang, 'ui.eco.enabledOff')}</span>
        )}
      </p>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Banknote size={16} className="text-accent" /> {tp(lang, 'ui.eco.cfgHeading')}
        </h2>
        <EconomyForm initial={cfg} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Trophy size={16} className="text-accent" /> {tp(lang, 'ui.eco.seasonHeading')}
        </h2>
        <EcoSeasonForm initial={season} guild={guild} currency={cfg.currency} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <ShoppingCart size={16} className="text-accent" /> {tp(lang, 'ui.eco.shopHeading')}
        </h2>
        <ShopManager initial={items} guild={guild} currency={cfg.currency} />
      </section>
    </div>
  );
}
