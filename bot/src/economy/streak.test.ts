// Rygiel nagród za kamienie milowe serii dziennej (streakMilestoneBonus). KLUCZ: bonus przyznawany
// DOKŁADNIE w dniu progu (7/14/30/60/100), poza progiem 0; mnożnik bazowego dailyAmount, zaokrąglony.
import { describe, expect, it } from 'vitest';
import { STREAK_MILESTONES, streakMilestoneBonus } from './store.mts';

describe('streakMilestoneBonus', () => {
  it('w dniu progu → bonus = base × mult', () => {
    expect(streakMilestoneBonus(7, 250)).toEqual({ bonus: 500, mult: 2 });
    expect(streakMilestoneBonus(14, 250)).toEqual({ bonus: 750, mult: 3 });
    expect(streakMilestoneBonus(30, 250)).toEqual({ bonus: 1250, mult: 5 });
    expect(streakMilestoneBonus(60, 100)).toEqual({ bonus: 800, mult: 8 });
    expect(streakMilestoneBonus(100, 100)).toEqual({ bonus: 1200, mult: 12 });
  });

  it('poza progiem → {0, 0} (1/6/8/15/29/31)', () => {
    for (const s of [1, 6, 8, 15, 29, 31, 99, 101]) {
      expect(streakMilestoneBonus(s, 250)).toEqual({ bonus: 0, mult: 0 });
    }
  });

  it('zaokrągla bonus (base nieparzysty)', () => {
    expect(streakMilestoneBonus(7, 333)).toEqual({ bonus: 666, mult: 2 });
  });

  it('base 0 → bonus 0 nawet na progu (mult zostaje)', () => {
    expect(streakMilestoneBonus(7, 0)).toEqual({ bonus: 0, mult: 2 });
  });

  it('katalog progów: dni rosnące i unikalne', () => {
    const days = STREAK_MILESTONES.map((m) => m.day);
    expect([...days].sort((a, b) => a - b)).toEqual(days);
    expect(new Set(days).size).toBe(days.length);
  });
});
