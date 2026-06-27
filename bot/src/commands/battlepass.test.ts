// Rygiel silnika battle-pass (battlePassTier) — czysta część /battlepass. Regresja = zły tier/postęp
// (mylący gracza), brak „maksymalnego" przy przekroczeniu drabiny albo % poza [0,100].
import { describe, expect, it } from 'vitest';
import { battlePassTier, TIERS } from './battlepass.mts';

describe('battlePassTier — silnik tierów sezonu', () => {
  it('poniżej 1. tieru → current 0, postęp liczony do tieru 1', () => {
    const r = battlePassTier(5, TIERS); // tier1 = 10
    expect(r.current).toBe(0);
    expect(r.next?.tier).toBe(1);
    expect(r.progressPct).toBe(50);
    expect(r.unlocked).toHaveLength(0);
  });

  it('dokładnie na progu tieru → ten tier odblokowany, 0% do następnego', () => {
    const r = battlePassTier(75, TIERS); // tier3 = 75
    expect(r.current).toBe(3);
    expect(r.next?.tier).toBe(4);
    expect(r.progressPct).toBe(0);
    expect(r.unlocked).toHaveLength(3);
  });

  it('powyżej maksymalnego progu → max tier, brak next, 100%', () => {
    const r = battlePassTier(99_999, TIERS);
    expect(r.current).toBe(TIERS.length);
    expect(r.next).toBeNull();
    expect(r.progressPct).toBe(100);
  });

  it('0 XP → current 0, postęp 0', () => {
    expect(battlePassTier(0, TIERS).progressPct).toBe(0);
  });
});
