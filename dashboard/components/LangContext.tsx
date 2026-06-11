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
    try {
      const saved = localStorage.getItem('panelLang');
      if (isPanelLocale(saved)) {
        setLangState(saved);
        return;
      }
    } catch {
      /* brak localStorage */
    }
    const detected = detectBrowserLocale();
    if (detected !== DEFAULT_PANEL_LOCALE) setLangState(detected);
  }, []);

  function setLang(l: PanelLocale): void {
    setLangState(l);
    try {
      localStorage.setItem('panelLang', l);
      // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API nie działa w Firefox/Safari; prosty zapis wystarcza
      document.cookie = `panel_lang=${l}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* brak localStorage/cookies */
    }
    // Odśwież komponenty serwerowe (page.tsx czyta `panel_lang` przez getPanelLocale), żeby ich
    // teksty zmieniły język natychmiast — bez pełnego reloadu, zachowując stan klienta (formularze).
    router.refresh();
  }

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
