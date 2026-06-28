// Pulpit 2.0 — kafel health-score serwera (dane z lib/health.ts, lustro /healthcheck bota).
import { HeartPulse } from 'lucide-react';
import type { ServerHealth } from '../lib/health';
import { type PanelLocale, tp } from '../lib/panelI18n';

export default function HealthScoreCard({
  health,
  lang,
}: {
  health: ServerHealth | null;
  lang: PanelLocale;
}) {
  if (!health) {
    return (
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <HeartPulse size={16} className="text-accent" /> {tp(lang, 'ui.home.hcHeading')}
        </h2>
        <p className="text-sm text-muted">
          {tp(lang, 'ui.home.hcNoDataPre')}
          <code className="text-accent">/healthcheck</code>
          {tp(lang, 'ui.home.hcNoDataPost')}
        </p>
      </section>
    );
  }
  const color =
    health.score >= 85 ? 'text-green-400' : health.score >= 55 ? 'text-yellow-400' : 'text-accent';
  const bar =
    health.score >= 85 ? 'bg-green-500' : health.score >= 55 ? 'bg-yellow-500' : 'bg-accent';

  return (
    <section className="panel-glow rounded-2xl border border-line bg-card p-5">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
        <HeartPulse size={16} className="text-accent" /> {tp(lang, 'ui.home.hcHeading')}
      </h2>
      <div className="mb-3 flex items-end gap-3">
        <span className={`font-display text-4xl ${color}`}>{health.score}</span>
        <span className="pb-1 text-sm text-muted">/ 100</span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-elevated">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${health.score}%` }} />
      </div>
      <ul className="space-y-1.5">
        {health.checks.map((c) => (
          <li key={c.name} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-white/85">
              {c.ok ? '✅' : c.scored ? '⚠️' : '➖'} {c.name}
            </span>
            {c.detail && <span className="shrink-0 text-xs text-muted">{c.detail}</span>}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">
        {tp(lang, 'ui.home.hcFooterPre')}
        <code className="text-accent">/healthcheck</code>
        {tp(lang, 'ui.home.hcFooterPost')}
      </p>
    </section>
  );
}
