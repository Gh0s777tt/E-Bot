// Rygiel konfigurowalnych limitów planów: domyślne progi, env override (priorytet, server-side),
// odporność na zły env, grandfathering (limitAllows) oraz komunikat odmowy (limitMessage).
import { afterEach, describe, expect, it } from 'vitest';
import { limitAllows, limitMessage, PLAN_LIMITS, planLimit } from './premiumPlan';

afterEach(() => {
  for (const k of Object.keys(process.env)) if (k.startsWith('LIMIT_')) delete process.env[k];
});

describe('planLimit — konfiguracja + env override', () => {
  it('zwraca skonfigurowany próg ze stałej', () => {
    expect(planLimit('shopItems', 'free')).toBe(PLAN_LIMITS.shopItems.free);
    expect(planLimit('shopItems', 'premium')).toBe(PLAN_LIMITS.shopItems.premium);
  });
  it('env LIMIT_<FEATURE>_<TIER> nadpisuje stałą', () => {
    process.env.LIMIT_SHOPITEMS_FREE = '20';
    expect(planLimit('shopItems', 'free')).toBe(20);
  });
  it('env=0 akceptowane (funkcja wyłączona dla planu)', () => {
    process.env.LIMIT_COUNTERS_FREE = '0';
    expect(planLimit('counters', 'free')).toBe(0);
  });
  it('zły / ujemny env → fallback do stałej', () => {
    process.env.LIMIT_RESPONDERS_FREE = 'abc';
    expect(planLimit('responders', 'free')).toBe(PLAN_LIMITS.responders.free);
    process.env.LIMIT_RESPONDERS_FREE = '-5';
    expect(planLimit('responders', 'free')).toBe(PLAN_LIMITS.responders.free);
  });
  it('premium ≥ free dla każdej funkcji', () => {
    for (const f of Object.keys(PLAN_LIMITS) as (keyof typeof PLAN_LIMITS)[]) {
      expect(PLAN_LIMITS[f].premium).toBeGreaterThanOrEqual(PLAN_LIMITS[f].free);
    }
  });
});

describe('limitAllows — bramka tworzenia + grandfathering', () => {
  it('na limicie OK, ponad limit (od zera) blok', () => {
    expect(limitAllows(5, 5, 0)).toBe(true);
    expect(limitAllows(5, 6, 0)).toBe(false);
  });
  it('grandfathering: nadmiar dozwolony, gdy NIE zwiększamy względem obecnego', () => {
    expect(limitAllows(5, 7, 7)).toBe(true); // utrzymanie
    expect(limitAllows(5, 6, 7)).toBe(true); // zmniejszenie (wciąż > limit)
  });
  it('grandfathering nie pozwala dorzucić ponad obecny nadmiar', () => {
    expect(limitAllows(5, 8, 7)).toBe(false);
  });
});

describe('limitMessage', () => {
  it('Free: zawiera limit i zachętę do Premium', () => {
    const m = limitMessage('shopItems', 15, 'free');
    expect(m).toContain('Free');
    expect(m).toContain('15');
    expect(m).toContain('Premium');
  });
  it('Premium: bez zachęty do upgrade', () => {
    const m = limitMessage('shopItems', 150, 'premium');
    expect(m).toContain('Premium');
    expect(m).not.toContain('Przejdź');
  });
});
