// Rygiel osobistych alertów cenowych (czyste operacje na mapie targetów) — wyłonione z /pricealert
// + pollera. Regresja = zgubiony/zduplikowany target, brak dedupu po tytule, albo zły warunek trafienia.
import { describe, expect, it } from 'vitest';
import {
  addTarget,
  isTargetHit,
  type Money,
  removeTarget,
  type TargetMap,
  targetsToNotify,
} from './pricetracker.mts';

const price = (amount: number, currency = 'PLN'): Money => ({ amount, currency });

describe('price targets — operacje na mapie', () => {
  it('addTarget dodaje + dedup po tytule (case-insensitive nadpisuje)', () => {
    let m: TargetMap = {};
    m = addTarget(m, 'u1', 'Hades', 50);
    m = addTarget(m, 'u1', 'hades', 30);
    expect(m.u1).toEqual([{ title: 'hades', target: 30 }]);
  });

  it('listy są niezależne per-user', () => {
    let m: TargetMap = {};
    m = addTarget(m, 'u1', 'A', 10);
    m = addTarget(m, 'u2', 'B', 20);
    expect(m.u1).toHaveLength(1);
    expect(m.u2).toHaveLength(1);
  });

  it('addTarget przycina do cap (zostają najnowsze)', () => {
    let m: TargetMap = {};
    for (let i = 0; i < 30; i++) m = addTarget(m, 'u1', `g${i}`, i, 25);
    expect(m.u1).toHaveLength(25);
    expect(m.u1[0].title).toBe('g5');
  });

  it('removeTarget usuwa po tytule + czyści pustego usera', () => {
    let m: TargetMap = addTarget({}, 'u1', 'Hades', 50);
    m = removeTarget(m, 'u1', 'HADES');
    expect(m.u1).toBeUndefined();
  });

  it('isTargetHit: cena ≤ próg (>0)', () => {
    expect(isTargetHit(40, 50)).toBe(true);
    expect(isTargetHit(50, 50)).toBe(true);
    expect(isTargetHit(60, 50)).toBe(false);
    expect(isTargetHit(40, 0)).toBe(false);
  });
});

describe('targetsToNotify — kto dostaje DM', () => {
  it('zwraca trafione, pomija nietrafione', () => {
    const map: TargetMap = {
      u1: [
        { title: 'Hades', target: 30 },
        { title: 'Celeste', target: 10 },
      ],
    };
    const prices = new Map([
      ['hades', price(25)],
      ['celeste', price(15)],
    ]);
    expect(targetsToNotify(map, prices, [])).toEqual([
      { userId: 'u1', title: 'Hades', target: 30 },
    ]);
  });

  it('dedup po liście seen', () => {
    const map: TargetMap = { u1: [{ title: 'Hades', target: 30 }] };
    const prices = new Map([['hades', price(25)]]);
    expect(targetsToNotify(map, prices, ['u1:hades:3000'])).toEqual([]);
  });

  it('inna waluta / brak ceny pomijane', () => {
    const map: TargetMap = {
      u1: [
        { title: 'X', target: 30 },
        { title: 'Y', target: 30 },
      ],
    };
    const prices = new Map([['x', price(10, 'EUR')]]);
    expect(targetsToNotify(map, prices, [])).toEqual([]);
  });
});
