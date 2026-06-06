'use client';

import { useState } from 'react';

type Presence = { status: string; type: string; text: string; url: string };

const STATUSES = [
  { v: 'online', l: 'Online' },
  { v: 'idle', l: 'Zaraz wracam' },
  { v: 'dnd', l: 'Nie przeszkadzać' },
  { v: 'invisible', l: 'Niewidoczny' },
];
const TYPES = [
  { v: 'none', l: '(brak)' },
  { v: 'playing', l: 'Gra w' },
  { v: 'streaming', l: 'Streamuje' },
  { v: 'watching', l: 'Ogląda' },
  { v: 'listening', l: 'Słucha' },
  { v: 'competing', l: 'Rywalizuje w' },
];

export default function BotPresenceForm({ initial }: { initial: Presence }) {
  const [p, setP] = useState<Presence>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/bot/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      setSt(r.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  const inputCls = 'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

  return (
    <div className="max-w-xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Status</span>
          <select value={p.status} onChange={(e) => setP({ ...p, status: e.target.value })} className={inputCls}>
            {STATUSES.map((s) => (
              <option key={s.v} value={s.v}>{s.l}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Aktywność</span>
          <select value={p.type} onChange={(e) => setP({ ...p, type: e.target.value })} className={inputCls}>
            {TYPES.map((t) => (
              <option key={t.v} value={t.v}>{t.l}</option>
            ))}
          </select>
        </label>
      </div>

      {p.type !== 'none' && (
        <label className="block space-y-1 text-sm">
          <span className="font-semibold text-white/90">Tekst aktywności</span>
          <input value={p.text} onChange={(e) => setP({ ...p, text: e.target.value })} placeholder="np. GH0ST EMPIRE" className={inputCls} />
        </label>
      )}
      {p.type === 'streaming' && (
        <label className="block space-y-1 text-sm">
          <span className="font-semibold text-white/90">URL streama (Twitch/YouTube)</span>
          <input value={p.url} onChange={(e) => setP({ ...p, url: e.target.value })} placeholder="https://twitch.tv/..." className={inputCls} />
        </label>
      )}

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={st === 'saving'} className="rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50">
          {st === 'saving' ? 'Zapisywanie…' : 'Zapisz'}
        </button>
        {st === 'ok' && <span className="text-sm text-green-400">✓ Zapisano — bot zastosuje po odczycie</span>}
        {st === 'err' && <span className="text-sm text-accent">Błąd zapisu</span>}
      </div>
      <p className="text-xs text-muted">
        Podgląd: <strong>{STATUSES.find((s) => s.v === p.status)?.l}</strong>
        {p.type !== 'none' && p.text ? ` · ${TYPES.find((t) => t.v === p.type)?.l} ${p.text}` : ''}. Status zapisuje się do
        bazy; bot stosuje go po odczycie (wymaga obsługi po stronie bota).
      </p>
    </div>
  );
}
