// Rygiel parserów env configu ekonomii (int · bool) — wartości startowe nagród z GHOST_* env.
// KLUCZ: int przez Number.isFinite (env „0" jest POPRAWNE, nie spada na default — nagroda 0 to
// świadomy wybór); bool STRICT — tylko „true"/„1" → true, każda inna obecna wartość („false"/„yes"/
// „0"/„") → false. Brak zmiennej → default. Env sterowany z przywróceniem.
import { afterEach, describe, expect, it } from 'vitest';
import { bool, int } from './config.mts';

const KEYS = ['T_INT', 'T_BOOL'] as const;
afterEach(() => {
  for (const k of KEYS) delete process.env[k];
});

describe('int — parser liczby z env', () => {
  it('poprawna liczba → ona; brak → default', () => {
    process.env.T_INT = '7';
    expect(int('T_INT', 99)).toBe(7);
    delete process.env.T_INT;
    expect(int('T_INT', 99)).toBe(99);
  });

  it('RYGIEL: „0" jest poprawne (nie spada na default)', () => {
    process.env.T_INT = '0';
    expect(int('T_INT', 5)).toBe(0);
  });

  it('NaN / pusty → default; ujemne i wiodące cyfry parsowane', () => {
    process.env.T_INT = 'abc';
    expect(int('T_INT', 5)).toBe(5);
    process.env.T_INT = '';
    expect(int('T_INT', 5)).toBe(5);
    process.env.T_INT = '-3';
    expect(int('T_INT', 5)).toBe(-3);
    process.env.T_INT = '12px';
    expect(int('T_INT', 5)).toBe(12); // parseInt parsuje wiodące cyfry
  });
});

describe('bool — parser flagi z env (strict)', () => {
  it('brak zmiennej → default (oba kierunki)', () => {
    expect(bool('T_BOOL', true)).toBe(true);
    expect(bool('T_BOOL', false)).toBe(false);
  });

  it('„true" / „1" → true', () => {
    process.env.T_BOOL = 'true';
    expect(bool('T_BOOL', false)).toBe(true);
    process.env.T_BOOL = '1';
    expect(bool('T_BOOL', false)).toBe(true);
  });

  it('RYGIEL strict: „false" / „0" / „yes" / „" → false (tylko true/1 włącza)', () => {
    for (const v of ['false', '0', 'yes', '']) {
      process.env.T_BOOL = v;
      expect(bool('T_BOOL', true), `wartość „${v}" nie powinna włączać`).toBe(false);
    }
  });
});
