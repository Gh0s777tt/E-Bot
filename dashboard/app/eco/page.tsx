import { Banknote, ShoppingCart, Trophy } from 'lucide-react';
import EconomyForm from '../../components/EconomyForm';
import EcoSeasonForm from '../../components/EcoSeasonForm';
import ShopManager from '../../components/ShopManager';
import StatusPill from '../../components/StatusPill';
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
      <header className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-3xl text-sm text-muted">
          {tp(lang, 'ui.eco.introPre')}
          <code className="text-accent">/eco</code>
          {
            ' (balance · daily · work · rob · pay · deposit · withdraw · gamble · slots · shop · buy · top). '
          }
          {tp(lang, 'ui.eco.introReq')}
          <code>f3-economy-schema.sql</code>
          {tp(lang, 'ui.eco.introReqPost')}
        </p>
        <StatusPill on={cfg.enabled} lang={lang} />
      </header>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Banknote size={16} className="text-accent" /> {tp(lang, 'ui.eco.cfgHeading')}
          <span className="ms-auto normal-case">
            <StatusPill on={cfg.enabled} lang={lang} />
          </span>
        </h2>
        <EconomyForm initial={cfg} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Trophy size={16} className="text-accent" /> {tp(lang, 'ui.eco.seasonHeading')}
        </h2>
        <EcoSeasonForm initial={season} guild={guild} currency={cfg.currency} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <ShoppingCart size={16} className="text-accent" /> {tp(lang, 'ui.eco.shopHeading')}
        </h2>
        <ShopManager initial={items} guild={guild} currency={cfg.currency} />
      </section>
    </div>
  );
}
