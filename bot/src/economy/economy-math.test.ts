// Bundla rygle czystej MATEMATYKI ekonomii (eko 2.0) — dotąd nieprzetestowane, a regresja = ciche
// psucie balansu gospodarki: giełda (deterministyczna cena z czasu), pety (progresja/sytość), format waluty.
import { describe, expect, it } from 'vitest';
import { bar, fullness, moodKey, petLevel, xpIntoLevel } from './pets.mts';
import { changePct, priceAt, STOCKS } from './stocks.mts';
import { fmt, payAmounts, robFine, robLoot } from './store.mts';

const GHOST = STOCKS[0]; // base 100, vol 1.0 → mult ∈ [1-0.38, 1+0.38] = [0.62, 1.38]
const PEPE = STOCKS[5];
const T = 1_700_000_000_000;

describe('stocks — deterministyczna cena (priceAt) + zmiana % (changePct)', () => {
  it('priceAt deterministyczne dla (spółka, czas)', () => {
    expect(priceAt(GHOST, T)).toBe(priceAt(GHOST, T));
    expect(priceAt(PEPE, T)).toBe(priceAt(PEPE, T));
  });

  it('priceAt: każda spółka ≥ 1, a GHOST w paśmie amplitud [60,140] przez cały sweep czasu', () => {
    for (let i = 0; i < 300; i++) {
      const t = T + i * 137 * 60_000;
      for (const s of STOCKS) expect(priceAt(s, t)).toBeGreaterThanOrEqual(1);
      const p = priceAt(GHOST, t);
      expect(p).toBeGreaterThanOrEqual(60);
      expect(p).toBeLessThanOrEqual(140);
    }
  });

  it('changePct = 0 przy zerowym upływie czasu (hoursAgo 0)', () => {
    expect(changePct(PEPE, 0, T)).toBe(0);
  });
});

describe('pets — progresja poziomu i sytość', () => {
  it('petLevel: 100 XP na poziom, start od 1', () => {
    expect(petLevel(0)).toBe(1);
    expect(petLevel(99)).toBe(1);
    expect(petLevel(100)).toBe(2);
    expect(petLevel(250)).toBe(3);
  });

  it('xpIntoLevel: reszta XP w bieżącym poziomie (mod 100)', () => {
    expect(xpIntoLevel(150)).toEqual({ into: 50, need: 100 });
    expect(xpIntoLevel(100)).toEqual({ into: 0, need: 100 });
  });

  it('xpIntoLevel: na maksymalnym poziomie (50) pasek pełny, bez progu do 51', () => {
    expect(xpIntoLevel(4899)).toEqual({ into: 99, need: 100 }); // poziom 49 — normalny próg
    expect(xpIntoLevel(4900)).toEqual({ into: 100, need: 100 }); // poziom 50 (MAX) — pełny
    expect(xpIntoLevel(9999)).toEqual({ into: 100, need: 100 }); // ponad MAX — wciąż pełny
  });

  it('fullness: brak last_fed → 0 (głód maksymalny)', () => {
    expect(fullness({ last_fed: null } as never)).toBe(0);
  });

  it('bar: 10 segmentów wg procentu, z klamrą 0–100', () => {
    expect(bar(0)).toBe('░░░░░░░░░░');
    expect(bar(100)).toBe('██████████');
    expect(bar(50)).toBe('█████░░░░░');
    expect(bar(-20)).toBe('░░░░░░░░░░'); // klamra dolna
    expect(bar(999)).toBe('██████████'); // klamra górna
  });

  it('moodKey: progi nastroju 70 / 35 / 0', () => {
    expect(moodKey(70)).toBe('happy');
    expect(moodKey(69)).toBe('ok');
    expect(moodKey(35)).toBe('ok');
    expect(moodKey(34)).toBe('hungry');
    expect(moodKey(1)).toBe('hungry');
    expect(moodKey(0)).toBe('starving');
  });
});

describe('store — formatowanie waluty (fmt)', () => {
  it('zaokrągla liczbę + pogrubienie + waluta', () => {
    expect(fmt(5, 'PLN')).toBe('**5** PLN');
    expect(fmt(5.4, 'GEM')).toBe('**5** GEM');
    expect(fmt(5.6, 'GEM')).toBe('**6** GEM');
  });

  it('separator tysięcy (pl-PL) dla liczb ≥ 1000', () => {
    expect(fmt(1234, 'x')).toMatch(/^\*\*1\D?234\*\* x$/); // \D? = separator (NBSP/spacja) lub brak
  });
});

describe('store — arytmetyka transferów /eco (pay/rob)', () => {
  it('payAmounts: bez podatku → cała kwota dla odbiorcy', () => {
    expect(payAmounts(100, 0)).toEqual({ tax: 0, received: 100 });
  });

  it('payAmounts: podatek % zaokrąglony w dół (spalany)', () => {
    expect(payAmounts(100, 10)).toEqual({ tax: 10, received: 90 });
    expect(payAmounts(99, 10)).toEqual({ tax: 9, received: 90 }); // floor(9.9)=9
  });

  it('payAmounts: 100% podatku → odbiorca dostaje 0', () => {
    expect(payAmounts(50, 100)).toEqual({ tax: 50, received: 0 });
  });

  it('payAmounts: ujemny taxPct klamrowany do 0', () => {
    expect(payAmounts(100, -5)).toEqual({ tax: 0, received: 100 });
  });

  it('robLoot: maxPercent% portfela ofiary, w dół', () => {
    expect(robLoot(1000, 30)).toBe(300);
    expect(robLoot(99, 30)).toBe(29); // floor(29.7)
  });

  it('robLoot: 0% lub puste konto → brak łupu', () => {
    expect(robLoot(1000, 0)).toBe(0);
    expect(robLoot(0, 30)).toBe(0);
    expect(robLoot(-100, 30)).toBe(0); // nigdy ujemny
  });

  it('robFine: połowa workMax, lecz nie więcej niż saldo rabusia', () => {
    expect(robFine(1000, 300)).toBe(150); // floor(300/2)
    expect(robFine(50, 300)).toBe(50); // klamra do salda
    expect(robFine(0, 300)).toBe(0);
  });
});
