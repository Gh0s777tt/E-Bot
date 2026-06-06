import { Radio } from 'lucide-react';
import NotifSettingsForm from '../../components/NotifSettingsForm';
import { getSettings } from '../../lib/data';
import { getGuildMeta } from '../../lib/guild';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const [settings, guild] = await Promise.all([getSettings(), getGuildMeta()]);
  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-muted">
        Bot sprawdza status „live" przez polling (Twitch/Kick/Rumble co ~60 s; YouTube opcjonalnie).
        Gdy kanał przechodzi z offline na online, wysyła embed na wskazany kanał Discord. Zmiany
        zapisują się do bazy i bot stosuje je <strong>na żywo</strong>.
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Radio size={16} className="text-accent" /> Powiadomienia live
        </h2>
        <NotifSettingsForm initial={settings} guild={guild} />
      </section>
    </div>
  );
}
