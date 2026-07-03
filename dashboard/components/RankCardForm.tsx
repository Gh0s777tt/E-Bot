'use client';

import { useState } from 'react';
import type { CardStyle } from '../lib/cardStyle';
import { tp } from '../lib/panelI18n';
import { saveConfig } from '../lib/saveConfig';
import CardStyleEditor from './CardStyleEditor';
import { useLang } from './LangContext';
import SaveButton from './SaveButton';

export default function RankCardForm({ initial }: { initial: CardStyle }) {
  const { lang } = useLang();
  const [s, setS] = useState<CardStyle>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function save() {
    setSt('saving');
    const res = await saveConfig('/api/appearance/rankcard', s);
    setErrMsg(res.error);
    setSt(res.ok ? 'ok' : 'err');
    setTimeout(() => setSt('idle'), 2500);
  }

  // Realistyczny podgląd KARTY RANGI na żywo (avatar + nick + poziom + pasek XP) ze stylem z formularza.
  // Dane przykładowe; etykiety LVL/XP/# są uniwersalne (brandowe) → bez i18n. Zastępuje swatch edytora.
  const name = tp(lang, 'ui.appearance.previewText');
  const fontStyle = { color: s.textColor, fontFamily: `'${s.font}', sans-serif` };
  const card = (
    <div
      className="rounded-xl border border-line p-5"
      style={{ background: `linear-gradient(${s.angle}deg, ${s.from}, ${s.to})` }}
    >
      <div className="flex items-center gap-4">
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 text-2xl font-bold"
          style={{ borderColor: s.textColor, color: s.textColor }}
        >
          {(name || 'G').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1" style={fontStyle}>
          <div className="truncate text-xl font-bold">{name}</div>
          <div className="text-sm opacity-90">#7 · LVL 24</div>
        </div>
        <div className="text-end" style={fontStyle}>
          <div className="text-3xl font-bold leading-none">24</div>
          <div className="text-[11px] opacity-80">LVL</div>
        </div>
      </div>
      <div className="mt-4" style={{ color: s.textColor }}>
        <div className="flex justify-between text-[11px] opacity-90">
          <span>8 420 XP</span>
          <span>10 000 XP</span>
        </div>
        <div
          className="mt-1 h-2.5 overflow-hidden rounded-full"
          style={{ background: 'rgba(255,255,255,0.25)' }}
        >
          <div className="h-full rounded-full" style={{ width: '84%', background: s.textColor }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-xl space-y-4">
      <CardStyleEditor value={s} onChange={setS} previewText={name} preview={card} />
      <SaveButton st={st} onClick={save} errorText={errMsg} />
      <p className="text-xs text-muted">{tp(lang, 'ui.appearance.footNote')}</p>
    </div>
  );
}
