import { DoorOpen } from 'lucide-react';
import WelcomeForm from '../../components/WelcomeForm';
import { getWelcomeConfig } from '../../lib/community';

export const dynamic = 'force-dynamic';

export default async function WelcomePage() {
  const cfg = await getWelcomeConfig();
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Powitania nowych członków + automatyczna rola na wejście. Bot wysyła wiadomość na wskazany
        kanał i nadaje rolę (config sterowany z panelu).{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">Powitania: WŁĄCZONE</span>
        ) : (
          <span className="font-semibold text-accent">Powitania: WYŁĄCZONE</span>
        )}
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <DoorOpen size={16} className="text-accent" /> Powitania + autorole
        </h2>
        <WelcomeForm initial={cfg} />
      </section>
    </div>
  );
}
