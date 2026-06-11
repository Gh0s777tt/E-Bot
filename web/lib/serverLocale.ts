// Odczyt aktywnego języka po stronie serwera (komponenty serwerowe, layout, metadata).
// Trzymane osobno od i18n.ts, bo `next/headers` nie może trafić do komponentów klienckich.
import { cookies } from 'next/headers';
import { resolveLocale, type WebLocale } from './i18n';

export async function getServerLocale(): Promise<WebLocale> {
  const store = await cookies();
  return resolveLocale(store.get('lang')?.value);
}
