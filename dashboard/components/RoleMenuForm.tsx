'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { RoleMenuConfig } from '../lib/engagement';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { RoleSelect } from './pickers';
import SaveButton from './SaveButton';

type Opt = { label: string; roleId: string; description: string; emoji: string };
type Row = Opt & { k: string };

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function RoleMenuForm({
  initial,
  guild,
}: {
  initial: RoleMenuConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [message, setMessage] = useState(initial.message);
  const [placeholder, setPlaceholder] = useState(initial.placeholder);
  const idRef = useRef(0);
  const [rows, setRows] = useState<Row[]>(() =>
    initial.options.map((o) => ({ ...o, k: `o${idRef.current++}` })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const setRow = (k: string, patch: Partial<Opt>) =>
    setRows(rows.map((r) => (r.k === k ? { ...r, ...patch } : r)));
  const addRow = () =>
    setRows([
      ...rows,
      { label: '', roleId: '', description: '', emoji: '', k: `o${idRef.current++}` },
    ]);
  const delRow = (k: string) => setRows(rows.filter((r) => r.k !== k));

  async function save() {
    setSt('saving');
    try {
      const payload: RoleMenuConfig = {
        message,
        placeholder,
        options: rows.map(({ k, ...o }) => o),
      };
      const r = await fetch('/api/rolemenu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (r.ok) setSt('ok');
      else {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        setErrMsg(j.error || '');
        setSt('err');
      }
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.roles.msgContentLabel')}
          </span>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.roles.menuPlaceholderLabel')}
          </span>
          <input
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
            className={inputCls}
          />
        </label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">
            {tp(lang, 'ui.roles.optionsLabel')}
          </span>
          <button
            type="button"
            onClick={addRow}
            disabled={rows.length >= 25}
            className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated disabled:opacity-40"
          >
            <Plus size={12} /> {tp(lang, 'ui.roles.addBtn')}
          </button>
        </div>
        {rows.length === 0 && (
          <p className="text-xs text-muted">{tp(lang, 'ui.roles.noOptions')}</p>
        )}
        {rows.map((r) => (
          <div key={r.k} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_80px_auto]">
            <input
              value={r.label}
              onChange={(e) => setRow(r.k, { label: e.target.value })}
              placeholder={tp(lang, 'ui.roles.labelPh')}
              className={inputCls}
            />
            <RoleSelect
              value={r.roleId}
              onChange={(v) => setRow(r.k, { roleId: v })}
              roles={guild.roles}
            />
            <input
              value={r.emoji}
              onChange={(e) => setRow(r.k, { emoji: e.target.value })}
              placeholder="emoji"
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => delRow(r.k)}
              className="rounded-md border border-line p-2 text-muted transition hover:border-accent hover:text-accent"
              aria-label={tp(lang, 'ui.roles.delAria')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <SaveButton st={st} onClick={save} errorText={errMsg} />
      <p className="text-xs text-muted">
        {tp(lang, 'ui.roles.menuHelpPre')}
        <code className="text-accent">/rolemenu</code>
        {tp(lang, 'ui.roles.menuHelpPost')}
      </p>
    </div>
  );
}
