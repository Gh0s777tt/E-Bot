'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { StickyrolesConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { saveConfig } from '../lib/saveConfig';
import { useLang } from './LangContext';
import { RoleSelect } from './pickers';
import SaveButton from './SaveButton';

type Row = { k: string; roleId: string };

export default function StickyRolesForm({
  initial,
  guild,
}: {
  initial: StickyrolesConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [all, setAll] = useState(initial.all);
  const idRef = useRef(0);
  const [rows, setRows] = useState<Row[]>(() =>
    (initial.roles ?? []).map((roleId) => ({ k: `r${idRef.current++}`, roleId })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function save() {
    setSt('saving');
    const res = await saveConfig('/api/stickyroles', {
      enabled,
      all,
      roles: rows.map((x) => x.roleId).filter(Boolean),
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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.sticky.enabled')}</span>
      </label>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={all}
          onChange={(e) => setAll(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        <span className="text-white/90">{tp(lang, 'ui.sticky.all')}</span>
      </label>

      {!all && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white/90">
              {tp(lang, 'ui.sticky.rolesLabel')}
            </span>
            <button
              type="button"
              onClick={() => setRows((r) => [...r, { k: `r${idRef.current++}`, roleId: '' }])}
              className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated"
            >
              <Plus size={12} /> {tp(lang, 'ui.gaming.addBtn')}
            </button>
          </div>
          {rows.map((r) => (
            <div key={r.k} className="flex items-center gap-2">
              <RoleSelect
                value={r.roleId}
                onChange={(v) =>
                  setRows((rs) => rs.map((x) => (x.k === r.k ? { ...x, roleId: v } : x)))
                }
                roles={guild.roles}
                placeholder={tp(lang, 'ui.sticky.rolePh')}
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
      )}

      <SaveButton st={st} onClick={save} errorText={errMsg} />
      <p className="text-xs text-muted">{tp(lang, 'ui.sticky.help')}</p>
    </div>
  );
}
