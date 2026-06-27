'use client';

// Faza 7 / F1 — Centrum sterowania: master włącz/wyłącz każdego modułu (zapis do settings → bot stosuje).
import Link from 'next/link';
import { useState } from 'react';
import type { ModuleView } from '../lib/modules';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';

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
}: {
  modules: ModuleView[];
  initial: Record<string, boolean>;
}) {
  const { lang } = useLang();
  const [states, setStates] = useState<Record<string, boolean>>(initial);
  const [failed, setFailed] = useState(false);

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

  const groups = [...new Set(modules.map((m) => m.group))];
  const onCount = Object.values(states).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-wide text-muted">
        {tp(lang, 'ui.modules.active')} <span className="text-accent">{onCount}</span> /{' '}
        {modules.length}
      </p>
      {failed && (
        <p className="text-xs text-accent" role="alert">
          {tp(lang, 'ui.saveError')}
        </p>
      )}
      {groups.map((g) => (
        <section key={g} className="panel-glow rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/80">{g}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {modules
              .filter((m) => m.group === g)
              .map((m) => (
                <div
                  key={m.key}
                  className="flex items-center justify-between rounded-md border border-line bg-bg/40 px-4 py-3"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span className={states[m.key] ? 'text-white/90' : 'text-muted'}>
                      {m.label}
                    </span>
                    {m.href && (
                      <Link href={m.href} className="text-xs text-accent hover:underline">
                        {tp(lang, 'ui.modules.config')}
                      </Link>
                    )}
                  </span>
                  <Toggle on={!!states[m.key]} onClick={() => flip(m.key)} />
                </div>
              ))}
          </div>
        </section>
      ))}
      <p className="text-xs text-muted">{tp(lang, 'ui.modules.saveNote')}</p>
    </div>
  );
}
