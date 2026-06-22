// Rygiel budowy paneli ról-za-przyciski (buildRoleRows) — twarde limity Discorda dla komponentów.
// Przekroczenie = API odrzuca CAŁĄ publikację /buttonpanel: max 5 przycisków/rząd, max 5 rzędów
// (czyli kap 25 przycisków — nadmiar cicho ucięty). customId `role:<id>` jest kontraktem z handlerem
// (handleRoleButton routuje po nim). buildRoleRows jest czyste → 0 zmian produkcyjnych.
import { describe, expect, it } from 'vitest';
import { type BtnRole, buildRoleRows } from './buttonroles.mts';

const mk = (n: number): BtnRole[] =>
  Array.from({ length: n }, (_, i) => ({ label: `L${i}`, roleId: `r${i}` }));
const json = (bs: BtnRole[]) => buildRoleRows(bs).map((r) => r.toJSON());

describe('buildRoleRows — limity komponentów Discorda', () => {
  it('pusta lista → brak rzędów', () => {
    expect(buildRoleRows([])).toEqual([]);
  });

  it('5 przycisków → 1 rząd z dokładnie 5 komponentami', () => {
    const rows = json(mk(5));
    expect(rows).toHaveLength(1);
    expect(rows[0].components).toHaveLength(5);
  });

  it('6 przycisków → 2 rzędy (5 + 1)', () => {
    const rows = json(mk(6));
    expect(rows).toHaveLength(2);
    expect(rows[0].components).toHaveLength(5);
    expect(rows[1].components).toHaveLength(1);
  });

  it('RYGIEL kapu 25: 30 przycisków → 5 rzędów × 5 (nadmiar ucięty)', () => {
    const rows = json(mk(30));
    expect(rows).toHaveLength(5); // nigdy >5 rzędów
    const total = rows.reduce((a, r) => a + r.components.length, 0);
    expect(total).toBe(25);
  });

  it('RYGIEL ≤5/rząd: każdy rząd ma najwyżej 5 komponentów (sweep 1..30)', () => {
    for (let n = 1; n <= 30; n++)
      for (const r of json(mk(n))) expect(r.components.length).toBeLessThanOrEqual(5);
  });
});

describe('buildRoleRows — kontrakt przycisku', () => {
  it('customId = role:<roleId> (kontrakt routingu z handlerem)', () => {
    const [row] = json([{ label: 'VIP', roleId: '42' }]);
    const btn = row.components[0] as { custom_id?: string; label?: string };
    expect(btn.custom_id).toBe('role:42');
    expect(btn.label).toBe('VIP');
  });

  it('pusty label → domyślnie "Rola"', () => {
    const [row] = json([{ label: '', roleId: '7' }]);
    expect((row.components[0] as { label?: string }).label).toBe('Rola');
  });

  it('emoji ustawiane tylko gdy podane', () => {
    const withEmoji = json([{ label: 'A', roleId: '1', emoji: '🔥' }]);
    const without = json([{ label: 'B', roleId: '2' }]);
    expect((withEmoji[0].components[0] as { emoji?: unknown }).emoji).toBeDefined();
    expect((without[0].components[0] as { emoji?: unknown }).emoji).toBeUndefined();
  });
});
