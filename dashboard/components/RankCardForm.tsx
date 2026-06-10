'use client';

import { useState } from 'react';
import type { CardStyle } from '../lib/cardStyle';
import CardStyleEditor from './CardStyleEditor';
import SaveButton from './SaveButton';

export default function RankCardForm({ initial }: { initial: CardStyle }) {
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
      <CardStyleEditor value={s} onChange={setS} previewText="Twój Nick" />
      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">
        Styl używany przez komendę bota <code className="text-accent">/rank</code> (obrazek karty
        rangi z gradientem i czcionką).
      </p>
    </div>
  );
}
