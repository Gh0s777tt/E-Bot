// Lista języków bota dla panelu (mirror bot/src/i18n/locales.mts — dashboard to osobny pakiet,
// nie importujemy z bot/). CZYSTY moduł (bez importów serwerowych) → bezpieczny w komponentach
// klienckich. 'auto' = bot podąża za locale klienta Discord użytkownika.
export const BOT_LOCALE_OPTIONS = [
  { value: 'auto', label: '🌐 Auto — język klienta Discord użytkownika' },
  { value: 'pl', label: '🇵🇱 Polski' },
  { value: 'en', label: '🇬🇧 English' },
  { value: 'de', label: '🇩🇪 Deutsch' },
  { value: 'es', label: '🇪🇸 Español' },
  { value: 'it', label: '🇮🇹 Italiano' },
  { value: 'fr', label: '🇫🇷 Français' },
  { value: 'pt', label: '🇵🇹 Português' },
  { value: 'zh', label: '🇨🇳 中文' },
  { value: 'ko', label: '🇰🇷 한국어' },
  { value: 'ru', label: '🇷🇺 Русский' },
  { value: 'uk', label: '🇺🇦 Українська' },
  { value: 'ja', label: '🇯🇵 日本語' },
  { value: 'ar', label: '🇸🇦 العربية' },
  { value: 'id', label: '🇮🇩 Bahasa Indonesia' },
] as const;

export type BotLocale = (typeof BOT_LOCALE_OPTIONS)[number]['value'];

export const BOT_LOCALE_VALUES: readonly string[] = BOT_LOCALE_OPTIONS.map((o) => o.value);

export function normalizeBotLocale(v: string | null | undefined): BotLocale {
  return v && BOT_LOCALE_VALUES.includes(v) ? (v as BotLocale) : 'auto';
}
