import { MessageSquarePlus } from 'lucide-react';
import ResponderForm from '../../components/ResponderForm';
import { getResponderConfig } from '../../lib/community';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function ResponderPage() {
  const [cfg, lang] = await Promise.all([getResponderConfig(), getPanelLocale()]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        {tp(lang, 'ui.responder.intro')}{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">{tp(lang, 'ui.responder.statusOn')}</span>
        ) : (
          <span className="font-semibold text-accent">{tp(lang, 'ui.responder.statusOff')}</span>
        )}
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <MessageSquarePlus size={16} className="text-accent" /> {tp(lang, 'ui.responder.heading')}
        </h2>
        <ResponderForm initial={cfg} />
      </section>
    </div>
  );
}
