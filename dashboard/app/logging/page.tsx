import { ScrollText } from 'lucide-react';
import LoggingForm from '../../components/LoggingForm';
import { getLoggingConfig } from '../../lib/community';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function LoggingPage() {
  const [cfg, guild, lang] = await Promise.all([
    getLoggingConfig(),
    getGuildMeta(),
    getPanelLocale(),
  ]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        {tp(lang, 'ui.logging.intro')}{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">{tp(lang, 'ui.logging.statusOn')}</span>
        ) : (
          <span className="font-semibold text-accent">{tp(lang, 'ui.logging.statusOff')}</span>
        )}
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <ScrollText size={16} className="text-accent" /> {tp(lang, 'ui.logging.heading')}
        </h2>
        <LoggingForm initial={cfg} guild={guild} />
      </section>
    </div>
  );
}
