import { Activity } from 'lucide-react';
import CountersForm from '../../components/CountersForm';
import { getCountersConfig } from '../../lib/community';
import { getGuildMeta } from '../../lib/guild';

export const dynamic = 'force-dynamic';

export default async function CountersPage() {
  const [cfg, guild] = await Promise.all([getCountersConfig(), getGuildMeta()]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Liczniki kanałów — nazwy wybranych kanałów (zwykle zablokowanych głosowych) pokazują
        statystyki serwera: liczbę członków, boostów, kanałów lub ról. Bot aktualizuje je co ~10
        minut.{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">Liczniki: WŁĄCZONE</span>
        ) : (
          <span className="font-semibold text-accent">Liczniki: WYŁĄCZONE</span>
        )}
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Activity size={16} className="text-accent" /> Liczniki kanałów
        </h2>
        <CountersForm initial={cfg} guild={guild} />
      </section>
    </div>
  );
}
