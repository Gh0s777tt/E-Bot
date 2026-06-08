'use client';

import { Check, Hammer, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { PROV_BLOCKS, type ProvBlock } from '../lib/setup';

type LogItem = { label: string; ok: boolean; detail?: string };

export default function ServerArchitect() {
  const [sel, setSel] = useState<Set<ProvBlock>>(new Set());
  const [st, setSt] = useState<'idle' | 'working' | 'done' | 'err'>('idle');
  const [log, setLog] = useState<LogItem[]>([]);

  function toggle(b: ProvBlock) {
    setSel((s) => {
      const n = new Set(s);
      if (n.has(b)) n.delete(b);
      else n.add(b);
      return n;
    });
  }

  async function run() {
    if (!sel.size) return;
    setSt('working');
    setLog([]);
    try {
      const r = await fetch('/api/setup/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: [...sel] }),
      });
      const d = (await r.json()) as { ok?: boolean; id?: string };
      if (!r.ok || !d.ok || !d.id) {
        setSt('err');
        return;
      }
      for (let i = 0; i < 40; i++) {
        await new Promise((res) => setTimeout(res, 2500));
        const g = (await fetch(`/api/setup/provision?id=${encodeURIComponent(d.id)}`)
          .then((x) => x.json())
          .catch(() => ({ done: false }))) as { done?: boolean; log?: LogItem[] };
        if (g.done) {
          setLog(g.log ?? []);
          setSt('done');
          return;
        }
      }
      setSt('err'); // timeout — bot offline?
    } catch {
      setSt('err');
    }
  }

  const working = st === 'working';

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Zaznacz, co utworzyć — bot doda kanały, kategorie i role na serwerze (pomija to, co już
        istnieje). Wymaga uprawnień bota <em>Zarządzanie kanałami</em> i <em>Zarządzanie rolami</em>
        .
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        {PROV_BLOCKS.map((b) => {
          const on = sel.has(b.id);
          return (
            <button
              key={b.id}
              type="button"
              disabled={working}
              onClick={() => toggle(b.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition disabled:opacity-50 ${
                on ? 'border-accent bg-accent/10' : 'border-line bg-bg/40 hover:border-accent/40'
              }`}
            >
              <span className="text-xl">{b.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{b.label}</span>
                <span className="block truncate text-xs text-muted">{b.desc}</span>
              </span>
              {on && <Check size={16} className="shrink-0 text-accent" />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={run}
          disabled={!sel.size || working}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          {working ? <Loader2 size={16} className="animate-spin" /> : <Hammer size={16} />}
          {working ? 'Tworzę na serwerze…' : 'Utwórz strukturę'}
        </button>
        {st === 'done' && <span className="text-sm text-green-400">✓ Gotowe</span>}
        {st === 'err' && (
          <span className="text-sm text-accent">Błąd / timeout — czy bot jest online?</span>
        )}
      </div>

      {(working || log.length > 0) && (
        <div className="rounded-xl border border-line bg-bg/40 p-3">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-muted">Log</div>
          {working && !log.length && (
            <p className="text-sm text-muted">Czekam na bota (wykonuje zlecenie)…</p>
          )}
          <ul className="space-y-1 text-sm">
            {log.map((l) => (
              <li key={l.label} className="flex items-center gap-2">
                {l.ok ? (
                  <Check size={15} className="shrink-0 text-green-400" />
                ) : (
                  <X size={15} className="shrink-0 text-accent" />
                )}
                <span className="flex-1">{l.label}</span>
                {l.detail && <span className="text-xs text-muted">{l.detail}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
