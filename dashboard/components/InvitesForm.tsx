'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { InvitesConfig } from '../lib/engagement';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { ChannelSelect, RoleSelect } from './pickers';
import SaveButton from './SaveButton';

type Row = { count: number; roleId: string; k: string };

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const num = (v: string): number => Math.max(0, Math.floor(Number(v) || 0));

export default function InvitesForm({
  initial,
  guild,
}: {
  initial: InvitesConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [logChannelId, setLogChannelId] = useState(initial.logChannelId);
  const [fakeMinAgeDays, setFakeMinAgeDays] = useState(initial.fakeMinAgeDays);
  const idRef = useRef(0);
  const [rows, setRows] = useState<Row[]>(() =>
    initial.rewards.map((r) => ({ ...r, k: `r${idRef.current++}` })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  const setRow = (k: string, patch: Partial<Row>) =>
    setRows(rows.map((r) => (r.k === k ? { ...r, ...patch } : r)));
  const addRow = () => setRows([...rows, { count: 5, roleId: '', k: `r${idRef.current++}` }]);
  const delRow = (k: string) => setRows(rows.filter((r) => r.k !== k));

  async function save() {
    setSt('saving');
    try {
      const payload: InvitesConfig = {
        enabled,
        logChannelId,
        fakeMinAgeDays,
        rewards: rows.map(({ k, ...r }) => r),
      };
      const r = await fetch('/api/invites', {
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
    <div className="max-w-2xl space-y-4">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">
          {tp(lang, 'ui.engagement.inv.enabledToggle')}
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.engagement.inv.logChannelLabel')}
          </span>
          <ChannelSelect
            value={logChannelId}
            onChange={setLogChannelId}
            channels={guild.channels}
            placeholder={tp(lang, 'ui.engagement.inv.logChannelPh')}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.engagement.inv.fakeAgeLabel')}
          </span>
          <input
            type="number"
            value={fakeMinAgeDays}
            onChange={(e) => setFakeMinAgeDays(num(e.target.value))}
            className={inputCls}
          />
        </label>
      </div>

      <div className="space-y-2 rounded-lg border border-line/60 bg-elevated/40 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">
            {tp(lang, 'ui.engagement.inv.rewardsLabel')}
          </span>
          <button
            type="button"
            onClick={addRow}
            disabled={rows.length >= 20}
            className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated disabled:opacity-40"
          >
            <Plus size={12} /> {tp(lang, 'ui.engagement.inv.addThreshold')}
          </button>
        </div>
        {rows.length === 0 && (
          <p className="text-xs text-muted">{tp(lang, 'ui.engagement.inv.empty')}</p>
        )}
        {rows.map((r) => (
          <div key={r.k} className="grid grid-cols-1 gap-2 sm:grid-cols-[100px_1fr_auto]">
            <input
              type="number"
              value={r.count}
              onChange={(e) => setRow(r.k, { count: Math.max(1, num(e.target.value)) })}
              className={inputCls}
            />
            <RoleSelect
              value={r.roleId}
              onChange={(v) => setRow(r.k, { roleId: v })}
              roles={guild.roles}
              placeholder={tp(lang, 'ui.engagement.inv.rolePh')}
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
        {tp(lang, 'ui.engagement.inv.footerPre')}{' '}
        <em>{tp(lang, 'ui.engagement.inv.footerPerm')}</em>{' '}
        {tp(lang, 'ui.engagement.inv.footerMid')} <code>_ALL.sql</code>{' '}
        {tp(lang, 'ui.engagement.inv.footerStats')} <code className="text-accent">/invites</code>.
      </p>
    </div>
  );
}
