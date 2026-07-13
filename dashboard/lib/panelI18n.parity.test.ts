// Rygiel PARZYSTOŚCI i18n panelu — największy słownik projektu (UI: 1430 kluczy × 14 języków + MODES).
// Każdy język MUSI mieć identyczny keyset jak baza (pl) — 0 braków, 0 kluczy-sierot. Inaczej user danego
// języka zobaczy fallback (zła flaga w panelu) albo martwy klucz. Dotąd pilnował tego tylko ręczny audyt
// (parzystość była pełna — ten test ją zamraża przed regresją). NAV/GROUPS celowo Partial → poza zakresem.
import { describe, expect, it } from 'vitest';
import { DEFAULT_PANEL_LOCALE, MODES, PANEL_LOCALES, UI_PL } from './panelI18n';
import { UI_DATA } from './panelI18nData';

type Dict = Record<string, string>;

// UI rozbite (audyt B-1): pl inline + reszta w panelI18nData; do parytetu składamy pełny obraz.
const UI = { pl: UI_PL, ...UI_DATA } as Record<string, Dict>;

function parityOf(name: string, dict: Record<string, Dict>) {
  const baseKeys = Object.keys(dict[DEFAULT_PANEL_LOCALE]);
  const baseSet = new Set(baseKeys);

  describe(`Parytet i18n panelu — ${name} (baza: ${DEFAULT_PANEL_LOCALE})`, () => {
    it(`${name}: baza ma klucze (sanity)`, () => {
      expect(baseKeys.length).toBeGreaterThan(0);
    });

    for (const loc of PANEL_LOCALES) {
      it(`${name} ${loc}: identyczny keyset jak baza (0 braków, 0 sierot)`, () => {
        const keys = new Set(Object.keys(dict[loc]));
        const missing = baseKeys.filter((k) => !keys.has(k));
        const extra = [...keys].filter((k) => !baseSet.has(k));
        expect({ missing, extra }).toEqual({ missing: [], extra: [] });
      });
    }
  });
}

parityOf('UI', UI);
parityOf('MODES', MODES);
