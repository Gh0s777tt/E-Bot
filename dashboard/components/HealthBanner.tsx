import { AlertTriangle, Info, OctagonAlert } from 'lucide-react';
import Link from 'next/link';
import type { HealthIssue } from '../lib/healthIssues';
import { type PanelLocale, tp } from '../lib/panelI18n';

// Discovery C1 (#681) — baner „wymaga uwagi" na Pulpicie: lista problemów z akcją „Napraw →".
// Renderuje się TYLKO gdy są problemy (zdrowy serwer = zero szumu). Dane: lib/healthIssues.ts.
const ICON = {
  error: <OctagonAlert size={14} className="shrink-0 text-accent" />,
  warning: <AlertTriangle size={14} className="shrink-0 text-amber-400" />,
  info: <Info size={14} className="shrink-0 text-muted" />,
} as const;

export default function HealthBanner({
  issues,
  lang,
}: {
  issues: HealthIssue[];
  lang: PanelLocale;
}) {
  if (issues.length === 0) return null;
  return (
    <section className="panel-glow rounded-2xl border border-amber-400/40 bg-amber-400/5 p-5">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
        <AlertTriangle size={16} className="text-amber-400" />
        {tp(lang, 'ui.health.heading')}
        <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs tabular-nums text-amber-400">
          {issues.length}
        </span>
      </h2>
      <ul className="space-y-2">
        {issues.map((i) => (
          <li key={i.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              {ICON[i.severity]}
              <span className="truncate text-white/85">
                {tp(lang, i.msgKey)
                  .replace('{module}', i.module ?? '')
                  .replace('{n}', String(i.n ?? ''))}
              </span>
            </span>
            <Link
              href={i.href}
              className="shrink-0 rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-accent transition hover:bg-elevated"
            >
              {tp(lang, 'ui.health.fix')} →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
