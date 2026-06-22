// Rygiel /fun — selektor losowy (pick), rzut kostką (rollDie, wyjęty z handlera) i katalogi odpowiedzi.
// KLUCZ: rollDie ZAWSZE w [1, sides] (nigdy 0 ani sides+1 — inaczej „k6 = 0" albo „k6 = 7"). pick
// zawsze zwraca element tablicy (nigdy undefined → pusty embed). Katalogi niepuste, by /fun nie pokazał
// pustej odpowiedzi. Niezmienniki dla DOWOLNEGO Math.random → pętle wielu przebiegów.
import { describe, expect, it } from 'vitest';
import { DARES, EIGHTBALL, pick, rollDie, TRUTHS, WYR } from './fun.mts';

describe('pick — losowy element tablicy', () => {
  it('zawsze zwraca element tablicy (nigdy undefined)', () => {
    const arr = ['a', 'b', 'c'];
    for (let i = 0; i < 300; i++) expect(arr).toContain(pick(arr));
  });

  it('jednoelementowa tablica → zawsze ten element', () => {
    for (let i = 0; i < 20; i++) expect(pick(['x'])).toBe('x');
  });

  it('pokrywa wszystkie elementy (coupon-collector, 300 losowań z 3)', () => {
    const seen = new Set(Array.from({ length: 300 }, () => pick(['a', 'b', 'c'])));
    expect(seen.size).toBe(3);
  });
});

describe('rollDie — rzut kością k-ściankową', () => {
  it('RYGIEL zakresu: wynik ∈ [1, sides] dla wielu ścianek (sweep 300 rzutów)', () => {
    for (const sides of [2, 6, 20, 100]) {
      for (let i = 0; i < 300; i++) {
        const r = rollDie(sides);
        expect(r).toBeGreaterThanOrEqual(1); // nigdy 0
        expect(r).toBeLessThanOrEqual(sides); // nigdy sides+1
        expect(Number.isInteger(r)).toBe(true);
      }
    }
  });

  it('k6: oba skrajne wyniki (1 i 6) osiągalne', () => {
    const seen = new Set(Array.from({ length: 500 }, () => rollDie(6)));
    expect(seen.has(1)).toBe(true);
    expect(seen.has(6)).toBe(true);
    expect([...seen].every((v) => v >= 1 && v <= 6)).toBe(true);
  });
});

describe('katalogi /fun — niepuste (brak pustej odpowiedzi)', () => {
  it('TRUTHS / DARES / WYR / EIGHTBALL mają wpisy, każdy niepusty', () => {
    for (const cat of [TRUTHS, DARES, WYR, EIGHTBALL]) {
      expect(cat.length).toBeGreaterThan(0);
      for (const line of cat) expect(line.trim().length).toBeGreaterThan(0);
    }
  });
});
