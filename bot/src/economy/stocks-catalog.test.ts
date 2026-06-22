// Rygiel katalogu giełdy (findStock · STOCKS · pasmo amplitud) — uzupełnia economy-math.test.ts,
// który zaryglował priceAt/changePct tylko dla GHOST. Krytyczny kontrakt: `findStock` UPPERCASE'uje
// wejście (`sym.trim().toUpperCase()`), więc symbol w katalogu MUSI być wielką literą — inaczej
// spółka jest NIEznajdowalna (kup/sprzedaj nie działa). Dodatkowo: cena każdej spółki trzyma się
// deterministycznego pasma `base × [max(0.15, 1−0.38·vol), 1+0.38·vol]` przez cały sweep czasu.
import { describe, expect, it } from 'vitest';
import { findStock, priceAt, STOCKS } from './stocks.mts';

const SUM_AMP = 0.05 + 0.1 + 0.14 + 0.09; // = 0.38 (suma amplitud harmonik WAVES)

describe('findStock — wyszukiwanie symbolu', () => {
  it('case-insensitive + trim', () => {
    expect(findStock('ghost')?.symbol).toBe('GHOST');
    expect(findStock('  Pepe  ')?.symbol).toBe('PEPE');
    expect(findStock('GEM')?.symbol).toBe('GEM');
  });
  it('nieznany symbol → undefined', () => {
    expect(findStock('TSLA')).toBeUndefined();
    expect(findStock('')).toBeUndefined();
  });
});

describe('STOCKS — integralność katalogu', () => {
  it('unikalne symbole, base i vol dodatnie', () => {
    expect(new Set(STOCKS.map((s) => s.symbol)).size).toBe(STOCKS.length);
    for (const s of STOCKS) {
      expect(s.base).toBeGreaterThan(0);
      expect(s.vol).toBeGreaterThan(0);
    }
  });

  it("RYGIEL: każdy symbol jest WIELKĄ literą (findStock uppercase'uje wejście)", () => {
    for (const s of STOCKS) {
      expect(s.symbol, `${s.symbol} musi być uppercase, inaczej findStock go nie znajdzie`).toBe(
        s.symbol.toUpperCase(),
      );
      // I faktycznie znajdowalny przez findStock (round-trip).
      expect(findStock(s.symbol)).toBe(s);
    }
  });
});

describe('priceAt — deterministyczne pasmo amplitud (per-spółka, cały sweep)', () => {
  it('cena każdej spółki ∈ base × [max(0.15, 1−0.38·vol), 1+0.38·vol], zawsze ≥ 1', () => {
    const T = 1_700_000_000_000;
    for (const s of STOCKS) {
      const lower = Math.max(1, Math.round(s.base * Math.max(0.15, 1 - SUM_AMP * s.vol)));
      const upper = Math.round(s.base * (1 + SUM_AMP * s.vol));
      for (let i = 0; i < 400; i++) {
        const p = priceAt(s, T + i * 211 * 60_000); // skok ~3,5 h, pokrywa wszystkie harmoniki
        expect(p, `${s.symbol}@${i}`).toBeGreaterThanOrEqual(lower);
        expect(p, `${s.symbol}@${i}`).toBeLessThanOrEqual(upper);
        expect(p).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('deterministyczne: ten sam (spółka, czas) → ta sama cena', () => {
    const t = 1_712_345_678_000;
    for (const s of STOCKS) expect(priceAt(s, t)).toBe(priceAt(s, t));
  });
});
