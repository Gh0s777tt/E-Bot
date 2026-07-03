'use client';

import { useState } from 'react';
import type { FlagtransConfig } from '../lib/community';
import { tp } from '../lib/panelI18n';
import { saveConfig } from '../lib/saveConfig';
import { useLang } from './LangContext';
import SaveButton from './SaveButton';

export default function FlagTranslateForm({ initial }: { initial: FlagtransConfig }) {
  const { lang } = useLang();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function save() {
    setSt('saving');
    const res = await saveConfig('/api/flagtranslate', { enabled });
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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.flagtrans.enabled')}</span>
      </label>
      <SaveButton st={st} onClick={save} errorText={errMsg} />
      <p className="text-xs text-muted">{tp(lang, 'ui.flagtrans.help')}</p>
    </div>
  );
}
