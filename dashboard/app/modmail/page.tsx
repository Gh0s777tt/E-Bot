import { Mails } from 'lucide-react';
import ModmailForm from '../../components/ModmailForm';
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
      <p className="max-w-3xl text-sm text-muted">
        {tp(lang, 'ui.modmail.intro')}{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">{tp(lang, 'ui.modmail.statusOn')}</span>
        ) : (
          <span className="font-semibold text-accent">{tp(lang, 'ui.modmail.statusOff')}</span>
        )}
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Mails size={16} className="text-accent" /> Modmail
        </h2>
        <ModmailForm initial={cfg} guild={guild} />
      </section>
    </div>
  );
}
