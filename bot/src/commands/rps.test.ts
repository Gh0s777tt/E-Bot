// Rygiel /rps — wynik rundy (rpsOutcome) z tabeli BEATS. Refactor behavior-preserving: logika
// zwycięstwa wyjęta z execute do czystej funkcji (jedyne źródło prawdy). Regresja = bot „oszukuje"
// (gracz wygrywa rundę, którą powinien przegrać) albo gra się zawiesza na remisie/nierozstrzygnięciu.
// KLUCZ: anty-symetria (a bije b ⟺ b przegrywa z a) = sprawiedliwość gry; BEATS musi być cyklem 3.
import { describe, expect, it } from 'vitest';
import { CHOICES, type Choice, rpsOutcome } from './rps.mts';

describe('rpsOutcome — wynik rundy z perspektywy gracza', () => {
  it('równy wybór → zawsze remis', () => {
    for (const c of CHOICES) expect(rpsOutcome(c, c)).toBe('tie');
  });

  it('kanoniczne zwycięstwa gracza (rock>scissors, scissors>paper, paper>rock)', () => {
    expect(rpsOutcome('rock', 'scissors')).toBe('win');
    expect(rpsOutcome('scissors', 'paper')).toBe('win');
    expect(rpsOutcome('paper', 'rock')).toBe('win');
  });

  it('kanoniczne porażki gracza (odwrotność zwycięstw)', () => {
    expect(rpsOutcome('scissors', 'rock')).toBe('lose');
    expect(rpsOutcome('paper', 'scissors')).toBe('lose');
    expect(rpsOutcome('rock', 'paper')).toBe('lose');
  });

  it('RYGIEL anty-symetrii: win(a,b) ⟺ lose(b,a) (sprawiedliwość — bot nie oszukuje)', () => {
    for (const a of CHOICES)
      for (const b of CHOICES) {
        if (a === b) continue;
        const ab = rpsOutcome(a, b);
        const ba = rpsOutcome(b, a);
        expect(ab === 'tie').toBe(false); // różne wybory nigdy nie remisują
        expect(ba, `${a} vs ${b}=${ab}, więc ${b} vs ${a} musi być odwrotne`).toBe(
          ab === 'win' ? 'lose' : 'win',
        );
      }
  });

  it('RYGIEL integralności BEATS (cykl 3): każdy wybór wygrywa dokładnie z 1 i przegrywa z 1', () => {
    for (const me of CHOICES) {
      const wins = CHOICES.filter((o: Choice) => rpsOutcome(me, o) === 'win');
      const loses = CHOICES.filter((o: Choice) => rpsOutcome(me, o) === 'lose');
      const ties = CHOICES.filter((o: Choice) => rpsOutcome(me, o) === 'tie');
      expect(wins.length, `${me} musi wygrywać z dokładnie 1`).toBe(1);
      expect(loses.length, `${me} musi przegrywać z dokładnie 1`).toBe(1);
      expect(ties).toEqual([me]); // remis tylko sam ze sobą
    }
  });

  it('zawsze jeden z trzech wyników (nigdy undefined)', () => {
    for (const a of CHOICES)
      for (const b of CHOICES) expect(['win', 'lose', 'tie']).toContain(rpsOutcome(a, b));
  });
});
