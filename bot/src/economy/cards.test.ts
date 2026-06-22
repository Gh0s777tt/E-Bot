// Rygiel kart kolekcjonerskich (gacha, eko 2.0) — czysta logika losowania i katalogu.
// Regresja = zepsuta gacha: zła drabina rzadkości (rzadsze powinny być MNIEJ prawdopodobne i warte
// WIĘCEJ), pusta pula rzadkości (drawCard zwróciłby fallback), albo zła kolejność sortowania kolekcji.
import { describe, expect, it } from 'vitest';
import { CARDS, type Card, drawCard, findCard, RARITY, type Rarity, rarityRank } from './cards.mts';

const RARITIES: Rarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];

describe('RARITY — drabina wag i wartości', () => {
  it('waga MALEJE z rzadkością (rzadsze = mniej prawdopodobne)', () => {
    for (let i = 1; i < RARITIES.length; i++) {
      expect(RARITY[RARITIES[i]].weight).toBeLessThan(RARITY[RARITIES[i - 1]].weight);
    }
  });

  it('wartość sprzedaży ROŚNIE z rzadkością (rzadsze = warte więcej)', () => {
    for (let i = 1; i < RARITIES.length; i++) {
      expect(RARITY[RARITIES[i]].sell).toBeGreaterThan(RARITY[RARITIES[i - 1]].sell);
    }
  });

  it('każda waga ≥ 1, suma wag = 100 (czytelne %)', () => {
    let sum = 0;
    for (const r of RARITIES) {
      expect(RARITY[r].weight).toBeGreaterThanOrEqual(1);
      sum += RARITY[r].weight;
    }
    expect(sum).toBe(100);
  });
});

describe('CARDS — integralność katalogu', () => {
  it('id-y są unikalne', () => {
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(CARDS.length);
  });

  it('każda karta ma rzadkość z RARITY', () => {
    for (const c of CARDS) expect(RARITY[c.rarity]).toBeDefined();
  });

  it('RYGIEL: każda rzadkość ma ≥1 kartę (inaczej drawCard tej rzadkości spada na fallback)', () => {
    for (const r of RARITIES) {
      expect(CARDS.filter((c) => c.rarity === r).length, `rzadkość ${r}`).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('findCard — wyszukiwanie po id', () => {
  it('dokładne id', () => {
    expect(findCard('ghostking')?.rarity).toBe('mythic');
  });
  it('case-insensitive + trim (wpisane przez użytkownika)', () => {
    expect(findCard('  GhostKing  ')?.id).toBe('ghostking');
    expect(findCard('COIN')?.id).toBe('coin');
  });
  it('nieznane id → undefined', () => {
    expect(findCard('nie-ma')).toBeUndefined();
    expect(findCard('')).toBeUndefined();
  });
});

describe('rarityRank — kolejność sortowania kolekcji (rzadsze najpierw)', () => {
  it('ścisła kolejność mythic < legendary < epic < rare < common', () => {
    expect(rarityRank('mythic')).toBeLessThan(rarityRank('legendary'));
    expect(rarityRank('legendary')).toBeLessThan(rarityRank('epic'));
    expect(rarityRank('epic')).toBeLessThan(rarityRank('rare'));
    expect(rarityRank('rare')).toBeLessThan(rarityRank('common'));
  });
});

describe('drawCard — losowanie (niezmienniki dla dowolnego Math.random)', () => {
  it('zawsze zwraca prawidłową kartę z CARDS', () => {
    const ids = new Set(CARDS.map((c) => c.id));
    for (let i = 0; i < 2000; i++) {
      const card: Card = drawCard();
      expect(ids.has(card.id)).toBe(true);
    }
  });

  it('wszystkie 5 rzadkości jest osiągalnych (każda gałąź wag działa)', () => {
    const seen = new Set<Rarity>();
    // 20k losowań: mythic (1%) pojawia się ~200×, P(brak) ≈ 0 — reachability deterministyczna w praktyce.
    for (let i = 0; i < 20_000; i++) seen.add(drawCard().rarity);
    expect(seen).toEqual(new Set(RARITIES));
  });
});
