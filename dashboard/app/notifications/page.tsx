import { Radio, Tv } from 'lucide-react';
import NotifSettingsForm from '../../components/NotifSettingsForm';
import StatusPill from '../../components/StatusPill';
import TwitchSubForm from '../../components/TwitchSubForm';
import { getTwitchSubConfig } from '../../lib/community';
import { getSettings } from '../../lib/data';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const [settings, guild, twitchSub, lang] = await Promise.all([
    getSettings(),
    getGuildMeta(),
    getTwitchSubConfig(),
    getPanelLocale(),
  ]);
  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-muted">{tp(lang, 'ui.notify.intro')}</p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Radio size={16} className="text-accent" /> {tp(lang, 'ui.notify.heading1')}
        </h2>
        <NotifSettingsForm initial={settings} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Tv size={16} className="text-accent" /> {tp(lang, 'ui.notify.heading2')}
          <span className="ms-auto normal-case">
            <StatusPill on={twitchSub.enabled} lang={lang} />
          </span>
        </h2>
        <TwitchSubForm initial={twitchSub} guild={guild} />
      </section>
    </div>
  );
}
