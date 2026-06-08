'use client';

import { Check, Copy, Download, Loader2, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { BLUEPRINTS, type Blueprint, decodeRecipe, encodeRecipe } from '../lib/setup';

type LogItem = { label: string; ok: boolean; detail?: string };

export default function Blueprints() {
  const [sel, setSel] = useState<string | null>(null);
  const [st, setSt] = useState<'idle' | 'working' | 'done' | 'err'>('idle');
  const [log, setLog] = useState<LogItem[]>([]);
  const [enabled, setEnabled] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [imp, setImp] = useState('');

  const chosen = BLUEPRINTS.find((b) => b.id === sel) ?? null;

  async function apply(modules: string[], blocks: string[]) {
    setSt('working');
    setLog([]);
    setEnabled([]);
    try {
      const r = await fetch('/api/setup/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules, blocks }),
      });
      const d = (await r.json()) as { ok?: boolean; enabled?: string[]; id?: string | null };
      if (!r.ok || !d.ok) {
        setSt('err');
        return;
      }
      setEnabled(d.enabled ?? []);
      if (!d.id) {
        setSt('done');
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
      setSt('err');
    } catch {
      setSt('err');
    }
  }

  function pick(b: Blueprint) {
    setSel(b.id);
    setCode(encodeRecipe({ modules: b.modules, blocks: b.blocks }));
  }

  function applyImport() {
    const r = decodeRecipe(imp);
    if (!r) {
      setSt('err');
      return;
    }
    void apply(r.modules, r.blocks);
  }

  const working = st === 'working';

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Pełne szablony — jedno kliknięcie <strong>włącza moduły</strong> i{' '}
        <strong>tworzy strukturę</strong> serwera. Każdy ma kod recepty do
        udostępnienia/przeniesienia.
      </p>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {BLUEPRINTS.map((b) => {
          const active = sel === b.id;
          return (
            <button
              key={b.id}
              type="button"
              disabled={working}
              onClick={() => pick(b)}
              className={`flex flex-col rounded-2xl border p-4 text-left transition disabled:opacity-50 ${
                active
                  ? 'border-accent bg-accent/10 shadow-glow'
                  : 'border-line bg-bg/40 hover:border-accent/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{b.emoji}</span>
                <span className="font-display tracking-wide">{b.name}</span>
                {active && <Check size={15} className="ml-auto text-accent" />}
              </div>
              <p className="mt-1.5 text-xs text-muted">{b.desc}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {b.modules.map((m) => (
                  <span
                    key={m}
                    className="rounded bg-elevated px-1.5 py-0.5 text-[10px] text-muted"
                  >
                    {m.replace('_config', '')}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => chosen && apply(chosen.modules, chosen.blocks)}
          disabled={!chosen || working}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          {working ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {working ? 'Stosuję…' : 'Zastosuj blueprint'}
        </button>
        {st === 'done' && (
          <span className="text-sm text-green-400">
            ✓ Gotowe{enabled.length ? ` — włączono: ${enabled.length} modułów` : ''}
          </span>
        )}
        {st === 'err' && (
          <span className="text-sm text-accent">Błąd — czy bot online / kod poprawny?</span>
        )}
      </div>

      {/* Eksport / import recepty */}
      <div className="rounded-xl border border-line bg-bg/40 p-4">
        <div className="mb-2 text-[11px] uppercase tracking-wide text-muted">
          Kod recepty (eksport / import)
        </div>
        {code && (
          <div className="mb-3 flex items-center gap-2">
            <input
              readOnly
              value={code}
              className="w-full rounded-md border border-line bg-elevated px-3 py-2 font-mono text-xs outline-none"
            />
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(code).catch(() => {})}
              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-line px-3 py-2 text-xs transition hover:border-accent"
            >
              <Copy size={13} /> Kopiuj
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            value={imp}
            onChange={(e) => setImp(e.target.value)}
            placeholder="Wklej kod recepty, by zastosować na tym serwerze…"
            className="w-full rounded-md border border-line bg-elevated px-3 py-2 font-mono text-xs outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={applyImport}
            disabled={!imp.trim() || working}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-accent/50 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-50"
          >
            <Upload size={13} /> Zastosuj kod
          </button>
        </div>
      </div>

      {(working || log.length > 0) && (
        <div className="rounded-xl border border-line bg-bg/40 p-3">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-muted">Log struktury</div>
          {working && !log.length && <p className="text-sm text-muted">Czekam na bota…</p>}
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
