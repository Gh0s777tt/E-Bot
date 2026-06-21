// Centralny rejestr języków bota (i18n).
// Node native TS strip = TYLKO erasable: bez enum/namespace — używamy `as const` + unii typów.

// 14 obsługiwanych języków UI bota. 'pl' = język źródłowy (baza, najpełniejszy słownik).
export const LOCALES = [
  'pl',
  'en',
  'de',
  'es',
  'it',
  'fr',
  'pt',
  'zh',
  'ko',
  'ru',
  'uk',
  'ja',
  'ar',
  'id',
] as const;
export type Locale = (typeof LOCALES)[number];

export const BASE_LOCALE: Locale = 'pl'; // źródło — ostateczny fallback dla brakujących kluczy
export const DEFAULT_LOCALE: Locale = 'en'; // gdy locale użytkownika nieobsługiwane (default międzynarodowy)

const LOCALE_SET = new Set<string>(LOCALES);
export function isLocale(v: string | null | undefined): v is Locale {
  return v != null && LOCALE_SET.has(v);
}

// Języki pisane od prawej do lewej (RTL) — istotne dla panelu/web (dir="rtl").
export const RTL_LOCALES = new Set<Locale>(['ar']);
export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.has(locale);
}

// Nazwa języka w jego własnym języku (do przełącznika w panelu) + flaga.
export const LOCALE_LABELS: Record<Locale, string> = {
  pl: '🇵🇱 Polski',
  en: '🇬🇧 English',
  de: '🇩🇪 Deutsch',
  es: '🇪🇸 Español',
  it: '🇮🇹 Italiano',
  fr: '🇫🇷 Français',
  pt: '🇵🇹 Português',
  zh: '🇨🇳 中文',
  ko: '🇰🇷 한국어',
  ru: '🇷🇺 Русский',
  uk: '🇺🇦 Українська',
  ja: '🇯🇵 日本語',
  ar: '🇸🇦 العربية',
  id: '🇮🇩 Bahasa Indonesia',
};

// ─── Mapowanie locale Discorda (interaction.locale) → nasz Locale ───
// Discord zwraca kody typu 'pl', 'en-US', 'pt-BR', 'zh-CN'. Sprowadzamy do naszych 14.
export const DISCORD_TO_LOCALE: Record<string, Locale> = {
  pl: 'pl',
  'en-US': 'en',
  'en-GB': 'en',
  de: 'de',
  'es-ES': 'es',
  'es-419': 'es',
  it: 'it',
  fr: 'fr',
  'pt-BR': 'pt',
  'zh-CN': 'zh',
  'zh-TW': 'zh',
  ko: 'ko',
  ru: 'ru',
  uk: 'uk',
  ja: 'ja',
  id: 'id',
};
export function fromDiscordLocale(dl: string | null | undefined): Locale | null {
  if (!dl) return null;
  return DISCORD_TO_LOCALE[dl] ?? null;
}

// ─── Mapowanie odwrotne: nasz Locale → kody locale Discorda (dla localizations komend) ───
// UWAGA: Discord NIE wspiera arabskiego jako locale interfejsu — 'ar' = [] (pomijane).
// Jeden nasz język może mapować na kilka kodów Discorda (np. en → en-US + en-GB).
export const LOCALE_TO_DISCORD: Record<Locale, string[]> = {
  pl: ['pl'],
  en: ['en-US', 'en-GB'],
  de: ['de'],
  es: ['es-ES', 'es-419'],
  it: ['it'],
  fr: ['fr'],
  pt: ['pt-BR'],
  zh: ['zh-CN', 'zh-TW'],
  ko: ['ko'],
  ru: ['ru'],
  uk: ['uk'],
  ja: ['ja'],
  ar: [],
  id: ['id'],
};
