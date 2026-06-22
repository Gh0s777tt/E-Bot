// Rygiel matematyki odsetek bankowych (interestGain) — wyłoniony behavior-preserving z `tick`.
// KLUCZ: dzienny przyrost = floor(bank · pct / 100). FLOOR (brak ułamkowej waluty — inaczej saldo
// dryfuje na groszach), mnożenie PRZED dzieleniem (inaczej grosze giną na zaokrągleniu), saldo dające
// <1 nie dostaje nic (caller filtruje gain<=0). Regresja = błędna pasywna wypłata odsetek całemu
// serwerowi codziennie.
import { describe, expect, it } from 'vitest';
import { interestGain } from './interest.mts';

describe('interestGain — dzienny przyrost odsetek bankowych', () => {
  it('dokładny procent: 100 @ 5% = 5', () => {
    expect(interestGain(100, 5)).toBe(5);
  });

  it('proporcjonalność: 10000 @ 3% = 300', () => {
    expect(interestGain(10000, 3)).toBe(300);
  });

  it('RYGIEL floor: 199 @ 1% = 1 (1.99 zaokrąglone w DÓŁ, nie 2)', () => {
    expect(interestGain(199, 1)).toBe(1);
  });

  it('RYGIEL sub-grosza → 0: 50 @ 1% = 0 (0.5 w dół) — takie salda caller pomija', () => {
    expect(interestGain(50, 1)).toBe(0);
  });

  it('RYGIEL kolejności (mnożenie przed dzieleniem): 150 @ 2% = 3', () => {
    // floor(bank/100)*pct dałoby floor(1.5)*2 = 2 — zła kolejność; poprawnie floor(300/100)=3
    expect(interestGain(150, 2)).toBe(3);
  });
});
