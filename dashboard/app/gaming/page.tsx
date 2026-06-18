import { Gift, Newspaper, TrendingDown } from 'lucide-react';
import FreeGamesForm from '../../components/FreeGamesForm';
import PatchNotesForm from '../../components/PatchNotesForm';
import PriceTrackerForm from '../../components/PriceTrackerForm';
import {
  getFreeGamesConfig,
  getPatchNotesConfig,
  getPriceTrackerConfig,
} from '../../lib/community';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function GamingPage() {
  const [free, patch, price, guild, lang] = await Promise.all([
    getFreeGamesConfig(),
    getPatchNotesConfig(),
    getPriceTrackerConfig(),
    getGuildMeta(),
    getPanelLocale(),
  ]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">{tp(lang, 'ui.gaming.intro')}</p>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Gift size={16} className="text-accent" /> {tp(lang, 'ui.gaming.freeHeading')}
        </h2>
        <FreeGamesForm initial={free} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Newspaper size={16} className="text-accent" /> {tp(lang, 'ui.gaming.patchHeading')}
        </h2>
        <PatchNotesForm initial={patch} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <TrendingDown size={16} className="text-accent" /> {tp(lang, 'ui.gaming.priceHeading')}
        </h2>
        <PriceTrackerForm initial={price} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5 text-sm text-muted">
        <h2 className="mb-3 text-base font-semibold uppercase tracking-wide text-white/90">
          {tp(lang, 'ui.gaming.backlogHeading')}
        </h2>
        <p>
          {tp(lang, 'ui.gaming.backlogHelpPre')}
          <code className="text-accent">/backlog</code>
          {' (add · list · set · remove) '}
          {tp(lang, 'ui.gaming.backlogHelpMid')}
          <code>_ALL.sql</code>
          {tp(lang, 'ui.gaming.backlogHelpPost')}
        </p>
      </section>
    </div>
  );
}
