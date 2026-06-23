// Rygiel batchowania zapytań IGDB (chunk) — IGDB ma limit ~500 id/zapytanie, więc kolektor dzieli
// listę appidów na paczki. KLUCZ: każdy element trafia do DOKŁADNIE jednej paczki (konkatenacja paczek
// === wejście) — bez gubienia/duplikatów, inaczej znikają lub dublują się gry w bibliotece. Paczki
// rozmiaru ≤ n, ostatnia bywa mniejsza, kolejność zachowana. (Kontrakt dla n ≥ 1.)
import { describe, expect, it } from 'vitest';
import { chunk } from './igdb.mts';

describe('chunk — batchowanie listy na paczki ≤ n', () => {
  it('dzieli na paczki rozmiaru n, ostatnia mniejsza', () => {
    expect(chunk([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
  });

  it('RYGIEL bez gubienia/duplikatów: konkatenacja paczek === wejście', () => {
    for (const len of [0, 1, 9, 10, 11, 100]) {
      const arr = Array.from({ length: len }, (_, i) => i);
      for (const n of [1, 3, 10, 500]) {
        const parts = chunk(arr, n);
        expect(parts.flat()).toEqual(arr); // nic nie zginęło ani się nie zdublowało
        expect(parts.every((p) => p.length <= n)).toBe(true); // żadna paczka > n
      }
    }
  });

  it('pusta tablica → []', () => {
    expect(chunk([], 5)).toEqual([]);
  });

  it('n ≥ długość → jedna paczka z całością', () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
    expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
  });
});
