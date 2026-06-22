// Rygiel gry w liczenie (checkCount) — werdykt: czy kolejna liczba jest poprawna. Refactor
// behavior-preserving: logika decyzji wyjęta z handlera (side-effecty reakcji/wiadomości/persist
// zostają w handlerze). KLUCZ: anti-cheat (ten sam user dwa razy z rzędu) sprawdzany PRZED zgodnością
// liczby; liczba musi być DOKŁADNIE count+1; record = pobicie rekordu serwera.
import { describe, expect, it } from 'vitest';
import { checkCount } from './counting.mts';

const st = (count: number, lastUserId = '', record = 0) => ({ count, lastUserId, record });

describe('checkCount — werdykt kolejnej liczby', () => {
  it('poprawna liczba (count+1) od innego usera → ok, bez rekordu', () => {
    expect(checkCount(st(5, 'A', 10), 6, 'B', false)).toEqual({
      ok: true,
      count: 6,
      record: false,
    });
  });

  it('poprawna liczba bijąca rekord → record: true', () => {
    expect(checkCount(st(10, 'A', 10), 11, 'B', false)).toEqual({
      ok: true,
      count: 11,
      record: true,
    });
  });

  it('RYGIEL anti-cheat: ten sam user dwa razy z rzędu → fail „same-user"', () => {
    expect(checkCount(st(5, 'A', 10), 6, 'A', false)).toEqual({
      ok: false,
      reason: 'same-user',
      expected: 6,
    });
  });

  it('ten sam user, ale allowSameUser → ok', () => {
    expect(checkCount(st(5, 'A', 10), 6, 'A', true)).toMatchObject({ ok: true, count: 6 });
  });

  it('RYGIEL zgodności: liczba ≠ count+1 → fail „wrong" z oczekiwaną', () => {
    expect(checkCount(st(5, 'A', 10), 7, 'B', false)).toEqual({
      ok: false,
      reason: 'wrong',
      expected: 6,
    });
    expect(checkCount(st(5, 'A', 10), 5, 'B', false)).toMatchObject({ ok: false, reason: 'wrong' });
  });

  it('RYGIEL kolejności: same-user MA priorytet nad złą liczbą', () => {
    // ten sam user + zła liczba → reason „same-user" (anti-cheat sprawdzany pierwszy)
    expect(checkCount(st(5, 'A', 10), 99, 'A', false)).toMatchObject({
      ok: false,
      reason: 'same-user',
    });
  });
});
