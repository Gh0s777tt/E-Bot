// Rygiel paska postępu questów (bar) — 10-segmentowy pasek w widoku /quests. KLUCZ: KLAMRA
// `Math.min(1, p/t)` (postęp ≥ cel → pełny, nigdy >10 segmentów ani `repeat(ujemne)` = RangeError →
// crash widoku) + STRAŻNIK `t > 0` (cel 0 → pusty, bez `p/0`=Infinity → NaN segmentów). Zawsze 10 znaków.
import { describe, expect, it } from 'vitest';
import { bar } from './quests.mts';

describe('bar — pasek postępu questa (10 segmentów)', () => {
  it('proporcja: połowa celu → 5 wypełnionych', () => {
    expect(bar(5, 10)).toBe('▰▰▰▰▰▱▱▱▱▱');
  });

  it('zero postępu → pusty; pełny postęp → pełny', () => {
    expect(bar(0, 10)).toBe('▱▱▱▱▱▱▱▱▱▱');
    expect(bar(10, 10)).toBe('▰▰▰▰▰▰▰▰▰▰');
  });

  it('RYGIEL klamry: postęp powyżej celu → pełny (bez przepełnienia / RangeError)', () => {
    expect(bar(20, 10)).toBe('▰▰▰▰▰▰▰▰▰▰');
  });

  it('RYGIEL strażnika dzielenia: cel 0 → pusty (bez Infinity/NaN)', () => {
    expect(bar(5, 0)).toBe('▱▱▱▱▱▱▱▱▱▱');
    expect(bar(0, 0)).toBe('▱▱▱▱▱▱▱▱▱▱');
  });

  it('zaokrąglenie: 55/100 → round(5.5) = 6 wypełnionych', () => {
    expect(bar(55, 100)).toBe('▰▰▰▰▰▰▱▱▱▱');
  });

  it('zawsze dokładnie 10 segmentów', () => {
    for (const [p, t] of [
      [0, 10],
      [3, 7],
      [99, 100],
      [1000, 10],
      [5, 0],
    ]) {
      expect([...bar(p, t)]).toHaveLength(10);
    }
  });
});
