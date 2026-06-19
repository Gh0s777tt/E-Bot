import type { GrowthPoint } from '../lib/insights';
import { type PanelLocale, tp } from '../lib/panelI18n';
import AreaChart from './AreaChart';

// Wykres wzrostu serwera (członkowie w czasie). Dane: snapshot bota co 30 min → server_history.
export default function ServerGrowthCard({
  history,
  lang,
}: {
  history: GrowthPoint[];
  lang: PanelLocale;
}) {
  const members = history.map((h) => h.members);
  const enough = members.length >= 2;
  const first = members[0] ?? 0;
  const last = members.at(-1) ?? 0;
  const delta = last - first;
  const tail = history.at(-1);

  return (
    <section className="panel-glow relative overflow-hidden rounded-2xl border border-line bg-card p-5">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
        📈 {tp(lang, 'ui.home.sgHeading')}
      </h2>
      {enough ? (
        <>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold">{last.toLocaleString('pl-PL')}</span>
            <span
              className={`text-sm font-semibold ${delta >= 0 ? 'text-green-400' : 'text-accent'}`}
            >
              {delta >= 0 ? '+' : ''}
              {delta.toLocaleString('pl-PL')}{' '}
              <span className="text-muted">
                / {members.length} {tp(lang, 'ui.home.sgDays')}
              </span>
            </span>
          </div>
          <AreaChart values={members} height={120} className="mt-3" />
          {tail && (
            <div className="mt-3 flex gap-4 text-xs text-muted">
              <span>
                🚀 {tp(lang, 'ui.home.boosts')}: {tail.boosts.toLocaleString('pl-PL')}
              </span>
              <span>
                📁 {tp(lang, 'ui.home.channels')}: {tail.channels.toLocaleString('pl-PL')}
              </span>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-muted">{tp(lang, 'ui.home.sgEmpty')}</p>
      )}
    </section>
  );
}
