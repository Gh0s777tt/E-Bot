import { describe, expect, it } from 'vitest';
import { computePremiumMetrics, daysLeft, EXPIRING_DAYS } from './premiumMetrics';

const NOW = Date.parse('2026-07-04T12:00:00Z');
const iso = (daysFromNow: number) => new Date(NOW + daysFromNow * 86_400_000).toISOString();

describe('daysLeft', () => {
  it('liczy dni do końca (sufit, min 0); bezterminowo/zły format → null', () => {
    expect(daysLeft(iso(3), NOW)).toBe(3);
    expect(daysLeft(iso(0.4), NOW)).toBe(1);
    expect(daysLeft(iso(-2), NOW)).toBe(0);
    expect(daysLeft(null, NOW)).toBeNull();
    expect(daysLeft('nie-data', NOW)).toBeNull();
  });
});

describe('computePremiumMetrics', () => {
  it('pusta lista → same zera', () => {
    expect(computePremiumMetrics([], NOW)).toEqual({
      active: 0,
      expiringSoon: 0,
      newLast30d: 0,
      endedLast30d: 0,
    });
  });

  it('aktywne: bezterminowa nie jest „wygasająca", krótka (≤7 dni) tak', () => {
    const rows = [
      { since: iso(-100), until: null, active: true },
      { since: iso(-100), until: iso(EXPIRING_DAYS), active: true },
      { since: iso(-100), until: iso(EXPIRING_DAYS + 1), active: true },
    ];
    const m = computePremiumMetrics(rows, NOW);
    expect(m.active).toBe(3);
    expect(m.expiringSoon).toBe(1);
  });

  it('nowe i wygasłe liczą okno 30 dni; starsze poza oknem pomijane', () => {
    const rows = [
      { since: iso(-5), until: null, active: true }, // nowa
      { since: iso(-40), until: iso(-3), active: false }, // wygasła w oknie
      { since: iso(-90), until: iso(-45), active: false }, // wygasła dawno — poza oknem
    ];
    const m = computePremiumMetrics(rows, NOW);
    expect(m.newLast30d).toBe(1);
    expect(m.endedLast30d).toBe(1);
    expect(m.active).toBe(1);
  });
});
