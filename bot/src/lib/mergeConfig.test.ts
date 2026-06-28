// Rygiel mergeConfig — scalanie configu z JSON-a. KLUCZ: pusty/zły JSON → KOPIA defaultów (nie rzuca,
// nie mutuje), zapisane pola nadpisują defaulty (Partial). Zastępuje powtarzany wzorzec w 8 modułach.
import { describe, expect, it } from 'vitest';
import { mergeConfig } from './mergeConfig.mts';

describe('mergeConfig', () => {
  it('pusty / null / undefined → kopia defaultów (nowy obiekt, nie referencja)', () => {
    const d = { a: 1, b: 'x', on: false };
    expect(mergeConfig(null, d)).toEqual(d);
    expect(mergeConfig('', d)).toEqual(d);
    expect(mergeConfig(undefined, d)).toEqual(d);
    expect(mergeConfig(null, d)).not.toBe(d); // kopia
  });

  it('scala zapisane pola na defaulty (Partial override)', () => {
    expect(mergeConfig('{"b":9}', { a: 1, b: 2 })).toEqual({ a: 1, b: 9 });
    expect(mergeConfig('{"a":5,"b":6}', { a: 1, b: 2, c: 3 })).toEqual({ a: 5, b: 6, c: 3 });
  });

  it('niepoprawny JSON → defaulty (NIE rzuca)', () => {
    expect(mergeConfig('{nie-json', { a: 1 })).toEqual({ a: 1 });
    expect(mergeConfig('null', { a: 1 })).toEqual({ a: 1 }); // JSON.parse('null') = null → spread null = {}
  });

  it('NIE mutuje obiektu defaultów', () => {
    const d = { a: 1, b: 2 };
    mergeConfig('{"a":99}', d);
    expect(d).toEqual({ a: 1, b: 2 });
  });
});
