import { Palette } from 'lucide-react';
import RankCardForm from '../../components/RankCardForm';
import { getRankCard } from '../../lib/appearance';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function AppearancePage() {
  const [cfg, lang] = await Promise.all([getRankCard(), getPanelLocale()]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">{tp(lang, 'ui.appearance.intro')}</p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Palette size={16} className="text-accent" /> {tp(lang, 'ui.appearance.heading')}
        </h2>
        <RankCardForm initial={cfg} />
      </section>
    </div>
  );
}
