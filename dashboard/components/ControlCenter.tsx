'use client';

// Faza 7 / F1 — Centrum sterowania: master włącz/wyłącz każdego modułu (zapis do settings → bot stosuje).
// Discovery B2 (#676): kokpit statusu — kafelki-liczniki (Aktywne / Wymaga konfiguracji / Wyłączone) z
// filtrem + kropka statusu per moduł. „Wymaga konfiguracji" = włączone, ale config bez ustawień poza
// flagą (heurystyka getModuleHealth) — pokazuje, co user przełączył, ale nie dokończył (audyt P3).
import Link from 'next/link';
import { useState } from 'react';
import type { ModuleHealth } from '../lib/moduleState';
import type { ModuleView } from '../lib/modules';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';

type Status = 'active' | 'needsConfig' | 'off';
type Filter = 'all' | Status;

const DOT: Record<Status, string> = {
  active: 'bg-green-500',
  needsConfig: 'bg-amber-400',
  off: 'bg-white/25',
};
const ST_KEY: Record<Status, string> = {
  active: 'ui.modules.stActive',
  needsConfig: 'ui.modules.stNeedsConfig',
  off: 'ui.modules.stOff',
};

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`relative h-6 w-11 shrink-0 rounded-full transition active:scale-95 ${on ? 'bg-accent' : 'bg-white/20'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'start-[22px]' : 'start-0.5'}`}
      />
    </button>
  );
}

export default function ControlCenter({
  modules,
  initial,
  health,
}: {
  modules: ModuleView[];
  initial: Record<string, boolean>;
  health: Record<string, ModuleHealth>;
}) {
  const { lang } = useLang();
  const [states, setStates] = useState<Record<string, boolean>>(initial);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  async function flip(key: string) {
    const next = !states[key];
    setStates((s) => ({ ...s, [key]: next })); // optymistycznie
    setFailed(false);
    try {
      const r = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled: next }),
      });
      if (!r.ok) throw new Error('fail');
    } catch {
      // revert + WIDOCZNY feedback — sam cichy revert mylił („kliknąłem, a nic się nie stało").
      setStates((s) => ({ ...s, [key]: !next }));
      setFailed(true);
      setTimeout(() => setFailed(false), 4000);
    }
  }

  const statusOf = (key: string): Status =>
    states[key] ? (health[key]?.configured ? 'active' : 'needsConfig') : 'off';

  const counts = { all: modules.length, active: 0, needsConfig: 0, off: 0 };
  for (const m of modules) counts[statusOf(m.key)]++;

  const groups = [...new Set(modules.map((m) => m.group))];
  const shown = (m: ModuleView) => filter === 'all' || statusOf(m.key) === filter;

  const tile = (f: Filter, n: number, label: string, dot?: string) => (
    <button
      type="button"
      onClick={() => setFilter(f)}
      aria-pressed={filter === f}
      className={`flex flex-col items-start rounded-xl border bg-card px-4 py-3 text-start transition ${filter === f ? 'border-accent' : 'border-line hover:border-white/25'}`}
    >
      <span className="text-2xl font-bold tabular-nums">{n}</span>
      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
        {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
        {label}
      </span>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tile('all', counts.all, tp(lang, 'ui.modules.stAll'))}
        {tile('active', counts.active, tp(lang, 'ui.modules.stActive'), DOT.active)}
        {tile(
          'needsConfig',
          counts.needsConfig,
          tp(lang, 'ui.modules.stNeedsConfig'),
          DOT.needsConfig,
        )}
        {tile('off', counts.off, tp(lang, 'ui.modules.stOff'), DOT.off)}
      </div>

      {failed && (
        <p className="text-xs text-accent" role="alert">
          {tp(lang, 'ui.saveError')}
        </p>
      )}

      {groups.map((g) => {
        const items = modules.filter((m) => m.group === g && shown(m));
        if (!items.length) return null;
        return (
          <section key={g} className="panel-glow rounded-2xl border border-line bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/80">
              {g}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((m) => {
                const st = statusOf(m.key);
                return (
                  <div
                    key={m.key}
                    className="flex items-center justify-between rounded-md border border-line bg-bg/40 px-4 py-3"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-sm">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${DOT[st]}`}
                        title={tp(lang, ST_KEY[st])}
                      />
                      <span
                        className={`truncate ${states[m.key] ? 'text-white/90' : 'text-muted'}`}
                      >
                        {m.label}
                      </span>
                      {m.href && (
                        <Link
                          href={m.href}
                          className="shrink-0 text-xs text-accent hover:underline"
                        >
                          {tp(lang, 'ui.modules.config')}
                        </Link>
                      )}
                    </span>
                    <Toggle on={!!states[m.key]} onClick={() => flip(m.key)} />
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      <p className="text-xs text-muted">{tp(lang, 'ui.modules.saveNote')}</p>
    </div>
  );
}
