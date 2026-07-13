'use client';

// Etap I — kontekst języka panelu (14 języków). Wzorzec jak ViewModeContext: start
// deterministyczny ('pl' → zero hydration mismatch), po zamontowaniu localStorage,
// a przy pierwszym wejściu język przeglądarki. Cookie 'panel_lang' idzie równolegle,
// żeby przyszłe fale mogły tłumaczyć też server components.
import { useRouter } from 'next/navigation';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import {
  DEFAULT_PANEL_LOCALE,
  detectBrowserLocale,
  ensurePanelLocale,
  isPanelLocale,
  type PanelLocale,
} from '../lib/panelI18n';

const Ctx = createContext<{ lang: PanelLocale; setLang: (l: PanelLocale) => void }>({
  lang: DEFAULT_PANEL_LOCALE,
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<PanelLocale>(DEFAULT_PANEL_LOCALE);
  const router = useRouter();

  useEffect(() => {
    let target: PanelLocale = DEFAULT_PANEL_LOCALE;
    try {
      const saved = localStorage.getItem('panelLang');
      target = isPanelLocale(saved) ? saved : detectBrowserLocale();
    } catch {
      target = detectBrowserLocale();
    }
    if (target === DEFAULT_PANEL_LOCALE) return;
    // Doładuj słownik locale (dynamiczny chunk) ZANIM przełączysz stan — komponenty renderują
    // dopiero z gotowymi danymi, bez migania kluczy (audyt B-1).
    void ensurePanelLocale(target).then(() => setLangState(target));
  }, []);

  // Kierunek pisma na <html>: arabski = RTL, reszta LTR. Ustawiane klient-side, by zmiana języka
  // bez reloadu od razu przełączała układ (SSR ustawia to samo z cookie w app/layout.tsx).
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  function setLang(l: PanelLocale): void {
    try {
      localStorage.setItem('panelLang', l);
      // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API nie działa w Firefox/Safari; prosty zapis wystarcza
      document.cookie = `panel_lang=${l}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* brak localStorage/cookies */
    }
    // Doładuj słownik locale (chunk) PRZED przełączeniem stanu — bez migania kluczy (audyt B-1).
    // Potem odśwież komponenty serwerowe (czytają `panel_lang` przez getPanelLocale).
    void ensurePanelLocale(l).then(() => {
      setLangState(l);
      router.refresh();
    });
  }

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
