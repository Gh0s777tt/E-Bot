'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { RoleSelect } from './pickers';
import SaveButton from './SaveButton';

type Btn = { label: string; roleId: string; emoji: string };
type Cfg = { message: string; buttons: Btn[] };
type Row = Btn & { k: string };

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function ButtonRolesForm({ initial, guild }: { initial: Cfg; guild: GuildMeta }) {
  const { lang } = useLang();
  const [message, setMessage] = useState(initial.message);
  const idRef = useRef(0);
  const [rows, setRows] = useState<Row[]>(() =>
    initial.buttons.map((b) => ({ ...b, k: `b${idRef.current++}` })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const payload: Cfg = { message, buttons: rows.map(({ k, ...b }) => b) };
      const r = await fetch('/api/buttonroles', {
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

  const setRow = (k: string, patch: Partial<Btn>) =>
    setRows(rows.map((r) => (r.k === k ? { ...r, ...patch } : r)));
  const addRow = () =>
    setRows([...rows, { label: '', roleId: '', emoji: '', k: `b${idRef.current++}` }]);
  const delRow = (k: string) => setRows(rows.filter((r) => r.k !== k));

  return (
    <div className="max-w-2xl space-y-4">
      <label className="block space-y-1 text-sm">
        <span className="font-semibold text-white/90">
          {tp(lang, 'ui.engagement.br.messageLabel')}
        </span>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={tp(lang, 'ui.engagement.br.messagePh')}
          className={inputCls}
        />
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">
            {tp(lang, 'ui.engagement.br.buttonsLabel')}
          </span>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated"
          >
            <Plus size={12} /> {tp(lang, 'ui.engagement.br.add')}
          </button>
        </div>
        {rows.length === 0 && (
          <p className="text-xs text-muted">{tp(lang, 'ui.engagement.br.empty')}</p>
        )}
        {rows.map((r) => (
          <div key={r.k} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_90px_auto]">
            <input
              value={r.label}
              onChange={(e) => setRow(r.k, { label: e.target.value })}
              placeholder={tp(lang, 'ui.engagement.br.labelPh')}
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
              placeholder={tp(lang, 'ui.engagement.br.emojiPh')}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => delRow(r.k)}
              className="rounded-md border border-line p-2 text-muted transition hover:border-accent hover:text-accent"
              aria-label={tp(lang, 'ui.engagement.delAria')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">
        {tp(lang, 'ui.engagement.br.footerPre')} <code className="text-accent">/buttonpanel</code>{' '}
        {tp(lang, 'ui.engagement.br.footerPost')}
      </p>
    </div>
  );
}
