import { DoorOpen } from 'lucide-react';
import WelcomeForm from '../../components/WelcomeForm';
import { getWelcomeConfig } from '../../lib/community';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function WelcomePage() {
  const [cfg, guild, lang] = await Promise.all([
    getWelcomeConfig(),
    getGuildMeta(),
    getPanelLocale(),
  ]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        {tp(lang, 'ui.welcome.intro')}{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">{tp(lang, 'ui.welcome.statusOn')}</span>
        ) : (
          <span className="font-semibold text-accent">{tp(lang, 'ui.welcome.statusOff')}</span>
        )}
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <DoorOpen size={16} className="text-accent" /> {tp(lang, 'ui.welcome.heading')}
        </h2>
        <WelcomeForm initial={cfg} guild={guild} />
      </section>
    </div>
  );
}
