import { ScrollText } from 'lucide-react';
import LoggingForm from '../../components/LoggingForm';
import { getLoggingConfig } from '../../lib/community';
import { getGuildMeta } from '../../lib/guild';

export const dynamic = 'force-dynamic';

export default async function LoggingPage() {
  const [cfg, guild] = await Promise.all([getLoggingConfig(), getGuildMeta()]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Dziennik zdarzeń serwera — bot wysyła embed na wybrany kanał przy: usunięciu/edycji
        wiadomości, dołączeniu/wyjściu członków, zmianie nicku/ról, banach, tworzeniu/usuwaniu
        kanałów i ról oraz aktywności na voice. Każdą grupę włączasz osobno. Konfigurację bot
        pobiera na żywo (~30 s).{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">Logi: WŁĄCZONE</span>
        ) : (
          <span className="font-semibold text-accent">Logi: WYŁĄCZONE</span>
        )}
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <ScrollText size={16} className="text-accent" /> Logi serwera
        </h2>
        <LoggingForm initial={cfg} guild={guild} />
      </section>
    </div>
  );
}
