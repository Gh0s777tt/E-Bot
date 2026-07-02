// Rygiel PARZYSTOŚCI i18n landingu + stron publicznych (LANDING). landingI18n ma świadomy fallback→PL
// (języki dorzucane przyrostowo — patrz nagłówek pliku), ale realnie wszystkie 14 locale są kompletne.
// Ten test to ZAMRAŻA: żaden klucz nie może rozjechać się po cichu (user danego języka zobaczyłby PL
// zamiast tłumaczenia). Analogicznie do panelI18n.parity.test.ts. Kolejność bloków lokali w źródle bywa
// niekanoniczna — dlatego weryfikujemy KEYSET, nie kolejność.
import { describe, expect, it } from 'vitest';
import { LANDING } from './landingI18n';

const BASE = 'pl';
// 14 języków projektu (PL bazowo). RTL (ar) nie wpływa na keyset.
const LOCALES = ['pl', 'en', 'de', 'es', 'it', 'fr', 'pt', 'zh', 'ko', 'ru', 'uk', 'ja', 'ar', 'id'] as const;

describe('Parytet i18n landingu — LANDING (baza: pl, ×14)', () => {
  it('LANDING ma wszystkie 14 locale', () => {
    const present = Object.keys(LANDING);
    const missing = LOCALES.filter((l) => !present.includes(l));
    expect(missing).toEqual([]);
  });

  const baseKeys = Object.keys(LANDING[BASE]);
  const baseSet = new Set(baseKeys);

  it('baza (pl) ma klucze (sanity)', () => {
    expect(baseKeys.length).toBeGreaterThan(0);
  });

  for (const loc of LOCALES) {
    it(`${loc}: identyczny keyset jak baza (0 braków, 0 sierot)`, () => {
      const keys = new Set(Object.keys(LANDING[loc] ?? {}));
      const missing = baseKeys.filter((k) => !keys.has(k));
      const extra = [...keys].filter((k) => !baseSet.has(k));
      expect({ missing, extra }).toEqual({ missing: [], extra: [] });
    });
  }
});
