import { ScrollText } from 'lucide-react';
import LoggingForm from '../../components/LoggingForm';
import StatusPill from '../../components/StatusPill';
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
      <header className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted">{tp(lang, 'ui.logging.intro')}</p>
        <StatusPill on={cfg.enabled} lang={lang} />
      </header>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <ScrollText size={16} className="text-accent" /> {tp(lang, 'ui.logging.heading')}
          <span className="ms-auto normal-case">
            <StatusPill on={cfg.enabled} lang={lang} />
          </span>
        </h2>
        <LoggingForm initial={cfg} guild={guild} />
      </section>
    </div>
  );
}
