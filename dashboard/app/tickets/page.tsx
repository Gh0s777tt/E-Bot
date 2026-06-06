import { CheckCircle2, Hand, Inbox, Ticket } from 'lucide-react';
import StatCard from '../../components/StatCard';
import TicketCloseButton from '../../components/TicketCloseButton';
import TicketsConfigForm from '../../components/TicketsConfigForm';
import { getTickets, getTicketsConfig, ticketStats } from '../../lib/faza4';
import { getGuildMeta } from '../../lib/guild';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  open: 'Otwarty',
  claimed: 'Przejęty',
  closed: 'Zamknięty',
};

export default async function TicketsPage() {
  const [cfg, rows, guild] = await Promise.all([
    getTicketsConfig(),
    getTickets(100),
    getGuildMeta(),
  ]);
  const stats = ticketStats(rows);

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        System ticketów: użytkownik otwiera zgłoszenie, bot tworzy prywatny wątek, a Ty zarządzasz
        stąd i z Discorda. Konfigurację zapisujesz tu (do Supabase).{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">Tickety: WŁĄCZONE</span>
        ) : (
          <span className="font-semibold text-accent">Tickety: WYŁĄCZONE</span>
        )}
      </p>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Otwarte" value={stats.open} icon={<Inbox size={14} />} accent />
        <StatCard label="Przejęte" value={stats.claimed} icon={<Hand size={14} />} />
        <StatCard label="Zamknięte" value={stats.closed} icon={<CheckCircle2 size={14} />} />
      </div>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Ticket size={16} className="text-accent" /> Konfiguracja ticketów
        </h2>
        <TicketsConfigForm initial={cfg} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Inbox size={16} className="text-accent" /> Zgłoszenia
        </h2>
        {rows.length === 0 ? (
          <p className="text-sm text-muted">
            Brak zgłoszeń. Po uruchomieniu{' '}
            <code className="text-accent">scripts/faza4-schema.sql</code> w Supabase i włączeniu
            logiki po stronie bota, tickety pojawią się tutaj.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Użytkownik</th>
                  <th className="py-2 pr-3">Temat</th>
                  <th className="py-2 pr-3">Utworzono</th>
                  <th className="py-2 pr-3">Ocena</th>
                  <th className="py-2">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="border-b border-line/50">
                    <td className="py-2 pr-3">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                          t.status === 'open'
                            ? 'bg-accent/15 text-accent'
                            : t.status === 'claimed'
                              ? 'bg-yellow-500/15 text-yellow-400'
                              : 'bg-white/10 text-muted'
                        }`}
                      >
                        {STATUS_LABEL[t.status] ?? t.status}
                      </span>
                    </td>
                    <td className="py-2 pr-3">{t.username ?? t.user_id}</td>
                    <td className="py-2 pr-3">{t.subject ?? '—'}</td>
                    <td className="py-2 pr-3 text-muted">
                      {new Date(t.created_at).toLocaleString('pl-PL')}
                    </td>
                    <td className="py-2 pr-3 text-yellow-400">
                      {t.rating ? '⭐'.repeat(t.rating) : '—'}
                    </td>
                    <td className="py-2">
                      {t.status !== 'closed' && <TicketCloseButton id={t.id} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
