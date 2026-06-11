import SettingsForm from '../../components/SettingsForm';
import TopNav from '../../components/TopNav';
import { t } from '../../lib/i18n';
import { getServerLocale } from '../../lib/serverLocale';
import { getSettings } from '../../lib/settings';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const lang = await getServerLocale();
  const settings = getSettings();

  return (
    <main className="min-h-screen bg-bg pb-24">
      <TopNav />
      <div className="mx-auto max-w-2xl px-4 pt-24 md:px-6">
        <h1 className="mb-1 text-3xl font-extrabold">{t(lang, 'settings.title')}</h1>
        <p className="mb-8 text-sm text-muted">{t(lang, 'settings.subtitle')}</p>
        <SettingsForm initial={settings} />
      </div>
    </main>
  );
}
