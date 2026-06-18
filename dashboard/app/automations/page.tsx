import { Zap } from 'lucide-react';
import AutomationsForm from '../../components/AutomationsForm';
import { getAutomationsConfig } from '../../lib/community';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function AutomationsPage() {
  const [cfg, guild, lang] = await Promise.all([
    getAutomationsConfig(),
    getGuildMeta(),
    getPanelLocale(),
  ]);

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">{tp(lang, 'ui.automations.intro')}</p>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Zap size={16} className="text-accent" /> {tp(lang, 'ui.automations.heading')}
        </h2>
        <AutomationsForm initial={cfg} guild={guild} />
      </section>
    </div>
  );
}
