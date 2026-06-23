// Rygiel doboru języka etykiet karty rangi (cardLocale). KLUCZ: karty rysowane są czcionkami TYLKO
// łacińskimi (Poppins/Anton/…), więc języki o innym piśmie (CJK/cyrylica/arabski) MUSZĄ spaść na
// angielski — inaczej etykiety wyjdą jako „tofu" (□□□). Łacińskie przechodzą bez zmian; `undefined` → 'en'.
import { describe, expect, it } from 'vitest';
import { cardLocale } from './cards.mts';

// Pełny podział 14 języków na pismo (zgodny z CLAUDE.md). Latin renderujemy wprost, resztę po EN.
const LATIN = ['pl', 'en', 'de', 'es', 'it', 'fr', 'pt', 'id'] as const;
const NON_LATIN = ['zh', 'ko', 'ru', 'uk', 'ja', 'ar'] as const;

describe('cardLocale — Latin-safe język etykiet karty', () => {
  it('języki łacińskie przechodzą bez zmian', () => {
    for (const l of LATIN) expect(cardLocale(l)).toBe(l);
  });

  it('RYGIEL anty-tofu: języki o piśmie nie-łacińskim → en', () => {
    for (const l of NON_LATIN) expect(cardLocale(l)).toBe('en');
  });

  it('undefined → en (bezpieczny fallback)', () => {
    expect(cardLocale(undefined)).toBe('en');
  });
});
