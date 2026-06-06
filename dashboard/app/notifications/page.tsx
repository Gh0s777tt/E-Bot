import { getSettings } from '../../lib/data';
import NotifSettingsForm from '../../components/NotifSettingsForm';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const settings = await getSettings();
  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-muted">
        Bot sprawdza status „live" przez polling (Twitch/Kick/Rumble co ~60 s; YouTube opcjonalnie). Gdy kanał
        przechodzi z offline na online, wysyła embed na wskazany kanał Discord. Zmiany zapisują się do bazy i bot
        stosuje je <strong>na żywo</strong>.
      </p>
      <NotifSettingsForm initial={settings} />
    </div>
  );
}
