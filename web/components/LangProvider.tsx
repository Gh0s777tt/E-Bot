'use client';

// Kontekst aktywnego języka dla komponentów klienckich. Wartość początkowa = język odczytany z cookie
// po stronie serwera (przekazany z layoutu) → brak rozjazdu SSR/CSR. `useT()` daje gotowy translator.
import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { t as translate, type WebLocale } from '../lib/i18n';

const LangContext = createContext<WebLocale>('pl');

export function LangProvider({ lang, children }: { lang: WebLocale; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang(): WebLocale {
  return useContext(LangContext);
}

export function useT(): (key: string) => string {
  const lang = useContext(LangContext);
  return useMemo(() => (key: string) => translate(lang, key), [lang]);
}
