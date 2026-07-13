// Odczyt języka panelu po stronie serwera (komponenty serwerowe / page.tsx). Źródło: cookie
// `panel_lang` (ustawiany równolegle do localStorage przez LangContext.setLang). Trzymane osobno
// od panelI18n.ts, bo `next/headers` nie może trafić do komponentów klienckich.
import { cookies } from 'next/headers';
import {
  DEFAULT_PANEL_LOCALE,
  ensurePanelLocale,
  isPanelLocale,
  type PanelLocale,
} from './panelI18n';

export async function getPanelLocale(): Promise<PanelLocale> {
  const v = (await cookies()).get('panel_lang')?.value;
  const locale = isPanelLocale(v) ? v : DEFAULT_PANEL_LOCALE;
  // Doładuj słownik locale ZANIM server components zawołają tp (audyt B-1) — to jednolite
  // wejście serwerowe, więc 69 stron nie wymaga zmian; tp i tak fallbackuje do pl.
  await ensurePanelLocale(locale);
  return locale;
}
