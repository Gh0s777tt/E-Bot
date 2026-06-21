// Rygiel PARZYSTOŚCI i18n bota — każdy klucz bazy (pl) musi istnieć we wszystkich 14 językach, inaczej
// user danego języka zobaczy fallbackowy pl/en (zła flaga). Wyjątek UDOKUMENTOWANY (strings.profile.mts):
// klucze card.* (etykiety rysowane na obrazku rank-karty) są celowo TYLKO dla języków łacińskich — czcionka
// karty nie ma glifów CJK/cyrylicy/arabskiego, renderer wymusza 'en'. Test to respektuje, ale dalej pilnuje:
// komplet pozostałych kluczy w 14 jęz., komplet card.* w 8 językach łacińskich, brak kluczy-sierot.
import { describe, expect, it } from 'vitest';
import { BASE_LOCALE, LOCALES } from './locales.mts';
import { DICTS } from './strings.mts';

const LATIN = new Set<string>(['pl', 'en', 'de', 'es', 'it', 'fr', 'pt', 'id']);
const isCardKey = (k: string) => k.startsWith('card.');
const baseKeys = Object.keys(DICTS[BASE_LOCALE]);
const baseSet = new Set(baseKeys);

describe('Parytet i18n bota — 14 języków vs baza (pl)', () => {
  it('baza (pl) ma sensowną liczbę kluczy (sanity)', () => {
    expect(baseKeys.length).toBeGreaterThan(400);
  });

  for (const loc of LOCALES) {
    it(`${loc}: brak braków vs baza (card.* dozwolone do pominięcia tylko w nie-łacińskich)`, () => {
      const has = new Set(Object.keys(DICTS[loc]));
      const missing = baseKeys.filter((k) => !has.has(k));
      const blocking = missing.filter((k) => !(isCardKey(k) && !LATIN.has(loc)));
      expect(blocking).toEqual([]);
    });

    it(`${loc}: brak kluczy-sierot (nieobecnych w bazie)`, () => {
      const extra = Object.keys(DICTS[loc]).filter((k) => !baseSet.has(k));
      expect(extra).toEqual([]);
    });
  }

  it('języki łacińskie mają KOMPLET kluczy card.* (renderowane etykiety)', () => {
    const cardKeys = baseKeys.filter(isCardKey);
    expect(cardKeys.length).toBeGreaterThan(0);
    for (const loc of LATIN) {
      const has = new Set(Object.keys(DICTS[loc]));
      expect(cardKeys.filter((k) => !has.has(k))).toEqual([]);
    }
  });
});
