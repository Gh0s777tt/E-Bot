import { describe, expect, it } from 'vitest';
import { pickPersistable } from './stickyroles.mts';

const EVERYONE = 'guild123';
const roles = [
  { id: EVERYONE, managed: false }, // @everyone — zawsze pomijana
  { id: 'muted', managed: false },
  { id: 'booster', managed: true }, // rola zarządzana (boost) — pomijana
  { id: 'color', managed: false },
];

describe('pickPersistable', () => {
  it('all=false bierze tylko role z listy `allow` (bez @everyone i managed)', () => {
    expect(pickPersistable(roles, EVERYONE, false, ['muted'])).toEqual(['muted']);
    expect(pickPersistable(roles, EVERYONE, false, ['muted', 'color', 'booster'])).toEqual([
      'muted',
      'color',
    ]);
  });

  it('all=true bierze wszystkie przydzielalne (pomija @everyone i managed)', () => {
    expect(pickPersistable(roles, EVERYONE, true, [])).toEqual(['muted', 'color']);
  });

  it('zwraca pustą listę, gdy nic nie pasuje', () => {
    expect(pickPersistable(roles, EVERYONE, false, [])).toEqual([]);
    expect(pickPersistable(roles, EVERYONE, false, ['nieistnieje'])).toEqual([]);
    expect(pickPersistable([{ id: EVERYONE, managed: false }], EVERYONE, true, [])).toEqual([]);
  });
});
