'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

type Reward = { level: number; roleId: string };
type Cfg = {
  enabled: boolean;
  xpPerMessage: number;
  xpPerVoiceMin: number;
  cooldownSec: number;
  announceChannelId: string;
  rewards: Reward[];
};
type Row = Reward & { k: string };

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const num = (v: string): number => Math.max(0, Math.floor(Number(v) || 0));

export default function LevelingForm({ initial }: { initial: Cfg }) {
  const { rewards: initRewards, ...initBase } = initial;
  const [base, setBase] = useState(initBase);
  // Stabilne klucze wierszy przez licznik (deterministyczny SSR↔klient → brak hydration mismatch,
  // i nie używamy indeksu tablicy jako klucza React).
  const idRef = useRef(0);
  const [rows, setRows] = useState<Row[]>(() =>
    initRewards.map((r) => ({ ...r, k: `r${idRef.current++}` })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const payload: Cfg = { ...base, rewards: rows.map(({ k, ...r }) => r) };
      const r = await fetch('/api/leveling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSt(r.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  const setRow = (k: string, patch: Partial<Reward>) =>
    setRows(rows.map((r) => (r.k === k ? { ...r, ...patch } : r)));
  const addRow = () => setRows([...rows, { level: 5, roleId: '', k: `r${idRef.current++}` }]);
  const delRow = (k: string) => setRows(rows.filter((r) => r.k !== k));

  return (
    <div className="max-w-xl space-y-4">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={base.enabled}
          onChange={(e) => setBase({ ...base, enabled: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">Leveling włączony</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">XP za wiadomość</span>
          <input
            type="number"
            value={base.xpPerMessage}
            onChange={(e) => setBase({ ...base, xpPerMessage: num(e.target.value) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">XP za minutę voice</span>
          <input
            type="number"
            value={base.xpPerVoiceMin}
            onChange={(e) => setBase({ ...base, xpPerVoiceMin: num(e.target.value) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Cooldown wiadomości (s)</span>
          <input
            type="number"
            value={base.cooldownSec}
            onChange={(e) => setBase({ ...base, cooldownSec: num(e.target.value) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Kanał ogłoszeń awansu (ID)</span>
          <input
            value={base.announceChannelId}
            onChange={(e) => setBase({ ...base, announceChannelId: e.target.value })}
            placeholder="np. 1234567890"
            className={inputCls}
          />
        </label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">Role-nagrody (poziom → rola)</span>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated"
          >
            <Plus size={12} /> Dodaj
          </button>
        </div>
        {rows.length === 0 && (
          <p className="text-xs text-muted">Brak ról-nagród. Dodaj parę poziom → ID roli.</p>
        )}
        {rows.map((r) => (
          <div key={r.k} className="flex items-center gap-2">
            <input
              type="number"
              value={r.level}
              onChange={(e) => setRow(r.k, { level: Math.max(1, num(e.target.value)) })}
              className={`${inputCls} w-24`}
              placeholder="poziom"
            />
            <input
              value={r.roleId}
              onChange={(e) => setRow(r.k, { roleId: e.target.value })}
              className={inputCls}
              placeholder="ID roli"
            />
            <button
              type="button"
              onClick={() => delRow(r.k)}
              className="rounded-md border border-line p-2 text-muted transition hover:border-accent hover:text-accent"
              aria-label="Usuń"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={st === 'saving'}
          className="rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          {st === 'saving' ? 'Zapisywanie…' : 'Zapisz'}
        </button>
        {st === 'ok' && <span className="text-sm text-green-400">✓ Zapisano</span>}
        {st === 'err' && <span className="text-sm text-accent">Błąd zapisu</span>}
      </div>
      <p className="text-xs text-muted">
        Naliczanie XP i nadawanie ról wykonuje bot (Faza 4 — strona bota). Panel zapisuje
        konfigurację do Supabase; bot pobierze ją przez settings-sync.
      </p>
    </div>
  );
}
