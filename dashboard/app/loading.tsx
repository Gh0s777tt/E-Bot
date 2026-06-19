'use client';

import { useLang } from '../components/LangContext';
import { tp } from '../lib/panelI18n';

export default function Loading() {
  const { lang } = useLang();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="grid h-14 w-14 animate-pulse place-items-center rounded-2xl bg-accent font-display text-2xl shadow-glow">
        E
      </div>
      <p className="font-display text-sm uppercase tracking-[0.3em] text-muted">
        {tp(lang, 'ui.sys.loading')}
      </p>
    </div>
  );
}
