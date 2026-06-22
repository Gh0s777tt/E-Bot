// Rygiel „najaktywniejszego" tygodniowego digestu (topUserByMessages) — wyłoniony behavior-preserving
// z `maybePost`. KLUCZ: grupuje wiersze user_activity po user_id i SUMUJE wiadomości z wielu dni
// (jeden wiersz/dzień), wyłania lidera (sort MALEJĄCO), rozwiązuje nazwę (username z dowolnego wiersza
// > fallback user_id). Regresja = digest chwali złą osobę albo pokazuje surowe id zamiast nicku.
import { describe, expect, it } from 'vitest';
import { topUserByMessages } from './digest.mts';

describe('topUserByMessages — lider aktywności tygodnia', () => {
  it('SUMUJE wiadomości tego samego usera z wielu dni', () => {
    const top = topUserByMessages([
      { user_id: 'a', username: 'Ala', messages: 5 },
      { user_id: 'a', username: 'Ala', messages: 3 },
    ]);
    expect(top).toEqual({ name: 'Ala', msgs: 8 });
  });

  it('RYGIEL rankingu: zwraca usera z największą sumą (malejąco)', () => {
    const top = topUserByMessages([
      { user_id: 'a', username: 'Ala', messages: 8 },
      { user_id: 'b', username: 'Bob', messages: 10 },
    ]);
    expect(top?.name).toBe('Bob');
  });

  it('RYGIEL nazwy: username z DOWOLNEGO wiersza wygrywa z fallbackiem user_id', () => {
    // pierwszy wiersz bez nicku (name=user_id), drugi z nickiem → nick wygrywa
    const top = topUserByMessages([
      { user_id: 'x', messages: 2 },
      { user_id: 'x', username: 'Ghost', messages: 1 },
    ]);
    expect(top).toEqual({ name: 'Ghost', msgs: 3 });
  });

  it('fallback nazwy na user_id, gdy żaden wiersz nie ma username', () => {
    expect(topUserByMessages([{ user_id: '123', messages: 4 }])?.name).toBe('123');
  });

  it('messages brakujące liczone jako 0 (bez NaN)', () => {
    const top = topUserByMessages([
      { user_id: 'a', username: 'Ala' },
      { user_id: 'a', username: 'Ala', messages: 7 },
    ]);
    expect(top?.msgs).toBe(7);
  });

  it('pusta lista → undefined (brak najaktywniejszego)', () => {
    expect(topUserByMessages([])).toBeUndefined();
  });
});
