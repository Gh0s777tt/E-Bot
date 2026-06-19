import { ShieldCheck } from 'lucide-react';
import type { AutomodStats as AutomodStatsData } from '../lib/community';
import { type PanelLocale, tp } from '../lib/panelI18n';
import AreaChart from './AreaChart';

// Statystyki ochrony (ostatnie 7 dni) — zliczane przez bota. Server component (statyczny widok).
const CAT_KEY: Record<string, string> = {
  scam: 'ui.mod.catScam',
  pii: 'ui.mod.catPii',
  word: 'ui.mod.catWord',
  regex: 'ui.mod.catRegex',
  invite: 'ui.mod.catInvite',
  link: 'ui.mod.catLink',
  mention: 'ui.mod.catMention',
  spam: 'ui.mod.catSpam',
  inne: 'ui.mod.catOther',
};

export default function AutomodStats({
  stats,
  lang,
}: {
  stats: AutomodStatsData;
  lang: PanelLocale;
}) {
  const days: string[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const totals: Record<string, number> = {};
  for (const day of days) {
    for (const [cat, n] of Object.entries(stats[day] ?? {})) totals[cat] = (totals[cat] ?? 0) + n;
  }
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const grand = entries.reduce((s, [, n]) => s + n, 0);
  const max = entries[0]?.[1] ?? 1;
  const trend: number[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const day = d.toISOString().slice(0, 10);
    trend.push(Object.values(stats[day] ?? {}).reduce((a, b) => a + b, 0));
  }

  return (
    <section className="panel-glow rounded-2xl border border-line bg-card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
        <ShieldCheck size={16} className="text-accent" /> {tp(lang, 'ui.mod.statsHeading')}
      </h2>
      {grand === 0 ? (
        <p className="text-sm text-muted">{tp(lang, 'ui.mod.statsEmpty')}</p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted">
            {tp(lang, 'ui.mod.statsTotalPre')} <strong className="text-white">{grand}</strong>{' '}
            {tp(lang, 'ui.mod.statsTotalPost')}
          </p>
          <div className="pt-1">
            <p className="mb-1 text-[10px] uppercase tracking-wide text-muted">
              {tp(lang, 'ui.mod.statsTrend')}
            </p>
            <AreaChart values={trend} height={84} />
          </div>
          {entries.map(([cat, n]) => (
            <div key={cat} className="flex items-center gap-3 text-sm">
              <span className="w-32 shrink-0 text-muted">
                {CAT_KEY[cat] ? tp(lang, CAT_KEY[cat]) : cat}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.round((n / max) * 100)}%` }}
                />
              </div>
              <span className="w-10 text-end tabular-nums">{n}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
