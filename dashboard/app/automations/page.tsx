import { Zap } from 'lucide-react';
import AutomationsForm from '../../components/AutomationsForm';
import { getAutomationsConfig } from '../../lib/community';
import { getGuildMeta } from '../../lib/guild';

export const dynamic = 'force-dynamic';

export default async function AutomationsPage() {
  const [cfg, guild] = await Promise.all([getAutomationsConfig(), getGuildMeta()]);

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Automatyzacje „jeśli–to": gdy zajdzie wydarzenie (ktoś dołączy / pojawi się słowo-klucz),
        bot wykona akcję (wyśle wiadomość, nada rolę lub wyśle DM). W treści użyj{' '}
        <code className="text-accent">{'{user}'}</code> jako wzmianki. Reguły bot stosuje na żywo.
      </p>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Zap size={16} className="text-accent" /> Reguły automatyzacji
        </h2>
        <AutomationsForm initial={cfg} guild={guild} />
      </section>
    </div>
  );
}
