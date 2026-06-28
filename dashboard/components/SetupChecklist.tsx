import { CheckCircle2, Circle, Rocket } from 'lucide-react';
import type { ChecklistItem } from '../lib/data';
import { type PanelLocale, tp } from '../lib/panelI18n';

// „Pierwsze kroki" — przegląd kluczowych modułów (skonfigurowane / nie) z linkiem do strony.
// Server component (bez interakcji). Dane z getSetupChecklist (jeden odczyt settings).
export default function SetupChecklist({
  items,
  lang,
}: {
  items: ChecklistItem[];
  lang: PanelLocale;
}) {
  const done = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  return (
    <section className="panel-glow rounded-2xl border border-line bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Rocket size={16} className="text-accent" /> {tp(lang, 'ui.home.scHeading')}
        </h2>
        <span className="text-sm text-muted">
          {done}/{items.length} {tp(lang, 'ui.home.scReady')}
        </span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-elevated">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((i) => (
          <a
            key={i.href}
            href={i.href}
            className={`group flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition ${
              i.done ? 'border-line bg-bg/40' : 'border-line hover:border-accent hover:bg-elevated'
            }`}
          >
            {i.done ? (
              <CheckCircle2 size={18} className="shrink-0 text-green-400" />
            ) : (
              <Circle size={18} className="shrink-0 text-muted" />
            )}
            <span className="min-w-0 flex-1">
              <span
                className={`block truncate font-medium ${i.done ? 'text-white/70' : 'text-white'}`}
              >
                {tp(lang, i.labelKey)}
              </span>
              <span className="block truncate text-xs text-muted">{tp(lang, i.hintKey)}</span>
            </span>
            {!i.done && (
              <span className="shrink-0 text-xs uppercase tracking-wide text-accent opacity-0 transition group-hover:opacity-100">
                {tp(lang, 'ui.home.scSet')}
              </span>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
