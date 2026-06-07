'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ApplicationsConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect, RoleSelect } from './pickers';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

type QRow = { q: string; k: string };

export default function ApplicationsForm({
  initial,
  guild,
}: {
  initial: ApplicationsConfig;
  guild: GuildMeta;
}) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [reviewChannelId, setReview] = useState(initial.reviewChannelId);
  const [roleId, setRoleId] = useState(initial.roleId);
  const [panelMessage, setPanel] = useState(initial.panelMessage);
  const idRef = useRef(0);
  const [rows, setRows] = useState<QRow[]>(() =>
    initial.questions.map((q) => ({ q, k: `q${idRef.current++}` })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const payload: ApplicationsConfig = {
        enabled,
        reviewChannelId,
        roleId,
        panelMessage,
        questions: rows.map((r) => r.q.trim()).filter(Boolean),
      };
      const r = await fetch('/api/applications', {
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
    <div className="max-w-xl space-y-4">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">Aplikacje włączone</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Kanał recenzji</span>
          <ChannelSelect value={reviewChannelId} onChange={setReview} channels={guild.channels} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Rola po akceptacji</span>
          <RoleSelect value={roleId} onChange={setRoleId} roles={guild.roles} />
        </label>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-semibold text-white/90">Treść panelu (/applypanel)</span>
        <input
          value={panelMessage}
          onChange={(e) => setPanel(e.target.value)}
          className={inputCls}
        />
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">Pytania (max 5)</span>
          <button
            type="button"
            onClick={() => setRows([...rows, { q: '', k: `q${idRef.current++}` }])}
            disabled={rows.length >= 5}
            className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated disabled:opacity-40"
          >
            <Plus size={12} /> Dodaj
          </button>
        </div>
        {rows.map((r) => (
          <div key={r.k} className="flex gap-2">
            <input
              value={r.q}
              onChange={(e) =>
                setRows(rows.map((x) => (x.k === r.k ? { ...x, q: e.target.value } : x)))
              }
              placeholder="Pytanie do kandydata"
              maxLength={200}
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
    </div>
  );
}
