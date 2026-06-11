'use client';

// Przełącznik języka dla odwiedzających: zapisuje wybór w cookie `lang` i przeładowuje stronę,
// żeby komponenty serwerowe (w tym `<html lang dir>`) wyrenderowały się w nowym języku.
import { useState } from 'react';
import { LOCALE_NAMES, WEB_LOCALES } from '../lib/i18n';
import { useLang } from './LangProvider';

export default function LangSwitcher() {
  const lang = useLang();
  const [open, setOpen] = useState(false);

  function pick(code: string) {
    // biome-ignore lint/suspicious/noDocumentCookie: prosta, trwała preferencja UI; Cookie Store API ma słabe wsparcie przeglądarek
    document.cookie = `lang=${code}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    location.reload();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 items-center gap-1.5 rounded bg-white/10 px-2.5 text-xs text-white/80 transition hover:bg-white/20"
      >
        <span aria-hidden>🌐</span>
        <span className="hidden sm:inline">{LOCALE_NAMES[lang]}</span>
      </button>

      {open && (
        <>
          {/* klik poza listą zamyka ją */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 max-h-80 w-44 overflow-y-auto rounded-lg border border-white/10 bg-elevated py-1 shadow-2xl"
          >
            {WEB_LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                role="menuitem"
                aria-current={code === lang}
                onClick={() => pick(code)}
                className={`block w-full px-3 py-1.5 text-start text-sm transition hover:bg-white/10 ${
                  code === lang ? 'font-semibold text-accent' : 'text-white/80'
                }`}
              >
                {LOCALE_NAMES[code]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
