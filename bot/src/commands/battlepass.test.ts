// Rygiel silnika battle-pass (battlePassTier) — czysta część /battlepass. Regresja = zły tier/postęp
// (mylący gracza), brak „maksymalnego" przy przekroczeniu drabiny albo % poza [0,100].
import { describe, expect, it } from 'vitest';
import { battlePassTier, claimRewards, TIERS } from './battlepass.mts';

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

describe('claimRewards — coins za nowe tiery (dedup sezonowy)', () => {
  it('sumuje nagrody tierów od claimed+1 do current', () => {
    const r = claimRewards(3, 0, TIERS);
    expect(r.coins).toBe(TIERS[0].reward + TIERS[1].reward + TIERS[2].reward);
    expect(r.newClaimed).toBe(3);
  });

  it('nic nowego (current ≤ claimed) → 0 (idempotentne)', () => {
    expect(claimRewards(3, 3, TIERS)).toEqual({ coins: 0, newClaimed: 3 });
  });

  it('tylko przyrost (claimed 2 → current 4)', () => {
    const r = claimRewards(4, 2, TIERS);
    expect(r.coins).toBe(TIERS[2].reward + TIERS[3].reward);
    expect(r.newClaimed).toBe(4);
  });
});
