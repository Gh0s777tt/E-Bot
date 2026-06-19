'use client';

import { useMemo, useState } from 'react';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';

// Plac zabaw regex — testuj wzorzec automoda na przykładowym tekście, zanim go zapiszesz.
// Czysto klienckie (zero zapytań). Domyślnie flaga 'i' (jak automod). Bezpieczne: błędny wzorzec
// nie wywala — pokazuje komunikat.
export default function RegexTester() {
  const { lang } = useLang();
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('i');
  const [text, setText] = useState('');

  const result = useMemo(() => {
    if (!pattern) return { ok: true, error: '', matches: [] as string[] };
    try {
      const re = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
      const matches = text ? [...text.matchAll(re)].map((m) => m[0]).slice(0, 50) : [];
      return { ok: true, error: '', matches };
    } catch (e) {
      return { ok: false, error: (e as Error).message, matches: [] as string[] };
    }
  }, [pattern, flags, text]);

  const hit = result.matches.length > 0;
  const inputCls =
    'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

  return (
    <section className="panel-glow rounded-2xl border border-line bg-card p-5">
      <h2 className="mb-1 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
        {tp(lang, 'ui.mod.rxHeading')}
      </h2>
      <p className="mb-4 text-xs text-muted">
        {tp(lang, 'ui.mod.rxIntroPre')} <code>i</code> {tp(lang, 'ui.mod.rxIntroPost')}
      </p>

      <div className="flex flex-wrap gap-2">
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder={tp(lang, 'ui.mod.rxPatternPh')}
          className={`${inputCls} flex-1`}
        />
        <input
          value={flags}
          onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ''))}
          placeholder={tp(lang, 'ui.mod.rxFlagsPh')}
          className={`${inputCls} w-20`}
          aria-label={tp(lang, 'ui.mod.rxFlagsAria')}
        />
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={tp(lang, 'ui.mod.rxTextPh')}
        rows={3}
        className={`${inputCls} mt-2 resize-y`}
      />

      <div className="mt-3 text-sm">
        {!result.ok ? (
          <span className="text-accent">
            {tp(lang, 'ui.mod.rxErrorPre')} {result.error}
          </span>
        ) : !pattern ? (
          <span className="text-muted">{tp(lang, 'ui.mod.rxStart')}</span>
        ) : hit ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-green-400">
              {tp(lang, 'ui.mod.rxMatchedPre')} ({result.matches.length})
            </span>
            {result.matches.map((m, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: dopasowania mogą się powtarzać, indeks ok
                key={i}
                className="rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-xs text-white/90"
              >
                {m || '∅'}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted">{tp(lang, 'ui.mod.rxNoMatch')}</span>
        )}
      </div>
    </section>
  );
}
