'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { AutoreactConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

type Row = { k: string; channelId: string; emojiText: string };
const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function AutoReactForm({
  initial,
  guild,
}: {
  initial: AutoreactConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [enabled, setEnabled] = useState(initial.enabled);
  const idRef = useRef(0);
  const [rows, setRows] = useState<Row[]>(() =>
    (initial.rules ?? []).map((r) => ({
      k: `r${idRef.current++}`,
      channelId: r.channelId,
      emojiText: (r.emojis ?? []).join(' '),
    })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const rules = rows
        .map((x) => ({
          channelId: x.channelId,
          emojis: x.emojiText
            .split(/[\s,]+/)
            .map((e) => e.trim())
            .filter(Boolean)
            .slice(0, 6),
        }))
        .filter((x) => x.channelId && x.emojis.length);
      const r = await fetch('/api/autoreact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, rules }),
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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.autoreact.enabled')}</span>
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">
            {tp(lang, 'ui.autoreact.rulesLabel')}
          </span>
          <button
            type="button"
            onClick={() =>
              setRows((r) => [...r, { k: `r${idRef.current++}`, channelId: '', emojiText: '' }])
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
              value={r.emojiText}
              onChange={(e) =>
                setRows((rs) =>
                  rs.map((x) => (x.k === r.k ? { ...x, emojiText: e.target.value } : x)),
                )
              }
              placeholder={tp(lang, 'ui.autoreact.emojisPh')}
              className={inputCls}
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
      <p className="text-xs text-muted">{tp(lang, 'ui.autoreact.help')}</p>
    </div>
  );
}
