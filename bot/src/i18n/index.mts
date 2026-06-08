// Publiczne API i18n bota: t() + resolveLocale() + re-eksport rejestru języków.
import { getSettings } from '../lib/db.mts';
import {
  BASE_LOCALE,
  DEFAULT_LOCALE,
  fromDiscordLocale,
  isLocale,
  type Locale,
} from './locales.mts';
import { DICTS } from './strings.mts';

export * from './locales.mts';

// ─── Override języka z panelu (klucz settings 'locale': 'auto' | <Locale>) ───
// Czytamy z lokalnego SQLite (zasilanego przez settings-sync). Krótki cache, by nie
// otwierać bazy przy każdej interakcji.
let overrideCache: { value: string; at: number } | null = null;
const OVERRIDE_TTL_MS = 15_000;
function localeOverride(): string {
  const now = Date.now();
  if (overrideCache && now - overrideCache.at < OVERRIDE_TTL_MS) return overrideCache.value;
  let value = 'auto';
  try {
    const v = getSettings().locale;
    if (v) value = v;
  } catch {
    /* brak bazy / błąd — zostaje 'auto' */
  }
  overrideCache = { value, at: now };
  return value;
}

// Resolver języka: override serwera (jeśli ≠ 'auto') > locale użytkownika z Discorda > DEFAULT.
export function resolveLocale(interaction: { locale?: string | null } | null | undefined): Locale {
  const ov = localeOverride();
  if (ov !== 'auto' && isLocale(ov)) return ov;
  return fromDiscordLocale(interaction?.locale) ?? DEFAULT_LOCALE;
}

// Tłumaczenie z interpolacją {placeholder}. Łańcuch fallback: locale → en → pl → sam klucz.
export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const raw =
    DICTS[locale]?.[key] ?? DICTS[DEFAULT_LOCALE]?.[key] ?? DICTS[BASE_LOCALE]?.[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
}
