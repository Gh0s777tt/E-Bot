// Rygiel presetów koloru akcentu (THEME_PRESETS). Pola rgb/hover/dark zasilają CSS
// `rgb(var(--accent-rgb) / alpha)` — format MUSI być "R G B" (spacje, kanały 0–255). Przecinek
// zamiast spacji albo wartość >255 = cicho zepsuty akcent CAŁEGO panelu. Ten kontrakt rygluje test.
import { describe, expect, it } from 'vitest';
import { THEME_PRESETS } from './themes';

// "R G B" — dokładnie 3 liczby, spacje, każdy kanał 0–255 (bez wiodących zer/znaków).
const isRgbTriple = (s: string): boolean => {
  const parts = s.split(' ');
  if (parts.length !== 3) return false;
  return parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) >= 0 && Number(p) <= 255);
};

describe('THEME_PRESETS — integralność katalogu motywów', () => {
  it('niepusta lista, unikalne id', () => {
    expect(THEME_PRESETS.length).toBeGreaterThan(0);
    expect(new Set(THEME_PRESETS.map((t) => t.id)).size).toBe(THEME_PRESETS.length);
  });

  it('każdy preset ma niepuste id i nazwę', () => {
    for (const t of THEME_PRESETS) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
    }
  });

  it('RYGIEL kontraktu CSS: rgb/hover/dark = poprawny triplet "R G B" (spacje, 0–255)', () => {
    for (const t of THEME_PRESETS) {
      expect(isRgbTriple(t.rgb), `${t.id}.rgb="${t.rgb}"`).toBe(true);
      expect(isRgbTriple(t.hover), `${t.id}.hover="${t.hover}"`).toBe(true);
      expect(isRgbTriple(t.dark), `${t.id}.dark="${t.dark}"`).toBe(true);
    }
  });
});

describe('isRgbTriple — sanity helpera (samokontrola asercji)', () => {
  it('akceptuje poprawne, odrzuca przecinki / poza zakresem / niekompletne', () => {
    expect(isRgbTriple('229 9 20')).toBe(true);
    expect(isRgbTriple('0 0 0')).toBe(true);
    expect(isRgbTriple('255 255 255')).toBe(true);
    expect(isRgbTriple('229,9,20')).toBe(false); // przecinki (zła składnia CSS)
    expect(isRgbTriple('300 9 20')).toBe(false); // kanał >255
    expect(isRgbTriple('229 9')).toBe(false); // brak kanału
    expect(isRgbTriple('229 9 20 5')).toBe(false); // nadmiar
  });
});
