// Rygiel /trivia — integralność banku pytań (BANK) + losowanie (pick) + budowa rzędu (row).
// Każde pytanie musi mieć 4 odpowiedzi i poprawny indeks `c` ∈ [0,3] — inaczej pytanie jest
// NIEWYGRYWALNE (przycisk poprawnej odpowiedzi nie istnieje). Każda kategoria oferowana w komendzie
// MUSI mieć ≥1 pytanie, inaczej user wybiera „Nauka", a dostaje losowe pytanie z innej kategorii.
import { describe, expect, it } from 'vitest';
import { BANK, pick, row } from './trivia.mts';

// Lustro choices z SlashCommandBuilder (/trivia kategoria).
const CATEGORIES = ['ogolna', 'gaming', 'film', 'nauka', 'polska'];

describe('BANK — integralność banku pytań', () => {
  it('niepusty', () => {
    expect(BANK.length).toBeGreaterThan(0);
  });

  it('każde pytanie ma dokładnie 4 odpowiedzi', () => {
    for (const q of BANK) expect(q.a, q.q).toHaveLength(4);
  });

  it('RYGIEL: poprawny indeks c ∈ [0,3] (poza zakresem = pytanie niewygrywalne)', () => {
    for (const q of BANK) {
      expect(Number.isInteger(q.c)).toBe(true);
      expect(q.c, `pytanie "${q.q}" ma c=${q.c}`).toBeGreaterThanOrEqual(0);
      expect(q.c).toBeLessThanOrEqual(3);
    }
  });

  it('pytanie i każda odpowiedź niepuste', () => {
    for (const q of BANK) {
      expect(q.q.trim().length).toBeGreaterThan(0);
      for (const ans of q.a) expect(ans.trim().length).toBeGreaterThan(0);
    }
  });

  it('RYGIEL spójności kategorii: każda oferowana kategoria ma ≥1 pytanie', () => {
    for (const cat of CATEGORIES)
      expect(
        BANK.some((q) => q.cat === cat),
        `kategoria "${cat}" z choices nie ma żadnego pytania w BANK`,
      ).toBe(true);
  });
});

describe('pick — losowanie pytania', () => {
  it('pick(kategoria) zawsze zwraca pytanie tej kategorii (sweep 40× każda)', () => {
    for (const cat of CATEGORIES) for (let i = 0; i < 40; i++) expect(pick(cat).cat).toBe(cat);
  });

  it('pick(null) → pytanie z BANK', () => {
    expect(BANK).toContain(pick(null));
  });

  it('pick(nieznana kategoria) → fallback do BANK (poprawne pytanie, nie undefined)', () => {
    const q = pick('nie-istnieje');
    expect(BANK).toContain(q);
    expect(q.a).toHaveLength(4);
  });
});

describe('row — rząd 4 przycisków odpowiedzi', () => {
  it('zawsze 4 przyciski z customId triv:0..3', () => {
    const r = row(false).toJSON();
    expect(r.components).toHaveLength(4);
    r.components.forEach((c, i) => {
      expect((c as { custom_id?: string }).custom_id).toBe(`triv:${i}`);
    });
  });

  it('przycisk poprawnej odpowiedzi → styl Success (3), reszta Secondary (2)', () => {
    const r = row(true, 2).toJSON();
    const styles = r.components.map((c) => (c as { style?: number }).style);
    expect(styles).toEqual([2, 2, 3, 2]);
  });
});
