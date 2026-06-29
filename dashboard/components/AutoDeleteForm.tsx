'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { AutodeleteConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

type Row = { k: string; channelId: string; minutes: number };

export default function AutoDeleteForm({
  initial,
  guild,
}: {
  initial: AutodeleteConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const idRef = useRef(0);
  const [rows, setRows] = useState<Row[]>(() =>
    (initial.rules ?? []).map((r) => ({
      k: `r${idRef.current++}`,
      channelId: r.channelId,
      minutes: r.minutes,
    })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const rules = rows
        .map((x) => ({ channelId: x.channelId, minutes: x.minutes }))
        .filter((x) => x.channelId && x.minutes > 0);
      const r = await fetch('/api/autodelete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules }),
      });
      setSt(r.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">
            {tp(lang, 'ui.autodelete.rulesLabel')}
          </span>
          <button
            type="button"
            onClick={() =>
              setRows((r) => [...r, { k: `r${idRef.current++}`, channelId: '', minutes: 60 }])
            }
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
            <input
              type="number"
              min={1}
              max={10080}
              value={r.minutes}
              onChange={(e) =>
                setRows((rs) =>
                  rs.map((x) =>
                    x.k === r.k ? { ...x, minutes: Number.parseInt(e.target.value, 10) || 0 } : x,
                  ),
                )
              }
              placeholder={tp(lang, 'ui.autodelete.minutesPh')}
              className="w-24 rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent"
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
      <p className="text-xs text-muted">{tp(lang, 'ui.autodelete.help')}</p>
    </div>
  );
}
