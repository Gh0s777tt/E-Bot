'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { PatchApp, PatchNotesConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

type Row = PatchApp & { k: string };

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const num = (v: string): number => Math.max(0, Math.floor(Number(v) || 0));

export default function PatchNotesForm({
  initial,
  guild,
}: {
  initial: PatchNotesConfig;
  guild: GuildMeta;
}) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [channelId, setChannelId] = useState(initial.channelId);
  const idRef = useRef(0);
  const [rows, setRows] = useState<Row[]>(() =>
    initial.apps.map((a) => ({ ...a, k: `p${idRef.current++}` })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const payload: PatchNotesConfig = {
        enabled,
        channelId,
        apps: rows.map(({ k, ...a }) => a).filter((a) => a.appId && a.name),
      };
      const r = await fetch('/api/patchnotes', {
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
        <span className="font-semibold text-white/90">Patch-notes (Steam) włączone</span>
      </label>
      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Kanał ogłoszeń</span>
        <ChannelSelect value={channelId} onChange={setChannelId} channels={guild.channels} />
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">Śledzone gry (Steam appID)</span>
          <button
            type="button"
            onClick={() => setRows([...rows, { appId: 0, name: '', k: `p${idRef.current++}` }])}
            className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated"
          >
            <Plus size={12} /> Dodaj
          </button>
        </div>
        {rows.map((r) => (
          <div key={r.k} className="flex items-center gap-2">
            <input
              type="number"
              value={r.appId || ''}
              onChange={(e) =>
                setRows(rows.map((x) => (x.k === r.k ? { ...x, appId: num(e.target.value) } : x)))
              }
              placeholder="appID"
              className={`${inputCls} w-32`}
            />
            <input
              value={r.name}
              onChange={(e) =>
                setRows(rows.map((x) => (x.k === r.k ? { ...x, name: e.target.value } : x)))
              }
              placeholder="Nazwa gry"
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

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">
        Bot co ~1 h sprawdza aktualności Steam dla podanych gier i ogłasza nowe wpisy. AppID
        znajdziesz w adresie sklepu Steam (np.{' '}
        <code>
          store.steampowered.com/app/<strong>730</strong>/
        </code>{' '}
        → CS2).
      </p>
    </div>
  );
}
