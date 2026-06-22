// Rygiel listy języków bota w panelu (botLocales) — `normalizeBotLocale` + SPÓJNOŚĆ cross-package.
// botLocales.ts to świadomy MIRROR bot/src/i18n/locales.mts (dashboard to osobny pakiet, nie importuje
// z bot/). Niezmiennik: oferta panelu == 14 języków bota + 'auto'. Rozjazd ⇒ panel proponuje język,
// którego bot nie obsługuje, albo gubi nowo dodany → user wybiera locale i bot go ignoruje.
// Bot czytamy jako TEKST (jak migrated-keys-consistency) — dashboard tsc nie importuje `.mts` z bot/.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BOT_LOCALE_OPTIONS, BOT_LOCALE_VALUES, normalizeBotLocale } from './botLocales';

// Wyciąga tablicę LOCALES z bot/src/i18n/locales.mts bez importu (sidestep rozdzielności pakietów).
function botLocales(): Set<string> {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'bot', 'src', 'i18n', 'locales.mts'),
    'utf8',
  );
  const block = /export const LOCALES\s*=\s*\[([\s\S]*?)\]\s*as const/.exec(src);
  if (!block) throw new Error('Nie znaleziono LOCALES w locales.mts');
  return new Set([...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]));
}

describe('normalizeBotLocale — walidacja z fallbackiem na auto', () => {
  it('znana wartość przechodzi (język + auto)', () => {
    expect(normalizeBotLocale('pl')).toBe('pl');
    expect(normalizeBotLocale('ar')).toBe('ar');
    expect(normalizeBotLocale('auto')).toBe('auto');
  });

  it('nieznana / null / undefined / pusta → "auto" (bezpieczny default)', () => {
    expect(normalizeBotLocale('xx')).toBe('auto');
    expect(normalizeBotLocale('en-US')).toBe('auto'); // surowy kod Discorda to NIE wartość panelu
    expect(normalizeBotLocale('')).toBe('auto');
    expect(normalizeBotLocale(null)).toBe('auto');
    expect(normalizeBotLocale(undefined)).toBe('auto');
  });
});

describe('SPÓJNOŚĆ cross-package: oferta panelu ↔ języki bota', () => {
  it('opcje panelu (bez auto) = dokładnie języki bota (LOCALES)', () => {
    const panelLangs = new Set(BOT_LOCALE_VALUES.filter((v) => v !== 'auto'));
    const bot = botLocales();
    expect(bot.size).toBe(14); // sanity: bot ma 14 języków
    expect(panelLangs).toEqual(bot);
  });

  it('"auto" jest w opcjach (bot podąża za klientem Discord)', () => {
    expect(BOT_LOCALE_VALUES).toContain('auto');
  });
});

describe('BOT_LOCALE_OPTIONS — integralność', () => {
  it('unikalne wartości, każda opcja z niepustą etykietą', () => {
    expect(new Set(BOT_LOCALE_VALUES).size).toBe(BOT_LOCALE_OPTIONS.length);
    for (const o of BOT_LOCALE_OPTIONS) expect(o.label).toBeTruthy();
  });
});
