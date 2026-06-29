'use client';

// Narzędzie DEVELOPERA — reset bazy (cała / dany serwer). Render tylko dla właściciela instancji
// (gate w diagnostics/page.tsx + twardy gate w /api/dev/reset). Wymaga wpisania potwierdzenia.
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function DevReset({ currentGuildId = '' }: { currentGuildId?: string }) {
  const [mode, setMode] = useState<'guild' | 'all'>('guild');
  const [guildId, setGuildId] = useState(currentGuildId);
  const [confirm, setConfirm] = useState('');
  const [st, setSt] = useState<'idle' | 'busy' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');

  const expect = mode === 'all' ? 'RESET-ALL' : guildId.trim();
  const armed =
    mode === 'all'
      ? confirm === 'RESET-ALL'
      : /^\d{15,25}$/.test(guildId.trim()) && confirm === guildId.trim();

  async function run() {
    if (!armed || st === 'busy') return;
    setSt('busy');
    setMsg('');
    try {
      const r = await fetch('/api/dev/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          guildId: mode === 'guild' ? guildId.trim() : undefined,
          confirm,
        }),
      });
      const d = (await r.json()) as { ok?: boolean; error?: string };
      if (r.ok && d.ok) {
        setSt('ok');
        setMsg(
          mode === 'all'
            ? '✓ Baza wyczyszczona (pełny wipe).'
            : `✓ Serwer ${guildId.trim()} wyczyszczony.`,
        );
        setConfirm('');
      } else {
        setSt('err');
        setMsg(d.error || `Błąd ${r.status}`);
      }
    } catch (e) {
      setSt('err');
      setMsg((e as Error).message);
    }
  }

  const tab = (m: 'guild' | 'all', label: string) => (
    <button
      type="button"
      onClick={() => {
        setMode(m);
        setConfirm('');
        setSt('idle');
        setMsg('');
      }}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
        mode === m
          ? 'bg-accent/20 text-accent ring-1 ring-accent/40'
          : 'text-muted hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {tab('guild', 'Reset serwera')}
        {tab('all', 'Reset całej bazy')}
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/10 p-3 text-xs text-accent">
        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
        <span>
          {mode === 'all'
            ? 'NIEODWRACALNE. Wyczyści CAŁĄ bazę (wszystkie serwery, dane, config, dostęp, ustawienia globalne) — stan świeżej instalacji.'
            : 'NIEODWRACALNE. Usunie wszystkie dane i config TEGO serwera (ekonomia, levele, tickety, moderacja, klany, głosy, dostęp…).'}
        </span>
      </div>

      {mode === 'guild' && (
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-muted">ID serwera</span>
          <input
            value={guildId}
            onChange={(e) => {
              setGuildId(e.target.value);
              setConfirm('');
            }}
            placeholder="np. 123456789012345678"
            className="w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
      )}

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wide text-muted">
          Potwierdź — wpisz{' '}
          <code className="rounded bg-elevated px-1.5 py-0.5 text-accent">{expect || '…'}</code>
        </span>
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={expect || '…'}
          className="w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={run}
          disabled={!armed || st === 'busy'}
          className="rounded-lg bg-gradient-to-r from-accent to-accent-dark px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_rgb(var(--accent-rgb)/0.7)] transition hover:from-accent-hover hover:to-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {st === 'busy' ? 'Czyszczę…' : mode === 'all' ? 'Wyczyść całą bazę' : 'Wyczyść serwer'}
        </button>
        {st === 'ok' && <span className="text-sm text-green-400">{msg}</span>}
        {st === 'err' && <span className="text-sm text-accent">{msg}</span>}
      </div>
    </div>
  );
}
