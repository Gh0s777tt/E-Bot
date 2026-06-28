'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { AutoResponder, ResponderConfig } from '../lib/community';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import SaveButton from './SaveButton';

type CmdRow = { name: string; response: string; k: string };
type AutoRow = AutoResponder & { k: string };

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

const MATCH: { v: AutoResponder['match']; key: string }[] = [
  { v: 'contains', key: 'ui.responder.matchContains' },
  { v: 'exact', key: 'ui.responder.matchExact' },
  { v: 'starts', key: 'ui.responder.matchStarts' },
];

export default function ResponderForm({ initial }: { initial: ResponderConfig }) {
  const { lang } = useLang();
  const { commands, autoresponders, ...rest } = initial;
  const [b, setB] = useState(rest);
  const idRef = useRef(0);
  const [cmds, setCmds] = useState<CmdRow[]>(() =>
    commands.map((c) => ({ ...c, k: `c${idRef.current++}` })),
  );
  const [autos, setAutos] = useState<AutoRow[]>(() =>
    autoresponders.map((a) => ({ ...a, k: `a${idRef.current++}` })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function save() {
    setSt('saving');
    try {
      const payload: ResponderConfig = {
        ...b,
        commands: cmds.map(({ k, ...c }) => c).filter((c) => c.name && c.response),
        autoresponders: autos.map(({ k, ...a }) => a).filter((a) => a.trigger && a.response),
      };
      const r = await fetch('/api/responder', {
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
    <div className="max-w-2xl space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={b.enabled}
            onChange={(e) => setB({ ...b, enabled: e.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">{tp(lang, 'ui.responder.enabled')}</span>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.responder.prefixLabel')}
          </span>
          <input
            value={b.prefix}
            onChange={(e) => setB({ ...b, prefix: e.target.value })}
            maxLength={5}
            className={`${inputCls} w-24`}
          />
        </label>
      </div>

      {/* Komendy własne */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">
            {tp(lang, 'ui.responder.cmdsLabel').replace('{prefix}', b.prefix)}
          </span>
          <button
            type="button"
            onClick={() => setCmds([...cmds, { name: '', response: '', k: `c${idRef.current++}` }])}
            className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated"
          >
            <Plus size={12} /> {tp(lang, 'ui.responder.add')}
          </button>
        </div>
        {cmds.map((c) => (
          <div key={c.k} className="flex items-start gap-2">
            <input
              value={c.name}
              onChange={(e) =>
                setCmds(cmds.map((x) => (x.k === c.k ? { ...x, name: e.target.value } : x)))
              }
              placeholder={tp(lang, 'ui.responder.cmdNamePh')}
              className={`${inputCls} w-40`}
            />
            <textarea
              value={c.response}
              onChange={(e) =>
                setCmds(cmds.map((x) => (x.k === c.k ? { ...x, response: e.target.value } : x)))
              }
              placeholder={tp(lang, 'ui.responder.responsePh')}
              rows={2}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setCmds(cmds.filter((x) => x.k !== c.k))}
              className="rounded-md border border-line p-2 text-muted transition hover:border-accent hover:text-accent"
              aria-label={tp(lang, 'ui.responder.remove')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Autoresponder */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">
            {tp(lang, 'ui.responder.autosLabel')}
          </span>
          <button
            type="button"
            onClick={() =>
              setAutos([
                ...autos,
                { trigger: '', response: '', match: 'contains', k: `a${idRef.current++}` },
              ])
            }
            className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated"
          >
            <Plus size={12} /> {tp(lang, 'ui.responder.add')}
          </button>
        </div>
        {autos.map((a) => (
          <div key={a.k} className="flex items-start gap-2">
            <input
              value={a.trigger}
              onChange={(e) =>
                setAutos(autos.map((x) => (x.k === a.k ? { ...x, trigger: e.target.value } : x)))
              }
              placeholder={tp(lang, 'ui.responder.triggerPh')}
              className={`${inputCls} w-40`}
            />
            <select
              value={a.match}
              onChange={(e) =>
                setAutos(
                  autos.map((x) =>
                    x.k === a.k ? { ...x, match: e.target.value as AutoResponder['match'] } : x,
                  ),
                )
              }
              className={`${inputCls} w-32`}
            >
              {MATCH.map((m) => (
                <option key={m.v} value={m.v}>
                  {tp(lang, m.key)}
                </option>
              ))}
            </select>
            <textarea
              value={a.response}
              onChange={(e) =>
                setAutos(autos.map((x) => (x.k === a.k ? { ...x, response: e.target.value } : x)))
              }
              placeholder={tp(lang, 'ui.responder.responsePh')}
              rows={2}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setAutos(autos.filter((x) => x.k !== a.k))}
              className="rounded-md border border-line p-2 text-muted transition hover:border-accent hover:text-accent"
              aria-label={tp(lang, 'ui.responder.remove')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <SaveButton st={st} onClick={save} errorText={errMsg} />
      <p className="text-xs text-muted">
        {tp(lang, 'ui.responder.footNote').replace('{prefix}', b.prefix)}
      </p>
    </div>
  );
}
