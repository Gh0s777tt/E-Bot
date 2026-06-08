import {
  BarChart3,
  Flame,
  Gamepad2,
  MessageSquare,
  Mic,
  Ticket,
  Trophy,
  Users,
} from 'lucide-react';
import AreaChart from '../../components/AreaChart';
import DigestForm from '../../components/DigestForm';
import StatCard from '../../components/StatCard';
import { getDigestConfig } from '../../lib/community';
import { getStats } from '../../lib/data';
import {
  getActivitySeries,
  getAiUsageSeries,
  getAiUsageToday,
  getHourlyActivity,
  getLeaderboard,
  getTickets,
  getTopActiveUsers,
  ticketStats,
} from '../../lib/faza4';
import { getGuildMeta } from '../../lib/guild';

export const dynamic = 'force-dynamic';

const PLATFORM_LABEL: Record<string, string> = {
  steam: 'Steam',
  psn: 'PlayStation',
  gog: 'GOG',
  ubisoft: 'Ubisoft',
};

export default async function StatsPage() {
  const [stats, aiSeries, aiToday, board, tickets, activity, digest, guild, topUsers, hourly] =
    await Promise.all([
      getStats(),
      getAiUsageSeries(14),
      getAiUsageToday(),
      getLeaderboard(8),
      getTickets(200),
      getActivitySeries(14),
      getDigestConfig(),
      getGuildMeta(),
      getTopActiveUsers(14, 10),
      getHourlyActivity(),
    ]);
  const hourMax = Math.max(1, ...hourly);
  const heat = hourly.map((count, hour) => ({ hour, count }));
  const tk = ticketStats(tickets);
  const xpMax = Math.max(1, ...board.map((u) => u.xp));
  const actTotals = activity.reduce(
    (a, p) => ({
      messages: a.messages + p.messages,
      joins: a.joins + p.joins,
      leaves: a.leaves + p.leaves,
      voice: a.voice + p.voice,
    }),
    { messages: 0, joins: 0, leaves: 0, voice: 0 },
  );

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Przegląd aktywności: zużycie AI, ranking XP, tickety i biblioteka — na podstawie danych z
        Supabase. Odświeża się na bieżąco.
      </p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Gry" value={stats.total} icon={<Gamepad2 size={14} />} accent />
        <StatCard
          label="AI zapytań dziś"
          value={aiToday.totalRequests}
          icon={<MessageSquare size={14} />}
        />
        <StatCard label="W rankingu XP" value={board.length} icon={<Trophy size={14} />} />
        <StatCard label="Tickety otwarte" value={tk.open} icon={<Ticket size={14} />} />
      </div>

      {/* AI — 14 dni */}
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <BarChart3 size={16} className="text-accent" /> Zużycie AI — ostatnie 14 dni (zapytania)
        </h2>
        <AreaChart values={aiSeries.map((p) => p.requests)} height={150} />
        <div className="mt-1 flex justify-between text-[10px] text-muted">
          <span>{aiSeries[0]?.day.slice(5)}</span>
          <span>{aiSeries[aiSeries.length - 1]?.day.slice(5)}</span>
        </div>
        {aiToday.totalRequests === 0 && aiSeries.every((p) => p.requests === 0) && (
          <p className="mt-2 text-xs text-muted">
            Brak zużycia AI. Użyj `/ai` na Discordzie, by zobaczyć dane.
          </p>
        )}
      </section>

      {/* Aktywność serwera — 14 dni */}
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <BarChart3 size={16} className="text-accent" /> Aktywność serwera — ostatnie 14 dni
          (wiadomości)
        </h2>
        <AreaChart values={activity.map((p) => p.messages)} height={150} />
        <div className="mt-1 flex justify-between text-[10px] text-muted">
          <span>{activity[0]?.day.slice(5)}</span>
          <span>{activity[activity.length - 1]?.day.slice(5)}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <span>
            💬 Wiadomości (14 dni):{' '}
            <strong className="text-accent">{actTotals.messages.toLocaleString('pl-PL')}</strong>
          </span>
          <span>
            📥 Wejścia: <strong className="text-green-400">{actTotals.joins}</strong>
          </span>
          <span>
            📤 Wyjścia: <strong className="text-accent">{actTotals.leaves}</strong>
          </span>
          <span>
            🎙️ Voice (min):{' '}
            <strong className="text-accent">{actTotals.voice.toLocaleString('pl-PL')}</strong>
          </span>
        </div>
        {actTotals.messages === 0 && (
          <p className="mt-2 text-xs text-muted">
            Brak danych aktywności. Pojawią się po aktywności na serwerze (wymaga{' '}
            <code>_ALL.sql</code> w Supabase).
          </p>
        )}
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Mic size={16} className="text-accent" /> Tygodniowy digest
        </h2>
        <DigestForm initial={digest} guild={guild} />
      </section>

      {/* Top XP */}
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Trophy size={16} className="text-accent" /> Top XP
        </h2>
        {board.length === 0 ? (
          <p className="text-sm text-muted">Brak danych. Włącz leveling i pisz na Discordzie.</p>
        ) : (
          <div className="space-y-2">
            {board.map((u, i) => (
              <div key={u.user_id} className="flex items-center gap-3">
                <span className="w-6 text-right text-sm text-muted">{i + 1}</span>
                <span className="w-40 truncate text-sm">{u.username ?? u.user_id}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(u.xp / xpMax) * 100}%` }}
                  />
                </div>
                <span className="w-20 text-right text-sm">
                  lvl {u.level} · {u.xp.toLocaleString('pl-PL')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Top aktywni — 14 dni */}
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Users size={16} className="text-accent" /> Top aktywni — 14 dni
        </h2>
        {topUsers.length === 0 ? (
          <p className="text-sm text-muted">
            Brak danych (wymaga <code>user_activity</code> w Supabase).
          </p>
        ) : (
          <div className="space-y-2">
            {topUsers.map((u, i) => (
              <div key={u.user_id} className="flex items-center gap-3 text-sm">
                <span className="w-6 text-right text-muted">{i + 1}</span>
                <span className="w-44 truncate">{u.username}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(u.messages / Math.max(1, topUsers[0].messages)) * 100}%` }}
                  />
                </div>
                <span className="w-28 text-right text-muted">
                  {u.messages} wiad · {u.voice_min}m
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Heatmapa godzinowa */}
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Flame size={16} className="text-accent" /> Aktywność wg godziny (UTC)
        </h2>
        <div className="flex h-32 items-end gap-1">
          {heat.map((b) => (
            <div
              key={`hr-${b.hour}`}
              className="group flex flex-1 flex-col items-center justify-end"
              title={`${b.hour}:00 — ${b.count} wiad.`}
            >
              <div
                className="w-full rounded-t bg-accent/70 transition group-hover:bg-accent"
                style={{ height: `${(b.count / hourMax) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted">
          <span>0h</span>
          <span>12h</span>
          <span>23h</span>
        </div>
      </section>

      {/* Tickety + biblioteka */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel-glow rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
            <Ticket size={16} className="text-accent" /> Tickety
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              🟥 Otwarte: <strong className="text-accent">{tk.open}</strong>
            </li>
            <li>
              🟨 Przejęte: <strong>{tk.claimed}</strong>
            </li>
            <li>
              ⬜ Zamknięte: <strong className="text-muted">{tk.closed}</strong>
            </li>
          </ul>
        </section>

        <section className="panel-glow rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
            <Gamepad2 size={16} className="text-accent" /> Biblioteka wg platformy
          </h2>
          <div className="space-y-2">
            {Object.entries(stats.byPlatform).map(([p, n]) => (
              <div key={p} className="flex items-center gap-3">
                <span className="w-24 text-sm text-muted">{PLATFORM_LABEL[p] ?? p}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${stats.total ? (n / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm">{n}</span>
              </div>
            ))}
            {!Object.keys(stats.byPlatform).length && (
              <p className="text-sm text-muted">Brak danych.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
