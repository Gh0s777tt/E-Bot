import { Cake } from 'lucide-react';
import BirthdayForm from '../../components/BirthdayForm';
import StatusPill from '../../components/StatusPill';
import { getBirthdayConfig } from '../../lib/community';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function BirthdaysPage() {
  const [cfg, guild, lang] = await Promise.all([
    getBirthdayConfig(),
    getGuildMeta(),
    getPanelLocale(),
  ]);
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted">{tp(lang, 'ui.birthdays.intro')}</p>
        <StatusPill on={cfg.enabled} lang={lang} />
      </header>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Cake size={16} className="text-accent" /> {tp(lang, 'ui.birthdays.heading')}
          <span className="ms-auto normal-case">
            <StatusPill on={cfg.enabled} lang={lang} />
          </span>
        </h2>
        <BirthdayForm initial={cfg} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5 text-sm text-muted">
        <h2 className="mb-3 font-display text-lg font-semibold tracking-wide text-white/90">
          {tp(lang, 'ui.birthdays.otherTitle')}
        </h2>
        <p className="space-y-1">
          {tp(lang, 'ui.birthdays.afkLine')}
          <br />
          {tp(lang, 'ui.birthdays.highlightLine')}
          <br />
          {tp(lang, 'ui.birthdays.bothLine')}
        </p>
      </section>
    </div>
  );
}
