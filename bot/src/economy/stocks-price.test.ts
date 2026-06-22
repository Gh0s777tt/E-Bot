// Rygiel silnika cen giełdy (priceAt · changePct) — cena liczona DETERMINISTYCZNIE z czasu (suma
// sinusoid). KLUCZ: ta sama spółka + ta sama chwila → IDENTYCZNA cena (inaczej cena kupna ≠ cena
// sprzedaży w tym samym momencie = arbitraż/strata gracza), cena ZAWSZE ≥ 1 i całkowita (klamry
// `max(0.15, mult)` i `max(1, …)` chronią przed ceną ≤ 0 → dzielenie przez zero w changePct, ujemny
// koszt). `nowMs` wstrzykiwany — test deterministyczny bez fałszowania zegara.
import { describe, expect, it } from 'vitest';
import { changePct, priceAt, STOCKS, type Stock } from './stocks.mts';

const SAMPLES = Array.from({ length: 400 }, (_, i) => i * 90 * 60_000); // co 1,5 h przez ~25 dni

describe('priceAt — deterministyczny silnik cen', () => {
  it('RYGIEL determinizmu: ta sama spółka + ta sama chwila → identyczna cena', () => {
    const t = 1_700_000_000_000;
    for (const s of STOCKS) {
      expect(priceAt(s, t)).toBe(priceAt(s, t));
    }
  });

  it('cena zawsze ≥ 1 i całkowita (wszystkie spółki × wiele chwil)', () => {
    for (const s of STOCKS) {
      for (const t of SAMPLES) {
        const p = priceAt(s, t);
        expect(p).toBeGreaterThanOrEqual(1);
        expect(Number.isInteger(p)).toBe(true);
      }
    }
  });

  it('RYGIEL klamry mnożnika (max 0.15): cena nie spada poniżej base·0.15 mimo skrajnej zmienności', () => {
    // vol 100 → surowy mnożnik bywa głęboko ujemny; klamra 0.15 trzyma podłogę na round(base·0.15).
    // Wysokie `base` (1000) odróżnia tę klamrę od zewnętrznej `max(1, …)`, która maskowałaby tylko ≥1.
    const wild: Stock = { symbol: 'WILD', name: 'Wild', emoji: '🌪️', base: 1000, vol: 100 };
    const floor = Math.round(1000 * 0.15); // 150
    for (const t of SAMPLES) {
      expect(priceAt(wild, t)).toBeGreaterThanOrEqual(floor);
    }
  });

  it('RYGIEL dolnej klamry (max 1): maleńka, skrajnie zmienna spółka nie spada poniżej 1', () => {
    // base 2 × klamra 0.15 = round(0.3) = 0 → bez `max(1, …)` cena byłaby 0
    const tiny: Stock = { symbol: 'TINY', name: 'Tiny', emoji: '🐜', base: 2, vol: 100 };
    for (const t of SAMPLES) {
      expect(priceAt(tiny, t)).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('changePct — zmiana procentowa względem przeszłości', () => {
  it('RYGIEL: hoursAgo=0 → 0% (cena „teraz" == cena „wtedy")', () => {
    const t = 1_700_000_000_000;
    for (const s of STOCKS) {
      expect(changePct(s, 0, t)).toBe(0);
    }
  });

  it('deterministyczny i skończony', () => {
    const t = 1_700_000_000_000;
    const a = changePct(STOCKS[0], 24, t);
    expect(a).toBe(changePct(STOCKS[0], 24, t));
    expect(Number.isFinite(a)).toBe(true);
  });
});
