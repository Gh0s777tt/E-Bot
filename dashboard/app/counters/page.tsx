import { Activity } from 'lucide-react';
import CountersForm from '../../components/CountersForm';
import { getCountersConfig } from '../../lib/community';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function CountersPage() {
  const [cfg, guild, lang] = await Promise.all([
    getCountersConfig(),
    getGuildMeta(),
    getPanelLocale(),
  ]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        {tp(lang, 'ui.counters.intro')}{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">{tp(lang, 'ui.counters.statusOn')}</span>
        ) : (
          <span className="font-semibold text-accent">{tp(lang, 'ui.counters.statusOff')}</span>
        )}
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Activity size={16} className="text-accent" /> {tp(lang, 'ui.counters.heading')}
        </h2>
        <CountersForm initial={cfg} guild={guild} />
      </section>
    </div>
  );
}
