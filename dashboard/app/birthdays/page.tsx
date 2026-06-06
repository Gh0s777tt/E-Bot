import { Cake } from 'lucide-react';
import BirthdayForm from '../../components/BirthdayForm';
import { getBirthdayConfig } from '../../lib/community';
import { getGuildMeta } from '../../lib/guild';

export const dynamic = 'force-dynamic';

export default async function BirthdaysPage() {
  const [cfg, guild] = await Promise.all([getBirthdayConfig(), getGuildMeta()]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Urodziny społeczności — bot raz dziennie ogłasza solenizantów na wybranym kanale i może
        nadać im rolę na ten dzień. Użytkownicy ustawiają datę komendą{' '}
        <code className="text-accent">/birthday set</code> (lub <code>/birthday clear</code>).{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">Urodziny: WŁĄCZONE</span>
        ) : (
          <span className="font-semibold text-accent">Urodziny: WYŁĄCZONE</span>
        )}
      </p>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Cake size={16} className="text-accent" /> Urodziny
        </h2>
        <BirthdayForm initial={cfg} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5 text-sm text-muted">
        <h2 className="mb-3 text-base font-semibold uppercase tracking-wide text-white/90">
          Pozostałe funkcje osobiste
        </h2>
        <p className="space-y-1">
          <strong className="text-white/90">AFK</strong> —{' '}
          <code className="text-accent">/afk [powód]</code> ustawia status; powrót czyści go
          automatycznie, a wzmianka osoby AFK informuje rozmówcę.
          <br />
          <strong className="text-white/90">Highlighty</strong> —{' '}
          <code className="text-accent">/highlight add|remove|list</code>: bot wysyła DM, gdy Twoje
          słowo-klucz padnie w czacie (z poszanowaniem dostępu do kanału).
          <br />
          Oba moduły włączysz w <strong>Centrum sterowania</strong> (domyślnie wyłączone).
        </p>
      </section>
    </div>
  );
}
