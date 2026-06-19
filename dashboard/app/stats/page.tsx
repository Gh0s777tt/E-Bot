import {
  BarChart3,
  Flame,
  Gamepad2,
  MessageSquare,
  Mic,
  Ticket,
  TrendingUp,
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
import { getServerHistory } from '../../lib/insights';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

const PLATFORM_LABEL: Record<string, string> = {
  steam: 'Steam',
  psn: 'PlayStation',
  gog: 'GOG',
  ubisoft: 'Ubisoft',
};

export default async function StatsPage() {
  const [
    stats,
    aiSeries,
    aiToday,
    board,
    tickets,
    activity,
    digest,
    guild,
    topUsers,
    hourly,
    history,
    lang,
  ] = await Promise.all([
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
    getServerHistory(),
    getPanelLocale(),
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
  // Wzrost serwera (członkowie w czasie) + rotacja (przyjścia/odejścia) — retencja.
  const members = history.map((h) => h.members);
  const memEnough = members.length >= 2;
  const memLast = members.at(-1) ?? 0;
  const memDelta = memLast - (members[0] ?? 0);
  const joinsTrend = activity.map((p) => p.joins);
  const leavesTrend = activity.map((p) => p.leaves);

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">{tp(lang, 'ui.stats.intro')}</p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={tp(lang, 'ui.stats.cardGames')}
          value={stats.total}
          icon={<Gamepad2 size={14} />}
          accent
        />
        <StatCard
          label={tp(lang, 'ui.stats.cardAiToday')}
          value={aiToday.totalRequests}
          icon={<MessageSquare size={14} />}
        />
        <StatCard
          label={tp(lang, 'ui.stats.cardRanked')}
          value={board.length}
          icon={<Trophy size={14} />}
        />
        <StatCard
          label={tp(lang, 'ui.stats.cardTicketsOpen')}
          value={tk.open}
          icon={<Ticket size={14} />}
        />
      </div>

      {/* AI — 14 dni */}
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <BarChart3 size={16} className="text-accent" /> {tp(lang, 'ui.stats.aiHeading')}
        </h2>
        <AreaChart values={aiSeries.map((p) => p.requests)} height={150} />
        <div className="mt-1 flex justify-between text-[10px] text-muted">
          <span>{aiSeries[0]?.day.slice(5)}</span>
          <span>{aiSeries[aiSeries.length - 1]?.day.slice(5)}</span>
        </div>
        {aiToday.totalRequests === 0 && aiSeries.every((p) => p.requests === 0) && (
          <p className="mt-2 text-xs text-muted">{tp(lang, 'ui.stats.aiEmpty')}</p>
        )}
      </section>

      {/* Aktywność serwera — 14 dni */}
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <BarChart3 size={16} className="text-accent" /> {tp(lang, 'ui.stats.activityHeading')}
        </h2>
        <AreaChart values={activity.map((p) => p.messages)} height={150} />
        <div className="mt-1 flex justify-between text-[10px] text-muted">
          <span>{activity[0]?.day.slice(5)}</span>
          <span>{activity[activity.length - 1]?.day.slice(5)}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <span>
            {tp(lang, 'ui.stats.actMessages')}{' '}
            <strong className="text-accent">{actTotals.messages.toLocaleString('pl-PL')}</strong>
          </span>
          <span>
            {tp(lang, 'ui.stats.actJoins')}{' '}
            <strong className="text-green-400">{actTotals.joins}</strong>
          </span>
          <span>
            {tp(lang, 'ui.stats.actLeaves')}{' '}
            <strong className="text-accent">{actTotals.leaves}</strong>
          </span>
          <span>
            {tp(lang, 'ui.stats.actVoice')}{' '}
            <strong className="text-accent">{actTotals.voice.toLocaleString('pl-PL')}</strong>
          </span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-xs text-muted">{tp(lang, 'ui.stats.actJoins')}</div>
            <AreaChart values={joinsTrend} height={90} />
          </div>
          <div>
            <div className="mb-1 text-xs text-muted">{tp(lang, 'ui.stats.actLeaves')}</div>
            <AreaChart values={leavesTrend} height={90} />
          </div>
        </div>
        {actTotals.messages === 0 && (
          <p className="mt-2 text-xs text-muted">{tp(lang, 'ui.stats.activityEmpty')}</p>
        )}
      </section>

      {/* Wzrost serwera — członkowie w czasie */}
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <TrendingUp size={16} className="text-accent" /> {tp(lang, 'ui.home.sgHeading')}
        </h2>
        {memEnough ? (
          <>
            <div className="mb-3 flex flex-wrap items-baseline gap-2">
              <span className="font-display text-3xl font-bold">
                {memLast.toLocaleString('pl-PL')}
              </span>
              <span className="text-sm text-muted">{tp(lang, 'ui.home.tlMembers')}</span>
              <span
                className={`text-sm font-semibold ${memDelta >= 0 ? 'text-green-400' : 'text-accent'}`}
              >
                {memDelta >= 0 ? '+' : ''}
                {memDelta.toLocaleString('pl-PL')} / {members.length} {tp(lang, 'ui.home.sgDays')}
              </span>
            </div>
            <AreaChart values={members} height={150} />
          </>
        ) : (
          <p className="text-sm text-muted">{tp(lang, 'ui.home.sgEmpty')}</p>
        )}
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Mic size={16} className="text-accent" /> {tp(lang, 'ui.stats.digestHeading')}
        </h2>
        <DigestForm initial={digest} guild={guild} />
      </section>

      {/* Top XP */}
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Trophy size={16} className="text-accent" /> {tp(lang, 'ui.stats.topXpHeading')}
        </h2>
        {board.length === 0 ? (
          <p className="text-sm text-muted">{tp(lang, 'ui.stats.boardEmpty')}</p>
        ) : (
          <div className="space-y-2">
            {board.map((u, i) => (
              <div key={u.user_id} className="flex items-center gap-3">
                <span className="w-6 text-end text-sm text-muted">{i + 1}</span>
                <span className="w-40 truncate text-sm">{u.username ?? u.user_id}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(u.xp / xpMax) * 100}%` }}
                  />
                </div>
                <span className="w-20 text-end text-sm">
                  {tp(lang, 'ui.stats.lvl')} {u.level} · {u.xp.toLocaleString('pl-PL')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Top aktywni — 14 dni */}
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Users size={16} className="text-accent" /> {tp(lang, 'ui.stats.topActiveHeading')}
        </h2>
        {topUsers.length === 0 ? (
          <p className="text-sm text-muted">{tp(lang, 'ui.stats.topActiveEmpty')}</p>
        ) : (
          <div className="space-y-2">
            {topUsers.map((u, i) => (
              <div key={u.user_id} className="flex items-center gap-3 text-sm">
                <span className="w-6 text-end text-muted">{i + 1}</span>
                <span className="w-44 truncate">{u.username}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(u.messages / Math.max(1, topUsers[0].messages)) * 100}%` }}
                  />
                </div>
                <span className="w-28 text-end text-muted">
                  {u.messages} {tp(lang, 'ui.stats.msgsShort')} · {u.voice_min}m
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Heatmapa godzinowa */}
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Flame size={16} className="text-accent" /> {tp(lang, 'ui.stats.hourlyHeading')}
        </h2>
        <div className="flex h-32 items-end gap-1">
          {heat.map((b) => (
            <div
              key={`hr-${b.hour}`}
              className="group flex flex-1 flex-col items-center justify-end"
              title={`${b.hour}:00 — ${b.count} ${tp(lang, 'ui.stats.msgsShort')}.`}
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
            <Ticket size={16} className="text-accent" /> {tp(lang, 'ui.stats.ticketsHeading')}
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              {tp(lang, 'ui.stats.tkOpen')} <strong className="text-accent">{tk.open}</strong>
            </li>
            <li>
              {tp(lang, 'ui.stats.tkClaimed')} <strong>{tk.claimed}</strong>
            </li>
            <li>
              {tp(lang, 'ui.stats.tkClosed')} <strong className="text-muted">{tk.closed}</strong>
            </li>
          </ul>
        </section>

        <section className="panel-glow rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
            <Gamepad2 size={16} className="text-accent" /> {tp(lang, 'ui.stats.libHeading')}
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
                <span className="w-10 text-end text-sm">{n}</span>
              </div>
            ))}
            {!Object.keys(stats.byPlatform).length && (
              <p className="text-sm text-muted">{tp(lang, 'ui.stats.noData')}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
