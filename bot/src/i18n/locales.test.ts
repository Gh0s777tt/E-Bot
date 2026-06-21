// Rygiel rejestru języków (i18n/locales) — fundament routingu języka. Błąd = user widzi zły język.
// Najważniejszy niezmiennik: DWUKIERUNKOWA spójność map locale Discorda. `LOCALE_TO_DISCORD` (kody do
// rejestracji localizations komend) i `DISCORD_TO_LOCALE` (interaction.locale → nasz Locale) to dwie
// niezależnie utrzymywane mapy — jeśli się rozjadą, komenda zarejestrowana pod kodem X rozwiąże się
// na inny język niż zamierzony. Wyjątek udokumentowany: `ar` = [] (Discord nie wspiera arabskiego UI).
import { describe, expect, it } from 'vitest';
import {
  DISCORD_TO_LOCALE,
  fromDiscordLocale,
  isLocale,
  isRtl,
  LOCALE_LABELS,
  LOCALE_TO_DISCORD,
  LOCALES,
  type Locale,
} from './locales.mts';

describe('isLocale — walidacja przynależności', () => {
  it('akceptuje wszystkie 14 obsługiwanych', () => {
    for (const l of LOCALES) expect(isLocale(l)).toBe(true);
  });
  it('odrzuca nieobsługiwane / null / undefined / puste', () => {
    expect(isLocale('xx')).toBe(false);
    expect(isLocale('en-US')).toBe(false); // surowy kod Discorda to NIE nasz Locale
    expect(isLocale('')).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe('isRtl — tylko arabski jest RTL', () => {
  it('ar → true, każdy inny z 14 → false', () => {
    expect(isRtl('ar')).toBe(true);
    for (const l of LOCALES) {
      if (l !== 'ar') expect(isRtl(l)).toBe(false);
    }
  });
  it('dokładnie 1 język RTL w całym rejestrze', () => {
    expect(LOCALES.filter((l) => isRtl(l))).toEqual(['ar']);
  });
});

describe('fromDiscordLocale — kod Discorda → nasz Locale', () => {
  it('warianty regionalne sprowadzone do bazowego języka', () => {
    expect(fromDiscordLocale('pl')).toBe('pl');
    expect(fromDiscordLocale('en-US')).toBe('en');
    expect(fromDiscordLocale('en-GB')).toBe('en');
    expect(fromDiscordLocale('pt-BR')).toBe('pt');
    expect(fromDiscordLocale('zh-CN')).toBe('zh');
    expect(fromDiscordLocale('zh-TW')).toBe('zh');
    expect(fromDiscordLocale('es-ES')).toBe('es');
    expect(fromDiscordLocale('es-419')).toBe('es');
  });
  it('nieznany / pusty / null / undefined → null', () => {
    expect(fromDiscordLocale('xx-YY')).toBeNull();
    expect(fromDiscordLocale('')).toBeNull();
    expect(fromDiscordLocale(null)).toBeNull();
    expect(fromDiscordLocale(undefined)).toBeNull();
  });
});

describe('RYGIEL spójności map Discord ↔ Locale (dwukierunkowa, anti-drift)', () => {
  it('LOCALE_TO_DISCORD → DISCORD_TO_LOCALE: każdy kod mapuje z powrotem na swój język', () => {
    for (const loc of LOCALES) {
      for (const dc of LOCALE_TO_DISCORD[loc]) {
        expect(fromDiscordLocale(dc), `kod ${dc} (z LOCALE_TO_DISCORD[${loc}])`).toBe(loc);
      }
    }
  });

  it('DISCORD_TO_LOCALE → LOCALE_TO_DISCORD: każdy kod istnieje w mapie odwrotnej', () => {
    for (const [dc, loc] of Object.entries(DISCORD_TO_LOCALE)) {
      expect(
        LOCALE_TO_DISCORD[loc],
        `kod ${dc}→${loc} musi być w LOCALE_TO_DISCORD[${loc}]`,
      ).toContain(dc);
    }
  });

  it('każda wartość DISCORD_TO_LOCALE jest poprawnym Locale', () => {
    for (const loc of Object.values(DISCORD_TO_LOCALE)) expect(isLocale(loc)).toBe(true);
  });

  it('udokumentowany wyjątek: ar = [] (Discord bez arabskiego UI), reszta ma ≥1 kod', () => {
    expect(LOCALE_TO_DISCORD.ar).toEqual([]);
    for (const loc of LOCALES) {
      if (loc !== 'ar') expect(LOCALE_TO_DISCORD[loc].length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('kompletność rejestru — każdy z 14 języków obsłużony', () => {
  it('LOCALE_LABELS + LOCALE_TO_DISCORD pokrywają komplet LOCALES (0 sierot)', () => {
    for (const loc of LOCALES) {
      expect(LOCALE_LABELS[loc as Locale]).toBeTruthy(); // niepusta etykieta
      expect(LOCALE_TO_DISCORD[loc]).toBeDefined();
    }
    expect(Object.keys(LOCALE_LABELS).sort()).toEqual([...LOCALES].sort());
  });
});
