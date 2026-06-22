// Rygiel /ship — deterministyczny % dopasowania (hash posortowanych ID) + pasek postępu.
// KLUCZOWY niezmiennik: SYMETRIA — shipPct(a,b) === shipPct(b,a) (gwarantowana przez `.sort()`).
// Regresja bez sortu = ta sama para dostaje różny % zależnie od kolejności argumentów (widoczny bug).
// Zakres [0,100] jest kontraktem dla `bar` (filled = round(pct/10) ∈ [0,10]) — pct>100 → bar rzuca.
import { describe, expect, it } from 'vitest';
import { bar, shipPct } from './ship.mts';

// Garść realistycznych snowflake'ów Discorda + skrajne (równe, jednoznakowe).
const IDS = [
  '111111111111111111',
  '222222222222222222',
  '349876501234567890',
  '987654321098765432',
  '100000000000000001',
  '7',
];

describe('shipPct — deterministyczny % dopasowania', () => {
  it('deterministyczny: ta sama para → ten sam wynik', () => {
    expect(shipPct('111', '222')).toBe(shipPct('111', '222'));
  });

  it('RYGIEL symetrii: shipPct(a,b) === shipPct(b,a) dla każdej pary (sort ID)', () => {
    for (const a of IDS)
      for (const b of IDS)
        expect(shipPct(a, b), `para ${a} ↔ ${b} musi być symetryczna`).toBe(shipPct(b, a));
  });

  it('RYGIEL zakresu: wynik to liczba całkowita w [0,100] (kontrakt dla bar + progów)', () => {
    for (const a of IDS)
      for (const b of IDS) {
        const p = shipPct(a, b);
        expect(Number.isInteger(p)).toBe(true);
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(100);
      }
  });

  it('te same ID (osoba sama ze sobą) → poprawny % w zakresie', () => {
    const p = shipPct('349876501234567890', '349876501234567890');
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThanOrEqual(100);
  });
});

describe('bar — pasek postępu 10 segmentów', () => {
  it('zawsze dokładnie 10 segmentów dla pct ∈ [0,100]', () => {
    for (let pct = 0; pct <= 100; pct++) {
      const b = bar(pct);
      expect([...b].length, `bar(${pct}) musi mieć 10 znaków`).toBe(10);
    }
  });

  it('granice: 0 → same puste, 100 → same pełne', () => {
    expect(bar(0)).toBe('▱▱▱▱▱▱▱▱▱▱');
    expect(bar(100)).toBe('▰▰▰▰▰▰▰▰▰▰');
  });

  it('liczba wypełnionych = round(pct/10) (5 → 1, 94 → 9, 95 → 10)', () => {
    const filled = (s: string) => [...s].filter((c) => c === '▰').length;
    expect(filled(bar(5))).toBe(1); // round(0.5)=1 (half-up)
    expect(filled(bar(94))).toBe(9);
    expect(filled(bar(95))).toBe(10); // round(9.5)=10
    expect(filled(bar(50))).toBe(5);
  });

  it('kompozycja shipPct→bar nigdy nie rzuca (filled w [0,10])', () => {
    for (const a of IDS) for (const b of IDS) expect(() => bar(shipPct(a, b))).not.toThrow();
  });
});
