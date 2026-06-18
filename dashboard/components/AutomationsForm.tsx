'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { AutomationRule, AutomationsConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { ChannelSelect, RoleSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

type Row = AutomationRule & { k: string };
const blank = (): AutomationRule => ({
  event: 'join',
  keyword: '',
  action: 'message',
  channelId: '',
  roleId: '',
  text: '',
});

export default function AutomationsForm({
  initial,
  guild,
}: {
  initial: AutomationsConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [enabled, setEnabled] = useState(initial.enabled);
  const idRef = useRef(0);
  const [rows, setRows] = useState<Row[]>(() =>
    initial.rules.map((r) => ({ ...r, k: `r${idRef.current++}` })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  const patch = (k: string, p: Partial<AutomationRule>) =>
    setRows(rows.map((r) => (r.k === k ? { ...r, ...p } : r)));

  async function save() {
    setSt('saving');
    try {
      const payload: AutomationsConfig = {
        enabled,
        rules: rows.map(({ k, ...r }) => r),
      };
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSt(res.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  return (
    <div className="max-w-3xl space-y-4">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">{tp(lang, 'ui.automations.enabled')}</span>
      </label>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/90">
          {tp(lang, 'ui.automations.rulesLabel')}
        </span>
        <button
          type="button"
          onClick={() => setRows([...rows, { ...blank(), k: `r${idRef.current++}` }])}
          disabled={rows.length >= 20}
          className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated disabled:opacity-40"
        >
          <Plus size={12} /> {tp(lang, 'ui.automations.addRule')}
        </button>
      </div>

      {rows.map((r) => (
        <div key={r.k} className="space-y-2 rounded-lg border border-line/60 bg-elevated/30 p-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <select
              value={r.event}
              onChange={(e) => patch(r.k, { event: e.target.value as AutomationRule['event'] })}
              className={inputCls}
            >
              <option value="join">{tp(lang, 'ui.automations.eventJoin')}</option>
              <option value="keyword">{tp(lang, 'ui.automations.eventKeyword')}</option>
            </select>
            {r.event === 'keyword' ? (
              <input
                value={r.keyword}
                onChange={(e) => patch(r.k, { keyword: e.target.value })}
                placeholder={tp(lang, 'ui.automations.keywordPh')}
                className={inputCls}
              />
            ) : (
              <div />
            )}
            <select
              value={r.action}
              onChange={(e) => patch(r.k, { action: e.target.value as AutomationRule['action'] })}
              className={inputCls}
            >
              <option value="message">{tp(lang, 'ui.automations.actionMessage')}</option>
              <option value="role">{tp(lang, 'ui.automations.actionRole')}</option>
              <option value="dm">{tp(lang, 'ui.automations.actionDm')}</option>
            </select>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {r.action === 'role' ? (
              <RoleSelect
                value={r.roleId}
                onChange={(v) => patch(r.k, { roleId: v })}
                roles={guild.roles}
              />
            ) : r.action === 'message' ? (
              <ChannelSelect
                value={r.channelId}
                onChange={(v) => patch(r.k, { channelId: v })}
                channels={guild.channels}
              />
            ) : (
              <div className="text-xs text-muted">{tp(lang, 'ui.automations.dmNote')}</div>
            )}
            {r.action !== 'role' && (
              <input
                value={r.text}
                onChange={(e) => patch(r.k, { text: e.target.value })}
                placeholder={tp(lang, 'ui.automations.textPh')}
                className={inputCls}
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => setRows(rows.filter((x) => x.k !== r.k))}
            className="inline-flex items-center gap-1 text-xs text-muted transition hover:text-accent"
          >
            <Trash2 size={12} /> {tp(lang, 'ui.automations.removeRule')}
          </button>
        </div>
      ))}

      <SaveButton st={st} onClick={save} />
    </div>
  );
}
