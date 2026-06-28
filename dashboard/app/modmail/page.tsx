import { Mails } from 'lucide-react';
import ModmailForm from '../../components/ModmailForm';
import StatusPill from '../../components/StatusPill';
import { getModmailConfig } from '../../lib/community';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function ModmailPage() {
  const [cfg, guild, lang] = await Promise.all([
    getModmailConfig(),
    getGuildMeta(),
    getPanelLocale(),
  ]);
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted">{tp(lang, 'ui.modmail.intro')}</p>
        <StatusPill on={cfg.enabled} lang={lang} />
      </header>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Mails size={16} className="text-accent" /> Modmail
          <span className="ms-auto normal-case">
            <StatusPill on={cfg.enabled} lang={lang} />
          </span>
        </h2>
        <ModmailForm initial={cfg} guild={guild} />
      </section>
    </div>
  );
}
