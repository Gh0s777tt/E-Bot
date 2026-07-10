import { describe, expect, it } from 'vitest';
import { BILLING_PLAN_IDS, BILLING_PLANS, planSavePct, priceNumber } from './premiumPlan';

describe('priceNumber — wyciąga liczbę z ceny', () => {
  it('parsuje różne formaty', () => {
    expect(priceNumber('49 zł')).toBe(49);
    expect(priceNumber('129 zł')).toBe(129);
    expect(priceNumber('19,99 zł')).toBe(19.99);
    expect(priceNumber('$429')).toBe(429);
  });
  it('brak liczby → null', () => {
    expect(priceNumber('—')).toBeNull();
    expect(priceNumber('')).toBeNull();
  });
});

describe('planSavePct — oszczędność vs miesięczne', () => {
  it('drabinka 49/129/239/429 daje rosnące rabaty (3mc<6mc<rok)', () => {
    const by = (id: string) => BILLING_PLANS.find((p) => p.id === id)!;
    // 3mc: 129 vs 3×49=147 → 12%; 6mc: 239 vs 294 → 18%; rok: 429 vs 588 → 27%
    expect(planSavePct(by('quarter'), '49 zł')).toBe(12);
    expect(planSavePct(by('half'), '49 zł')).toBe(18);
    expect(planSavePct(by('year'), '49 zł')).toBe(27);
  });
  it('plan miesięczny lub brak oszczędności → null', () => {
    expect(planSavePct({ months: 1, price: '49 zł' }, '49 zł')).toBeNull();
    expect(planSavePct({ months: 3, price: '147 zł' }, '49 zł')).toBeNull(); // = pełna cena, 0%
    expect(planSavePct({ months: 3, price: '—' }, '49 zł')).toBeNull();
  });
});

describe('BILLING_PLANS — model interwałów', () => {
  it('4 plany w kolejności rosnącej + spójne ID', () => {
    expect(BILLING_PLANS.map((p) => p.months)).toEqual([1, 3, 6, 12]);
    expect(BILLING_PLAN_IDS).toEqual(['month', 'quarter', 'half', 'year']);
  });
});
