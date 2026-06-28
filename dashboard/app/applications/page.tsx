import { ClipboardList } from 'lucide-react';
import ApplicationsForm from '../../components/ApplicationsForm';
import { getApplicationsConfig } from '../../lib/community';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage() {
  const [cfg, guild, lang] = await Promise.all([
    getApplicationsConfig(),
    getGuildMeta(),
    getPanelLocale(),
  ]);

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        {tp(lang, 'ui.applications.introPre')}
        <code className="text-accent">/applypanel</code>
        {tp(lang, 'ui.applications.introPost')}
      </p>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <ClipboardList size={16} className="text-accent" /> {tp(lang, 'ui.applications.heading')}
        </h2>
        <ApplicationsForm initial={cfg} guild={guild} />
      </section>
    </div>
  );
}
