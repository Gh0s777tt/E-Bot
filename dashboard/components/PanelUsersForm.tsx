'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { PanelRole, StaffEntry } from '../lib/panelRoles';

const inp =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

const ROLE_LABEL: Record<PanelRole, string> = {
  admin: 'Admin (pełny dostęp)',
  editor: 'Editor (edycja bez zarządzania użytkownikami)',
  viewer: 'Viewer (tylko podgląd)',
};

export default function PanelUsersForm({ initial }: { initial: StaffEntry[] }) {
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
        setMsg(j.error || 'Błąd zapisu.');
      }
    } catch {
      setSt('err');
      setMsg('Błąd sieci.');
    }
    setTimeout(() => setSt('idle'), 3000);
  }

  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted">
        Dodaj współpracowników po ich <strong className="text-white/80">Discord ID</strong> i nadaj
        rolę. Właściciele (z konfiguracji serwera) mają zawsze rolę <em>admin</em> i nie trzeba ich
        tu dodawać.
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
            placeholder="Discord ID (np. 1512…)"
            className={`${inp} flex-1 font-mono`}
          />
          <input
            value={e.label}
            onChange={(ev) => update(i, { label: ev.target.value })}
            placeholder="opis (np. Moderator)"
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
            title="Usuń"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <div className="rounded-md border border-line/60 bg-bg/30 p-3 text-xs text-muted">
        <p className="mb-1 font-semibold text-white/80">Poziomy uprawnień</p>
        <ul className="space-y-0.5">
          {(['admin', 'editor', 'viewer'] as PanelRole[]).map((r) => (
            <li key={r}>
              <span className="font-mono text-accent">{r}</span> —{' '}
              {ROLE_LABEL[r].split('(')[1]?.replace(')', '')}
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
          <Plus size={15} /> Dodaj użytkownika
        </button>
        <button
          type="button"
          onClick={save}
          disabled={st === 'saving'}
          className="rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          {st === 'saving' ? 'Zapisywanie…' : 'Zapisz'}
        </button>
        {st === 'ok' && <span className="text-sm text-green-400">✓ Zapisano</span>}
        {st === 'err' && <span className="text-sm text-accent">{msg}</span>}
      </div>
    </div>
  );
}
