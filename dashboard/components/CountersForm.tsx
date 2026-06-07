'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { CounterItem, CountersConfig, CounterType } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect } from './pickers';

type Row = CounterItem & { k: string };

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

const TYPES: { v: CounterType; l: string; tpl: string }[] = [
  { v: 'members', l: 'Członkowie', tpl: '👥 Członków: {count}' },
  { v: 'boosts', l: 'Boosty', tpl: '🚀 Boostów: {count}' },
  { v: 'channels', l: 'Kanały', tpl: '📁 Kanałów: {count}' },
  { v: 'roles', l: 'Role', tpl: '🏷️ Ról: {count}' },
];

export default function CountersForm({
  initial,
  guild,
}: {
  initial: CountersConfig;
  guild: GuildMeta;
}) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const idRef = useRef(0);
  const [rows, setRows] = useState<Row[]>(() =>
    initial.items.map((i) => ({ ...i, k: `n${idRef.current++}` })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const payload: CountersConfig = {
        enabled,
        items: rows.map(({ k, ...i }) => i).filter((i) => i.channelId && i.template),
      };
      const r = await fetch('/api/counters', {
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

  return (
    <div className="max-w-2xl space-y-5">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">Liczniki włączone</span>
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">Liczniki (kanał → statystyka)</span>
          <button
            type="button"
            onClick={() =>
              setRows([
                ...rows,
                {
                  channelId: '',
                  type: 'members',
                  template: '👥 Członków: {count}',
                  k: `n${idRef.current++}`,
                },
              ])
            }
            className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated"
          >
            <Plus size={12} /> Dodaj
          </button>
        </div>
        {rows.map((r) => (
          <div key={r.k} className="flex items-start gap-2">
            <div className="w-44 shrink-0">
              <ChannelSelect
                value={r.channelId}
                onChange={(v) =>
                  setRows(rows.map((x) => (x.k === r.k ? { ...x, channelId: v } : x)))
                }
                channels={guild.channels}
                kind="voice"
              />
            </div>
            <select
              value={r.type}
              onChange={(e) => {
                const type = e.target.value as CounterType;
                const tpl = TYPES.find((t) => t.v === type)?.tpl ?? r.template;
                setRows(rows.map((x) => (x.k === r.k ? { ...x, type, template: tpl } : x)));
              }}
              className={`${inputCls} w-36`}
            >
              {TYPES.map((t) => (
                <option key={t.v} value={t.v}>
                  {t.l}
                </option>
              ))}
            </select>
            <input
              value={r.template}
              onChange={(e) =>
                setRows(rows.map((x) => (x.k === r.k ? { ...x, template: e.target.value } : x)))
              }
              placeholder="Szablon ({count})"
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setRows(rows.filter((x) => x.k !== r.k))}
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
        Najlepiej użyj <strong>zablokowanych kanałów głosowych</strong> (bez prawa łączenia) jako
        liczników. Zmienna <code>{'{count}'}</code> wstawia liczbę. Bot odświeża co ~10 min (limit
        Discorda na zmianę nazwy kanału). Potrzebuje uprawnienia <em>Zarządzanie kanałami</em>.
      </p>
    </div>
  );
}
