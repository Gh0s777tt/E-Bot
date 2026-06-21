// Rygiel losowania zwycięzców giveawayów (weightedPick) — ważona pula bez powtórzeń.
// Niezmienniki MUSZĄ trzymać dla KAŻDEGO wyniku tasowania (Math.random), dlatego sprawdzamy je
// w pętli wielu przebiegów. Regresja = ten sam user wygrywa kilka nagród, więcej zwycięzców niż
// uczestników, albo user z wagą ≤0 (clamp) wypada z losowania mimo że powinien być uprawniony.
import { describe, expect, it } from 'vitest';
import { weightedPick } from './giveaways.mts';

type Entry = { user_id: string; weight?: number };
const ROUNDS = 200; // każdy niezmiennik testowany na wielu losowaniach

describe('weightedPick — dedup i rozmiar (dla dowolnego tasowania)', () => {
  it('zwraca dokładnie n unikatowych zwycięzców z puli uczestników (wagi > 1 nie dają duplikatów)', () => {
    const entries: Entry[] = [
      { user_id: 'a', weight: 5 },
      { user_id: 'b', weight: 5 },
      { user_id: 'c', weight: 5 },
      { user_id: 'd', weight: 5 },
      { user_id: 'e', weight: 5 },
    ];
    const ids = new Set(entries.map((e) => e.user_id));
    for (let r = 0; r < ROUNDS; r++) {
      const w = weightedPick(entries, 3);
      expect(w).toHaveLength(3);
      expect(new Set(w).size).toBe(3); // brak duplikatów
      for (const u of w) expect(ids.has(u)).toBe(true); // każdy z puli
    }
  });

  it('nie zwraca więcej zwycięzców niż jest uczestników (n > liczba osób)', () => {
    const entries: Entry[] = [{ user_id: 'a' }, { user_id: 'b' }, { user_id: 'c' }];
    for (let r = 0; r < ROUNDS; r++) {
      const w = weightedPick(entries, 10);
      expect(w).toHaveLength(3);
      expect(new Set(w)).toEqual(new Set(['a', 'b', 'c'])); // dokładnie komplet uczestników
    }
  });

  it('pojedynczy zwycięzca (n=1) — dokładnie jeden, z puli', () => {
    const entries: Entry[] = [{ user_id: 'a' }, { user_id: 'b' }];
    for (let r = 0; r < ROUNDS; r++) {
      const w = weightedPick(entries, 1);
      expect(w).toHaveLength(1);
      expect(['a', 'b']).toContain(w[0]);
    }
  });

  it('brak uczestników → pusta lista', () => {
    expect(weightedPick([], 3)).toEqual([]);
  });
});

describe('weightedPick — clamp wagi (dolny: Math.max(1, …))', () => {
  it('RYGIEL: użytkownik z wagą 0 jest nadal uprawniony (≥1 los) — wpada gdy n ≥ liczba osób', () => {
    const entries: Entry[] = [
      { user_id: 'zero', weight: 0 },
      { user_id: 'norm', weight: 1 },
    ];
    for (let r = 0; r < ROUNDS; r++) {
      const w = weightedPick(entries, 2); // n ≥ 2 osoby → komplet
      expect(new Set(w)).toEqual(new Set(['zero', 'norm']));
    }
  });

  it('ujemna waga też nie wyklucza (clamp do 1)', () => {
    const entries: Entry[] = [
      { user_id: 'neg', weight: -5 },
      { user_id: 'norm', weight: 1 },
    ];
    for (let r = 0; r < ROUNDS; r++) {
      expect(weightedPick(entries, 2)).toContain('neg');
    }
  });

  it('brak pola weight = traktowane jak waga 1 (uczestnik uprawniony)', () => {
    const entries: Entry[] = [{ user_id: 'x' }, { user_id: 'y' }];
    for (let r = 0; r < ROUNDS; r++) {
      expect(new Set(weightedPick(entries, 2))).toEqual(new Set(['x', 'y']));
    }
  });
});
