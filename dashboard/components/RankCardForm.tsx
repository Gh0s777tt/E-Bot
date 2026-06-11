'use client';

import { useState } from 'react';
import type { CardStyle } from '../lib/cardStyle';
import { tp } from '../lib/panelI18n';
import CardStyleEditor from './CardStyleEditor';
import { useLang } from './LangContext';
import SaveButton from './SaveButton';

export default function RankCardForm({ initial }: { initial: CardStyle }) {
  const { lang } = useLang();
  const [s, setS] = useState<CardStyle>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/appearance/rankcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      });
      setSt(r.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  return (
    <div className="max-w-xl space-y-4">
      <CardStyleEditor
        value={s}
        onChange={setS}
        previewText={tp(lang, 'ui.appearance.previewText')}
      />
      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">{tp(lang, 'ui.appearance.footNote')}</p>
    </div>
  );
}
