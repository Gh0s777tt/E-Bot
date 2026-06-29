'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { AutoslowConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

type Row = { k: string; channelId: string };
const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function AutoslowForm({
  initial,
  guild,
}: {
  initial: AutoslowConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [threshold, setThreshold] = useState(initial.threshold);
  const [windowSec, setWindowSec] = useState(initial.window);
  const [maxSlow, setMaxSlow] = useState(initial.maxSlow);
  const idRef = useRef(0);
  const [rows, setRows] = useState<Row[]>(() =>
    (initial.channels ?? []).map((channelId) => ({ k: `c${idRef.current++}`, channelId })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/autoslow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          threshold,
          window: windowSec,
          maxSlow,
          channels: rows.map((x) => x.channelId).filter(Boolean),
        }),
      });
      setSt(r.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  const num = (v: string, fallback: number) => {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
  };

  return (
    <div className="max-w-xl space-y-4">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">{tp(lang, 'ui.autoslow.enabled')}</span>
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.autoslow.threshold')}</span>
          <input
            type="number"
            min={1}
            max={100}
            value={threshold}
            onChange={(e) => setThreshold(num(e.target.value, 8))}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.autoslow.window')}</span>
          <input
            type="number"
            min={3}
            max={60}
            value={windowSec}
            onChange={(e) => setWindowSec(num(e.target.value, 10))}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.autoslow.maxSlow')}</span>
          <input
            type="number"
            min={0}
            max={600}
            value={maxSlow}
            onChange={(e) => setMaxSlow(num(e.target.value, 30))}
            className={inputCls}
          />
        </label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">
            {tp(lang, 'ui.autoslow.channelsLabel')}
          </span>
          <button
            type="button"
            onClick={() => setRows((r) => [...r, { k: `c${idRef.current++}`, channelId: '' }])}
            className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated"
          >
            <Plus size={12} /> {tp(lang, 'ui.gaming.addBtn')}
          </button>
        </div>
        {rows.map((r) => (
          <div key={r.k} className="flex items-center gap-2">
            <ChannelSelect
              value={r.channelId}
              onChange={(v) =>
                setRows((rs) => rs.map((x) => (x.k === r.k ? { ...x, channelId: v } : x)))
              }
              channels={guild.channels}
              placeholder={tp(lang, 'ui.gaming.channelPh')}
            />
            <button
              type="button"
              onClick={() => setRows((rs) => rs.filter((x) => x.k !== r.k))}
              className="rounded-md border border-line p-2 text-muted transition hover:border-accent hover:text-accent"
              aria-label={tp(lang, 'ui.gaming.delAria')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">{tp(lang, 'ui.autoslow.help')}</p>
    </div>
  );
}
