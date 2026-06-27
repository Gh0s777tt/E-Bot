// Rygiel walki petów (petPower + petBattle). KLUCZ: moc rośnie z poziomem/gatunkiem; walka jest
// DETERMINISTYCZNA względem seeda (powtarzalna, testowalna) i sprawiedliwa — znacznie mocniejszy
// pet wygrywa niezależnie od losu (wariancja ≤ 50% mocy). Czyste funkcje.
import { describe, expect, it } from 'vitest';
import { type Pet, petBattle, petPower, topPetsByPower } from './pets.mts';

const pet = (o: Partial<Pet>): Pet => ({
  guild_id: 'g',
  user_id: 'u',
  species: 'cat',
  name: 'P',
  xp: 0,
  last_fed: new Date().toISOString(),
  last_gift: null,
  ...o,
});

describe('petPower', () => {
  it('wyższy poziom → większa moc', () => {
    expect(petPower(pet({ xp: 500 }))).toBeGreaterThan(petPower(pet({ xp: 0 })));
  });

  it('rzadszy gatunek → wyższa baza (dragon > hamster przy równym poziomie)', () => {
    expect(petPower(pet({ species: 'dragon', xp: 0 }))).toBeGreaterThan(
      petPower(pet({ species: 'hamster', xp: 0 })),
    );
  });

  it('moc zawsze ≥ 1 (nieznany gatunek nie wywala)', () => {
    expect(petPower(pet({ xp: 0, species: 'zzz' }))).toBeGreaterThanOrEqual(1);
  });
});

describe('petBattle — deterministyczna walka', () => {
  it('ten sam seed → ten sam wynik (powtarzalność)', () => {
    expect(petBattle(50, 50, 123)).toEqual(petBattle(50, 50, 123));
  });

  it('znacznie mocniejszy pet wygrywa niezależnie od seeda', () => {
    for (const s of [1, 2, 999, 123456, 7777]) {
      expect(petBattle(300, 10, s).winner).toBe('a');
      expect(petBattle(10, 300, s).winner).toBe('b');
    }
  });

  it('score = moc + wariancja (między mocą a 1.5× mocy)', () => {
    const r = petBattle(100, 80, 42);
    expect(r.scoreA).toBeGreaterThanOrEqual(100);
    expect(r.scoreA).toBeLessThanOrEqual(150);
    expect(r.scoreB).toBeGreaterThanOrEqual(80);
    expect(r.scoreB).toBeLessThanOrEqual(120);
  });

  it('winner to zawsze a/b/draw', () => {
    expect(['a', 'b', 'draw']).toContain(petBattle(70, 70, 5).winner);
  });
});

describe('topPetsByPower — ranking petów serwera', () => {
  it('sortuje malejąco wg mocy (silniejszy pet wyżej)', () => {
    const top = topPetsByPower([
      pet({ name: 'Słaby', species: 'hamster', xp: 0 }),
      pet({ name: 'Mocny', species: 'dragon', xp: 500 }),
    ]);
    expect(top.map((p) => p.name)).toEqual(['Mocny', 'Słaby']);
  });

  it('zwraca moc i poziom każdego peta', () => {
    const [first] = topPetsByPower([pet({ name: 'X', xp: 250 })]);
    expect(first.power).toBeGreaterThan(0);
    expect(first.level).toBe(3); // 250 xp → poziom 3
  });

  it('respektuje limit (top-N)', () => {
    const many = Array.from({ length: 15 }, (_, i) => pet({ name: `P${i}`, xp: i * 100 }));
    expect(topPetsByPower(many, 5)).toHaveLength(5);
  });

  it('pusta lista → [] (brak wywału)', () => {
    expect(topPetsByPower([])).toEqual([]);
  });
});
