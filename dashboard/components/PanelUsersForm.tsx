'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { tp } from '../lib/panelI18n';
import type { PanelRole, StaffEntry } from '../lib/panelRoles';
import { useLang } from './LangContext';

const inp =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

const ROLE_DESC_KEY: Record<PanelRole, string> = {
  admin: 'ui.settings.roleAdminDesc',
  editor: 'ui.settings.roleEditorDesc',
  viewer: 'ui.settings.roleViewerDesc',
};

export default function PanelUsersForm({ initial }: { initial: StaffEntry[] }) {
  const { lang } = useLang();
  const [staff, setStaff] = useState<StaffEntry[]>(initial);
  const keys = useRef<number[]>(initial.map((_, i) => i + 1));
  const nextKey = useRef(initial.length + 1);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');

  function update(i: number, patch: Partial<StaffEntry>) {
    setStaff((s) => s.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  }
  function add() {
    keys.current.push(nextKey.current++);
    setStaff((s) => [...s, { uid: '', label: '', role: 'viewer' }]);
  }
  function remove(i: number) {
    keys.current.splice(i, 1);
    setStaff((s) => s.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSt('saving');
    setMsg('');
    try {
      const r = await fetch('/api/panel-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff }),
      });
      const j = (await r.json()) as { ok?: boolean; error?: string };
      if (r.ok && j.ok) setSt('ok');
      else {
        setSt('err');
        setMsg(j.error || tp(lang, 'ui.settings.saveError'));
      }
    } catch {
      setSt('err');
      setMsg(tp(lang, 'ui.settings.netError'));
    }
    setTimeout(() => setSt('idle'), 3000);
  }

  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted">
        {tp(lang, 'ui.settings.usersIntroPre')}{' '}
        <strong className="text-white/80">{tp(lang, 'ui.settings.usersIntroStrong')}</strong>{' '}
        {tp(lang, 'ui.settings.usersIntroMid')} <em>admin</em>{' '}
        {tp(lang, 'ui.settings.usersIntroPost')}
      </p>

      {staff.map((e, i) => (
        <div
          key={keys.current[i]}
          className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-bg/40 p-2"
        >
          <input
            value={e.uid}
            onChange={(ev) =>
              update(i, { uid: ev.target.value.replace(/[^0-9]/g, '').slice(0, 25) })
            }
            placeholder={tp(lang, 'ui.settings.usersUidPh')}
            className={`${inp} flex-1 font-mono`}
          />
          <input
            value={e.label}
            onChange={(ev) => update(i, { label: ev.target.value })}
            placeholder={tp(lang, 'ui.settings.usersLabelPh')}
            className={`${inp} flex-1`}
            maxLength={60}
          />
          <select
            value={e.role}
            onChange={(ev) => update(i, { role: ev.target.value as PanelRole })}
            className={`${inp} w-auto`}
          >
            {(['admin', 'editor', 'viewer'] as PanelRole[]).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => remove(i)}
            className="shrink-0 rounded-md border border-line px-2 py-1.5 text-muted transition hover:border-accent hover:text-accent"
            title={tp(lang, 'ui.settings.del')}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <div className="rounded-md border border-line/60 bg-bg/30 p-3 text-xs text-muted">
        <p className="mb-1 font-semibold text-white/80">{tp(lang, 'ui.settings.permLevels')}</p>
        <ul className="space-y-0.5">
          {(['admin', 'editor', 'viewer'] as PanelRole[]).map((r) => (
            <li key={r}>
              <span className="font-mono text-accent">{r}</span> — {tp(lang, ROLE_DESC_KEY[r])}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 rounded-md border border-line px-4 py-2 text-sm font-semibold transition hover:border-accent hover:bg-elevated"
        >
          <Plus size={15} /> {tp(lang, 'ui.settings.addUser')}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={st === 'saving'}
          className="rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          {st === 'saving' ? tp(lang, 'ui.settings.saving') : tp(lang, 'ui.settings.save')}
        </button>
        {st === 'ok' && (
          <span className="text-sm text-green-400">✓ {tp(lang, 'ui.settings.saved')}</span>
        )}
        {st === 'err' && <span className="text-sm text-accent">{msg}</span>}
      </div>
    </div>
  );
}
