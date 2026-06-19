import {
  Activity,
  Archive,
  Bot,
  Cloud,
  Languages,
  Palette,
  Server,
  UserCheck,
  Users,
} from 'lucide-react';
import BotCustomizeForm from '../../components/BotCustomizeForm';
import BotLanguageForm from '../../components/BotLanguageForm';
import BotPresenceForm from '../../components/BotPresenceForm';
import ConfigBackupForm from '../../components/ConfigBackupForm';
import PanelAccessList from '../../components/PanelAccessList';
import PanelUsersForm from '../../components/PanelUsersForm';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import { normalizeBotLocale } from '../../lib/botLocales';
import { getBotProfile } from '../../lib/botProfile';
import { activeSource, getRawSetting, getStats } from '../../lib/data';
import { getPanelAccessList } from '../../lib/panelAccess';
import { tp } from '../../lib/panelI18n';
import { currentRole, currentSession, getStaff } from '../../lib/panelRoles';
import { getPanelLocale } from '../../lib/serverPanelLocale';
import { hasSupabase } from '../../lib/supabase';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const [src, stats, botProfile, presenceRaw, localeRaw, role, staff, access, session, lang] =
    await Promise.all([
      activeSource(),
      getStats(),
      getBotProfile(),
      getRawSetting('bot_presence'),
      getRawSetting('locale'),
      currentRole(),
      getStaff(),
      getPanelAccessList(),
      currentSession(),
      getPanelLocale(),
    ]);
  const botLocale = normalizeBotLocale(localeRaw);

  let presence = { status: 'online', type: 'none', text: '', url: '' };
  if (presenceRaw) {
    try {
      presence = { ...presence, ...(JSON.parse(presenceRaw) as Record<string, string>) };
    } catch {
      /* domyślne */
    }
  }

  const rows: { label: string; value: string }[] = [
    {
      label: tp(lang, 'ui.settings.sysSource'),
      value:
        src === 'supabase'
          ? tp(lang, 'ui.settings.sysSourceSupabase')
          : src === 'sqlite'
            ? tp(lang, 'ui.settings.sysSourceSqlite')
            : tp(lang, 'ui.settings.sysSourceNone'),
    },
    {
      label: tp(lang, 'ui.settings.sysSupabaseConfigured'),
      value: hasSupabase ? tp(lang, 'ui.settings.sysYesKeys') : tp(lang, 'ui.settings.sysNo'),
    },
    { label: tp(lang, 'ui.settings.sysGamesInLibrary'), value: String(stats.total) },
    { label: tp(lang, 'ui.settings.sysHosting'), value: 'Vercel (kraina-duchow / e-bot)' },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Bot size={16} className="text-accent" /> {tp(lang, 'ui.settings.headingCustomize')}
        </h2>
        <BotCustomizeForm initial={botProfile} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Activity size={16} className="text-accent" /> {tp(lang, 'ui.settings.headingPresence')}
        </h2>
        <BotPresenceForm initial={presence} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Languages size={16} className="text-accent" /> {tp(lang, 'ui.settings.headingLanguage')}
        </h2>
        <BotLanguageForm initial={botLocale} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Palette size={16} className="text-accent" /> {tp(lang, 'ui.settings.headingTheme')}
        </h2>
        <ThemeSwitcher />
        <p className="mt-3 text-xs text-muted">{tp(lang, 'ui.settings.themeNote')}</p>
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Server size={16} className="text-accent" /> {tp(lang, 'ui.settings.headingSystem')}
        </h2>
        <dl className="space-y-3 text-sm">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex justify-between gap-4 border-b border-line/60 pb-2 last:border-0"
            >
              <dt className="text-muted">{r.label}</dt>
              <dd className="text-right font-medium">{r.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Archive size={16} className="text-accent" /> {tp(lang, 'ui.settings.headingBackup')}
        </h2>
        <ConfigBackupForm />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <UserCheck size={16} className="text-accent" /> {tp(lang, 'ui.settings.headingAccess')}
        </h2>
        <PanelAccessList entries={access} currentUid={session?.uid} lang={lang} />
      </section>

      {role === 'admin' && (
        <section className="panel-glow rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
            <Users size={16} className="text-accent" /> {tp(lang, 'ui.settings.headingUsers')}
          </h2>
          <PanelUsersForm initial={staff} />
        </section>
      )}

      <section className="panel-glow rounded-2xl border border-line bg-card p-5 text-sm text-muted">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold uppercase tracking-wide text-white">
          <Cloud size={16} className="text-accent" /> {tp(lang, 'ui.settings.headingDeploy')}
        </h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            {tp(lang, 'ui.settings.deployStep1Pre')}{' '}
            <code className="text-accent">supabase/schema.sql</code>{' '}
            {tp(lang, 'ui.settings.deployStep1Post')}
          </li>
          <li>
            {tp(lang, 'ui.settings.deployStep2Pre')}{' '}
            <code className="text-accent">npm run seed</code>{' '}
            {tp(lang, 'ui.settings.deployStep2Post')}
          </li>
          <li>{tp(lang, 'ui.settings.deployStep3')}</li>
        </ol>
      </section>
    </div>
  );
}
