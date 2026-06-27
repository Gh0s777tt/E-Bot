import { MessageSquarePlus } from 'lucide-react';
import ResponderForm from '../../components/ResponderForm';
import StatusPill from '../../components/StatusPill';
import { getResponderConfig } from '../../lib/community';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function ResponderPage() {
  const [cfg, lang] = await Promise.all([getResponderConfig(), getPanelLocale()]);
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted">{tp(lang, 'ui.responder.intro')}</p>
        <StatusPill on={cfg.enabled} lang={lang} />
      </header>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <MessageSquarePlus size={16} className="text-accent" /> {tp(lang, 'ui.responder.heading')}
          <span className="ms-auto normal-case">
            <StatusPill on={cfg.enabled} lang={lang} />
          </span>
        </h2>
        <ResponderForm initial={cfg} />
      </section>
    </div>
  );
}
