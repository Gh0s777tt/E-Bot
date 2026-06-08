'use client';

import { ArrowRight, Check, Hammer, Sparkles, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import ServerArchitect from '../../components/ServerArchitect';
import { PRESETS, type PresetId } from '../../lib/setup';

export default function SetupPage() {
  const [sel, setSel] = useState<PresetId | null>(null);
  const [st, setSt] = useState<'idle' | 'saving' | 'done' | 'err'>('idle');
  const [enabled, setEnabled] = useState<string[]>([]);

  async function apply() {
    if (!sel) return;
    setSt('saving');
    try {
      const r = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: sel }),
      });
      const d = (await r.json()) as { ok?: boolean; enabled?: string[] };
      if (r.ok && d.ok) {
        setEnabled(d.enabled ?? []);
        setSt('done');
      } else {
        setSt('err');
      }
    } catch {
      setSt('err');
    }
  }

  if (st === 'done') {
    return (
      <div className="mx-auto max-w-2xl">
        <section className="panel-glow rounded-2xl border border-line bg-gradient-to-br from-card to-bg p-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl border-2 border-green-500/50 bg-green-500/10 text-green-400">
            <Check size={28} />
          </div>
          <h2 className="font-display text-2xl tracking-wide">Gotowe! Moduły włączone</h2>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {enabled.map((e) => (
              <span
                key={e}
                className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-1 text-sm text-white/90"
              >
                {e}
              </span>
            ))}
          </div>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted">
            Kreator włączył moduły z sensownymi domyślnymi. Dokończ szczegóły (kanały powitań, role,
            filtry) — <strong>Diagnostyka</strong> pokaże, czego jeszcze brakuje.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/diagnostics"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-5 py-2.5 font-semibold transition hover:bg-accent-hover"
            >
              Otwórz Diagnostykę <ArrowRight size={15} />
            </Link>
            <button
              type="button"
              onClick={() => {
                setSt('idle');
                setSel(null);
              }}
              className="rounded-md border border-line px-5 py-2.5 text-sm transition hover:border-accent"
            >
              Wróć do presetów
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <section className="panel-glow relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-card to-bg p-6">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgb(var(--accent-rgb) / 0.16), transparent 70%)',
          }}
        />
        <h2 className="relative flex items-center gap-2 font-display text-2xl tracking-wide">
          <Wand2 className="text-accent" size={24} /> Kreator startowy
        </h2>
        <p className="relative mt-2 max-w-2xl text-sm text-muted">
          Wybierz, do czego głównie służy Twój serwer — włączę pasujący zestaw modułów jednym
          kliknięciem. Nic nie kasuję: tylko włączam (merge), a Ty dopracujesz szczegóły.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {PRESETS.map((p) => {
          const active = sel === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSel(p.id)}
              className={`flex flex-col rounded-2xl border p-5 text-left transition ${
                active
                  ? 'border-accent bg-accent/10 shadow-glow'
                  : 'border-line bg-card hover:border-accent/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{p.emoji}</span>
                <span className="font-display text-lg tracking-wide">{p.name}</span>
                {active && <Check size={16} className="ml-auto text-accent" />}
              </div>
              <p className="mt-2 text-sm text-muted">{p.desc}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.modules.map((m) => (
                  <span
                    key={m.key}
                    className="rounded-md border border-line bg-bg/40 px-2 py-0.5 text-[11px] text-muted"
                  >
                    {m.label}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={apply}
          disabled={!sel || st === 'saving'}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          <Sparkles size={16} /> {st === 'saving' ? 'Włączam…' : 'Zastosuj preset'}
        </button>
        {st === 'err' && <span className="text-sm text-accent">Błąd — spróbuj ponownie.</span>}
        {!sel && <span className="text-sm text-muted">Wybierz preset powyżej.</span>}
      </div>

      <section className="panel-glow rounded-2xl border border-line bg-card p-6">
        <h2 className="mb-1 flex items-center gap-2 font-display text-2xl tracking-wide">
          <Hammer className="text-accent" size={22} /> Architekt struktury
        </h2>
        <p className="mb-4 text-sm text-muted">
          Zbuduj szkielet serwera jednym kliknięciem — bot utworzy wybrane kanały, kategorie i role.
        </p>
        <ServerArchitect />
      </section>
    </div>
  );
}
