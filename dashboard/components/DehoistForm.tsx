'use client';

import { useState } from 'react';
import type { DehoistConfig } from '../lib/community';
import { tp } from '../lib/panelI18n';
import { saveConfig } from '../lib/saveConfig';
import { useLang } from './LangContext';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function DehoistForm({ initial }: { initial: DehoistConfig }) {
  const { lang } = useLang();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [fallback, setFallback] = useState(initial.fallback || 'Dehoist');
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function save() {
    setSt('saving');
    const res = await saveConfig('/api/dehoist', { enabled, fallback: fallback.slice(0, 32) });
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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.dehoist.enabled')}</span>
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.dehoist.fallback')}</span>
        <input
          value={fallback}
          onChange={(e) => setFallback(e.target.value)}
          maxLength={32}
          placeholder={tp(lang, 'ui.dehoist.fallbackPh')}
          className={inputCls}
        />
      </label>

      <SaveButton st={st} onClick={save} errorText={errMsg} />
      <p className="text-xs text-muted">{tp(lang, 'ui.dehoist.help')}</p>
    </div>
  );
}
