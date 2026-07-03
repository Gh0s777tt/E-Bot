'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { AutothreadConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { saveConfig } from '../lib/saveConfig';
import { useLang } from './LangContext';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

type Row = { k: string; channelId: string };
const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function AutothreadForm({
  initial,
  guild,
}: {
  initial: AutothreadConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [nameTemplate, setNameTemplate] = useState(initial.nameTemplate || '{user} — {date}');
  const idRef = useRef(0);
  const [rows, setRows] = useState<Row[]>(() =>
    (initial.channels ?? []).map((channelId) => ({ k: `c${idRef.current++}`, channelId })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function save() {
    setSt('saving');
    const res = await saveConfig('/api/autothread', {
      enabled,
      nameTemplate,
      channels: rows.map((x) => x.channelId).filter(Boolean),
    });
    setErrMsg(res.error);
    setSt(res.ok ? 'ok' : 'err');
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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.autothread.enabled')}</span>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.autothread.template')}</span>
        <input
          value={nameTemplate}
          onChange={(e) => setNameTemplate(e.target.value)}
          placeholder="{user} — {date}"
          className={inputCls}
        />
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">
            {tp(lang, 'ui.autothread.channelsLabel')}
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

      <SaveButton st={st} onClick={save} errorText={errMsg} />
      <p className="text-xs text-muted">{tp(lang, 'ui.autothread.help')}</p>
    </div>
  );
}
