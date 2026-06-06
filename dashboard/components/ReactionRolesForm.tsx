'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

type RR = { messageId: string; emoji: string; roleId: string };
type Row = RR & { k: string };

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function ReactionRolesForm({ initial }: { initial: RR[] }) {
  const idRef = useRef(0);
  const [rows, setRows] = useState<Row[]>(() =>
    initial.map((r) => ({ ...r, k: `r${idRef.current++}` })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/reaction-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: rows.map(({ k, ...rest }) => rest) }),
      });
      setSt(r.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  const setRow = (k: string, patch: Partial<RR>) =>
    setRows(rows.map((r) => (r.k === k ? { ...r, ...patch } : r)));
  const addRow = () =>
    setRows([...rows, { messageId: '', emoji: '', roleId: '', k: `r${idRef.current++}` }]);
  const delRow = (k: string) => setRows(rows.filter((r) => r.k !== k));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/90">
          Mapowania (wiadomość → emoji → rola)
        </span>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated"
        >
          <Plus size={12} /> Dodaj
        </button>
      </div>

      {rows.length === 0 && (
        <p className="text-xs text-muted">Brak mapowań. Dodaj: ID wiadomości, emoji i ID roli.</p>
      )}

      {rows.map((r) => (
        <div key={r.k} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_90px_1fr_auto]">
          <input
            value={r.messageId}
            onChange={(e) => setRow(r.k, { messageId: e.target.value })}
            placeholder="ID wiadomości"
            className={inputCls}
          />
          <input
            value={r.emoji}
            onChange={(e) => setRow(r.k, { emoji: e.target.value })}
            placeholder="emoji"
            className={inputCls}
          />
          <input
            value={r.roleId}
            onChange={(e) => setRow(r.k, { roleId: e.target.value })}
            placeholder="ID roli"
            className={inputCls}
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

      <div className="flex items-center gap-3 pt-1">
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
        Bot nadaje rolę po dodaniu reakcji pod wskazaną wiadomością i odbiera po jej usunięciu.
        Emoji: zwykłe (np. ✅) lub własne serwera. Wymaga włączonego bota.
      </p>
    </div>
  );
}
