// Rygiel matematyki retencji kohortowej (survived · mondayKey) — rdzeń wykresu D1/D7/D30 na /stats.
// survived = censoring-correct: „przetrwał D_n" gdy jeszcze jest LUB odszedł nie wcześniej niż n dni
// (granica inkluzywna ≥). mondayKey = kubełek tygodnia (poniedziałek UTC) — niedziela należy do TEGO
// tygodnia, nie następnego. Regresja = zafałszowana retencja / kohorty rozjechane o dzień.
import { describe, expect, it } from 'vitest';
import { mondayKey, survived } from './retention';

const DAY = 86_400_000;
const J = Date.UTC(2026, 0, 1); // dołączenie: dowolny punkt odniesienia

describe('survived — czy członek przetrwał D_n (censoring-correct)', () => {
  it('wciąż jest (left=null) → przetrwał każde D_n', () => {
    expect(survived({ joined: J, left: null }, 1)).toBe(true);
    expect(survived({ joined: J, left: null }, 30)).toBe(true);
  });

  it('RYGIEL granicy inkluzywnej: odejście DOKŁADNIE w n-tym dniu → przetrwał (≥)', () => {
    expect(survived({ joined: J, left: J + 7 * DAY }, 7)).toBe(true);
  });

  it('odejście tuż przed n dniem → NIE przetrwał', () => {
    expect(survived({ joined: J, left: J + 7 * DAY - 1 }, 7)).toBe(false);
  });

  it('odszedł po 7 dniach → przetrwał D7, ale nie D30', () => {
    const r = { joined: J, left: J + 7 * DAY };
    expect(survived(r, 7)).toBe(true);
    expect(survived(r, 30)).toBe(false);
  });

  it('odejście natychmiast → nie przetrwał D1', () => {
    expect(survived({ joined: J, left: J }, 1)).toBe(false);
  });
});

describe('mondayKey — kubełek tygodnia (poniedziałek UTC)', () => {
  // 2024-01-01 to poniedziałek; 01-07 to niedziela tego samego tygodnia; 01-08 to kolejny poniedziałek.
  it('poniedziałek → sam siebie', () => {
    expect(mondayKey(Date.UTC(2024, 0, 1))).toBe('2024-01-01');
  });

  it('środek tygodnia (środa) → poniedziałek tego tygodnia', () => {
    expect(mondayKey(Date.UTC(2024, 0, 3))).toBe('2024-01-01');
  });

  it('RYGIEL: niedziela należy do BIEŻĄCEGO tygodnia (poprzedzający poniedziałek), nie następnego', () => {
    expect(mondayKey(Date.UTC(2024, 0, 7))).toBe('2024-01-01');
  });

  it('kolejny poniedziałek → nowy kubełek', () => {
    expect(mondayKey(Date.UTC(2024, 0, 8))).toBe('2024-01-08');
  });

  it('dowolne dni tego samego tygodnia (pon–niedz) → ten sam klucz', () => {
    const keys = [1, 2, 3, 4, 5, 6, 7].map((d) => mondayKey(Date.UTC(2024, 0, d)));
    expect(new Set(keys).size).toBe(1);
  });
});
