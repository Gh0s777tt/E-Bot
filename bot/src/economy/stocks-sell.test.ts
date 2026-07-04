import { describe, expect, it, vi } from 'vitest';
import { type SellDeps, sellHoldingCASCore } from './stocks.mts';

// Fejk chmury: zwraca zadaną liczbę „zmienionych wierszy" i notuje wywołania.
const fake = (delRows: number, updRows: number) => {
  const calls = { del: [] as string[], upd: [] as { filter: string; patch: unknown }[] };
  const deps: SellDeps = {
    del: vi.fn(async (_t, filter) => {
      calls.del.push(filter);
      return Array(delRows).fill({});
    }),
    upd: vi.fn(async (_t, filter, patch) => {
      calls.upd.push({ filter, patch });
      return Array(updRows).fill({});
    }),
  };
  return { deps, calls };
};

describe('sellHoldingCASCore (#2 anty-double-sell)', () => {
  it('sprzedaż CZĘŚCIOWA → PATCH nowej wartości; sukces gdy 1 wiersz zmieniony', async () => {
    const { deps, calls } = fake(0, 1);
    const ok = await sellHoldingCASCore('g&shares=eq.10', 4, 10, 30, deps);
    expect(ok).toBe(true);
    expect(calls.upd[0]?.patch).toEqual({ shares: 6, invested: 30 });
    expect(deps.del).not.toHaveBeenCalled();
  });

  it('sprzedaż CAŁOŚCI (left<=0) → DELETE wiersza, nie PATCH', async () => {
    const { deps, calls } = fake(1, 0);
    const ok = await sellHoldingCASCore('g&shares=eq.5', 5, 5, 0, deps);
    expect(ok).toBe(true);
    expect(calls.del).toHaveLength(1);
    expect(deps.upd).not.toHaveBeenCalled();
  });

  it('PRZEGRANY WYŚCIG: 0 zmienionych wierszy → false (drugi /sell nie wypłaca)', async () => {
    const partial = await sellHoldingCASCore('f', 4, 10, 30, fake(0, 0).deps);
    const full = await sellHoldingCASCore('f', 5, 5, 0, fake(0, 0).deps);
    expect(partial).toBe(false);
    expect(full).toBe(false);
  });

  it('invested nigdy ujemny i zaokrąglony', async () => {
    const { calls } = { calls: fake(0, 1).calls };
    const f = fake(0, 1);
    await sellHoldingCASCore('x', 1, 10, -5, f.deps);
    expect(f.calls.upd[0]?.patch).toMatchObject({ invested: 0 });
    void calls;
  });
});
