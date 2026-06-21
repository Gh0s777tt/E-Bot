// Rygiel PARZYSTOŚCI treści „Jak to działa?" — 37 stron × 13 tłumaczeń (~256 KB, string-keyed, więc TS
// NIE pilnuje keysetu). pl = ŹRÓDŁO (HOW_IT_WORKS) i jest fallbackiem, dlatego celowo NIE ma go w
// HOW_CONTENT_I18N. Każde z 13 tłumaczeń MUSI pokryć komplet stron źródła (0 braków = żadna strona bez
// tłumaczenia w danym języku; 0 sierot = brak stron spoza źródła). Inaczej user zobaczy polski opis strony.
import { describe, expect, it } from 'vitest';
import { HOW_IT_WORKS } from './howItWorks';
import { HOW_CONTENT_I18N } from './howItWorksI18n';
import { PANEL_LOCALES } from './panelI18n';

const baseKeys = Object.keys(HOW_IT_WORKS); // strony źródła (pl)
const baseSet = new Set(baseKeys);
const translated = PANEL_LOCALES.filter((l) => l !== 'pl');

describe('Parytet „Jak to działa?" — 13 tłumaczeń vs źródło pl (HOW_IT_WORKS)', () => {
  it('źródło ma komplet stron (sanity)', () => {
    expect(baseKeys.length).toBeGreaterThan(30);
  });

  it('pl celowo NIE jest w HOW_CONTENT_I18N (jest źródłem/fallbackiem)', () => {
    expect(HOW_CONTENT_I18N.pl).toBeUndefined();
  });

  for (const loc of translated) {
    it(`${loc}: komplet stron źródła (0 braków, 0 sierot)`, () => {
      const dict = HOW_CONTENT_I18N[loc];
      expect(dict, `brak treści dla ${loc}`).toBeDefined();
      const keys = new Set(Object.keys(dict ?? {}));
      const missing = baseKeys.filter((k) => !keys.has(k));
      const extra = [...keys].filter((k) => !baseSet.has(k));
      expect({ missing, extra }).toEqual({ missing: [], extra: [] });
    });
  }
});
