import { CheckCircle2, Eye, Hand, Inbox, Plus, Ticket } from 'lucide-react';
import StatCard from '../../components/StatCard';
import StatusPill from '../../components/StatusPill';
import TicketCloseButton from '../../components/TicketCloseButton';
import TicketsConfigForm from '../../components/TicketsConfigForm';
import { getTickets, getTicketsConfig, ticketStats } from '../../lib/faza4';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function TicketsPage() {
  const [cfg, rows, guild, lang] = await Promise.all([
    getTicketsConfig(),
    getTickets(100),
    getGuildMeta(),
    getPanelLocale(),
  ]);
  const stats = ticketStats(rows);
  const statusLabel: Record<string, string> = {
    open: tp(lang, 'ui.tickets.stOpen'),
    claimed: tp(lang, 'ui.tickets.stClaimed'),
    closed: tp(lang, 'ui.tickets.stClosed'),
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted">{tp(lang, 'ui.tickets.intro')}</p>
        <StatusPill on={cfg.enabled} lang={lang} />
      </header>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label={tp(lang, 'ui.tickets.statOpen')}
          value={stats.open}
          icon={<Inbox size={14} />}
          accent
        />
        <StatCard
          label={tp(lang, 'ui.tickets.statClaimed')}
          value={stats.claimed}
          icon={<Hand size={14} />}
        />
        <StatCard
          label={tp(lang, 'ui.tickets.statClosed')}
          value={stats.closed}
          icon={<CheckCircle2 size={14} />}
        />
      </div>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Ticket size={16} className="text-accent" /> {tp(lang, 'ui.tickets.cfgHeading')}
          <span className="ms-auto normal-case">
            <StatusPill on={cfg.enabled} lang={lang} />
          </span>
        </h2>
        <TicketsConfigForm initial={cfg} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Eye size={16} className="text-accent" /> {tp(lang, 'ui.cmd.preview')}
        </h2>
        <div className="max-w-md rounded-xl border border-line bg-bg/40 p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-[11px] font-semibold text-white">
              E
            </span>
            <span className="text-xs font-medium">E-BOT</span>
            <span className="rounded bg-elevated px-1.5 py-0.5 text-[10px] text-muted">bot</span>
          </div>
          <div className="cmd-embed">
            <p className="text-sm leading-relaxed">{cfg.panelMessage}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white">
              <Plus size={13} /> Ticket
            </span>
          </div>
        </div>
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Inbox size={16} className="text-accent" /> {tp(lang, 'ui.tickets.listHeading')}
        </h2>
        {rows.length === 0 ? (
          <p className="text-sm text-muted">{tp(lang, 'ui.tickets.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-start text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pe-3">{tp(lang, 'ui.tickets.colStatus')}</th>
                  <th className="py-2 pe-3">{tp(lang, 'ui.tickets.colUser')}</th>
                  <th className="py-2 pe-3">{tp(lang, 'ui.tickets.colSubject')}</th>
                  <th className="py-2 pe-3">{tp(lang, 'ui.tickets.colCreated')}</th>
                  <th className="py-2 pe-3">{tp(lang, 'ui.tickets.colRating')}</th>
                  <th className="py-2">{tp(lang, 'ui.tickets.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="border-b border-line/50">
                    <td className="py-2 pe-3">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                          t.status === 'open'
                            ? 'bg-accent/15 text-accent'
                            : t.status === 'claimed'
                              ? 'bg-yellow-500/15 text-yellow-400'
                              : 'bg-white/10 text-muted'
                        }`}
                      >
                        {statusLabel[t.status] ?? t.status}
                      </span>
                    </td>
                    <td className="py-2 pe-3">{t.username ?? t.user_id}</td>
                    <td className="py-2 pe-3">{t.subject ?? '—'}</td>
                    <td className="py-2 pe-3 text-muted">
                      {new Date(t.created_at).toLocaleString(lang)}
                    </td>
                    <td className="py-2 pe-3 text-yellow-400">
                      {t.rating ? '⭐'.repeat(t.rating) : '—'}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        {t.status !== 'closed' && <TicketCloseButton id={t.id} />}
                        {t.channel_id && (
                          <a
                            href={`/api/tickets/transcript?channel=${t.channel_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md border border-line px-2 py-0.5 text-xs text-muted transition hover:border-accent hover:text-white"
                          >
                            {tp(lang, 'ui.tickets.transcript')}
                          </a>
                        )}
                      </div>
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
