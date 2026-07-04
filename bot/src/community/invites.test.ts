import { describe, expect, it } from 'vitest';
import { findUsedInvite } from './invites.mts';

const m = (o: Record<string, number>) => new Map(Object.entries(o));

describe('findUsedInvite — które zaproszenie zyskało użycie', () => {
  it('wykrywa kod, którego uses wzrosło', () => {
    expect(findUsedInvite(m({ abc: 2, xyz: 5 }), m({ abc: 3, xyz: 5 }))).toBe('abc');
  });

  it('nowy kod (nieobecny w before) z uses>0 → wykryty', () => {
    expect(findUsedInvite(m({ abc: 2 }), m({ abc: 2, nowy: 1 }))).toBe('nowy');
  });

  it('brak zmian → "" (nikt nie użył lub brak uprawnienia do odczytu)', () => {
    expect(findUsedInvite(m({ abc: 2 }), m({ abc: 2 }))).toBe('');
    expect(findUsedInvite(m({}), m({}))).toBe('');
  });

  it('KLUCZOWE: pusty before (baseline niegotowy) + realne uses NIE powinien być używany do atrybucji', () => {
    // findUsedInvite zwróci pierwszy kod z uses>0 — dlatego wołający pomija atrybucję gdy baseline
    // nie jest gotowy. Ten test dokumentuje, DLACZEGO guard `ready` jest konieczny.
    expect(findUsedInvite(m({}), m({ stare1: 10, stare2: 3 }))).toBe('stare1'); // = błędna atrybucja
  });
});
