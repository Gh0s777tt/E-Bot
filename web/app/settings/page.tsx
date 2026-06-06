import { getSettings } from '../../lib/settings';
import TopNav from '../../components/TopNav';
import SettingsForm from '../../components/SettingsForm';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const settings = getSettings();

  return (
    <main className="min-h-screen bg-bg pb-24">
      <TopNav />
      <div className="mx-auto max-w-2xl px-4 pt-24 md:px-6">
        <h1 className="mb-1 text-3xl font-extrabold">Ustawienia powiadomień</h1>
        <p className="mb-8 text-sm text-muted">
          Konfiguracja zapisuje się do bazy; bot czyta ją na żywo (bez restartu).
        </p>
        <SettingsForm initial={settings} />
      </div>
    </main>
  );
}
