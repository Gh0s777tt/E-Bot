// Odczyt języka panelu po stronie serwera (komponenty serwerowe / page.tsx). Źródło: cookie
// `panel_lang` (ustawiany równolegle do localStorage przez LangContext.setLang). Trzymane osobno
// od panelI18n.ts, bo `next/headers` nie może trafić do komponentów klienckich.
import { cookies } from 'next/headers';
import { DEFAULT_PANEL_LOCALE, isPanelLocale, type PanelLocale } from './panelI18n';

export async function getPanelLocale(): Promise<PanelLocale> {
  const v = (await cookies()).get('panel_lang')?.value;
  return isPanelLocale(v) ? v : DEFAULT_PANEL_LOCALE;
}
