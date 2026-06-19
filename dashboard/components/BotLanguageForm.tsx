'use client';

import { useState } from 'react';
import { BOT_LOCALE_OPTIONS, type BotLocale } from '../lib/botLocales';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import SaveButton from './SaveButton';

const selectCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function BotLanguageForm({ initial }: { initial: BotLocale }) {
  const { lang } = useLang();
  const [locale, setLocale] = useState<BotLocale>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });
      setSt(r.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  return (
    <div className="max-w-md space-y-4">
      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.settings.botLangLabel')}</span>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as BotLocale)}
          className={selectCls}
        >
          {BOT_LOCALE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <SaveButton st={st} onClick={save} />

      <p className="text-xs text-muted">
        <strong className="text-white/80">Auto</strong> {tp(lang, 'ui.settings.langFooterMid')}{' '}
        <strong className="text-white/80">{tp(lang, 'ui.settings.langFooterStrong2')}</strong>
        {tp(lang, 'ui.settings.langFooterPost')}
      </p>
    </div>
  );
}
