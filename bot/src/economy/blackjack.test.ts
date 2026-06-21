// Rygiel oceny ręki blackjacka (val) + integralności talii (freshDeck) — czysta logika gry
// na pieniądze (eko 2.0). Regresja = ciche błędne wypłaty: zła suma → fałszywy bust/win/push.
// Sercem jest MIĘKKI AS: as liczy się jako 11, ale gdy ręka przekracza 21 — schodzi do 1
// (i tak dla kolejnych asów). Off-by-one w tej pętli psuje cały bilans gry.
import { describe, expect, it } from 'vitest';
import { type Card, freshDeck, val } from './blackjack.mts';

// Krótki konstruktor ręki: kolor nieistotny dla wartości (val patrzy tylko na rangę).
const h = (...ranks: string[]): Card[] => ranks.map((r) => ({ r, s: '♠' }));

describe('blackjack — wartość ręki (val)', () => {
  it('karty liczbowe sumują się wprost', () => {
    expect(val(h('2', '3'))).toBe(5);
    expect(val(h('9', '7', '5'))).toBe(21);
  });

  it('figury (J/Q/K) liczą się po 10', () => {
    expect(val(h('J', 'Q'))).toBe(20);
    expect(val(h('K', '9'))).toBe(19);
    expect(val(h('J', 'Q', 'K'))).toBe(30); // 3× figura = bust 30 (asów brak → bez korekty)
  });

  it('as domyślnie liczy się jako 11 (ręka miękka)', () => {
    expect(val(h('A'))).toBe(11);
    expect(val(h('A', '9'))).toBe(20);
    expect(val(h('A', 'K'))).toBe(21); // naturalny blackjack
  });

  it('RYGIEL miękkiego asa: gdy 11 powodowałoby bust, as schodzi do 1', () => {
    expect(val(h('A', 'K', 'K'))).toBe(21); // 11+10+10=31 → as=1 → 21
    expect(val(h('A', '6', '10'))).toBe(17); // 11+6+10=27 → as=1 → 17
    expect(val(h('A', '5', '7'))).toBe(13); // 11+5+7=23 → as=1 → 13
  });

  it('RYGIEL wielu asów: schodzą do 1 pojedynczo, tylko ile trzeba', () => {
    expect(val(h('A', 'A'))).toBe(12); // 22 → jeden as=1 → 12 (drugi zostaje 11)
    expect(val(h('A', 'A', 'A'))).toBe(13); // 33 → dwa asy=1 → 13
    expect(val(h('A', 'A', '9'))).toBe(21); // 11+1+9 → 21 (jeden as zredukowany)
    expect(val(h('A', 'A', 'A', 'A'))).toBe(14); // 4 asy → 11+1+1+1 = 14
  });

  it('twardy bust: brak asa do ratunku', () => {
    expect(val(h('K', 'Q', '5'))).toBe(25);
    expect(val(h('A', 'K', 'Q', 'K'))).toBe(31); // 11→1 daje 21+10=31, dalej brak asów
  });

  it('pusta ręka = 0', () => {
    expect(val([])).toBe(0);
  });
});

describe('blackjack — integralność talii (freshDeck)', () => {
  it('dokładnie 52 karty', () => {
    expect(freshDeck()).toHaveLength(52);
  });

  it('komplet 4 kolory × 13 rang, każda karta unikatowa', () => {
    const deck = freshDeck();
    const ids = new Set(deck.map((c) => `${c.r}${c.s}`));
    expect(ids.size).toBe(52); // brak duplikatów
    for (const s of ['♠', '♥', '♦', '♣']) {
      expect(deck.filter((c) => c.s === s)).toHaveLength(13); // 13 kart na kolor
    }
  });

  it('suma wartości całej talii = 380 (deterministyczna mimo tasowania)', () => {
    // 4×(2..10=54) + 4×(3 figury ×10=30) + 4×(as=11) = 216 + 120 + 44 = 380.
    // val sumuje asy jako 11 (brak bustu w tym agregacie — liczymy każdą kartę osobno).
    const deck = freshDeck();
    const sum = deck.reduce((acc, c) => acc + val([c]), 0);
    expect(sum).toBe(380);
  });
});
