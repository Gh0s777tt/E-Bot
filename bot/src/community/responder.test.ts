// Rygiel dopasowania triggera autorespondera (matchTrigger) — 3 tryby × case-insensitive × pusty guard.
// Autoresponder odpowiada na KAŻDĄ wiadomość serwera, więc błąd = spam: `exact` jako podłańcuch łapałby
// pół czatu, pusty trigger łapałby wszystko, a utrata `toLowerCase` gubiłaby trafienia o innej wielkości.
import { describe, expect, it } from 'vitest';
import { matchTrigger } from './responder.mts';

describe('matchTrigger — tryb contains (domyślny)', () => {
  it('łapie podłańcuch w dowolnym miejscu', () => {
    expect(matchTrigger('powiedz hejka ziom', 'hejka', 'contains')).toBe(true);
    expect(matchTrigger('hejka', 'hejka', 'contains')).toBe(true);
  });
  it('brak podłańcucha → false', () => {
    expect(matchTrigger('cześć ziom', 'hejka', 'contains')).toBe(false);
  });
});

describe('matchTrigger — tryb exact (ścisła równość, NIE podłańcuch)', () => {
  it('pasuje tylko gdy cała treść = trigger', () => {
    expect(matchTrigger('ping', 'ping', 'exact')).toBe(true);
    expect(matchTrigger('ping pong', 'ping', 'exact')).toBe(false); // podłańcuch ≠ exact
    expect(matchTrigger('to jest ping', 'ping', 'exact')).toBe(false);
  });
});

describe('matchTrigger — tryb starts (prefiks)', () => {
  it('pasuje tylko gdy treść zaczyna się od triggera', () => {
    expect(matchTrigger('hello world', 'hello', 'starts')).toBe(true);
    expect(matchTrigger('say hello', 'hello', 'starts')).toBe(false); // w środku → nie
    expect(matchTrigger('hello', 'hello', 'starts')).toBe(true);
  });
});

describe('matchTrigger — case-insensitive', () => {
  it('wielkość liter nie ma znaczenia po obu stronach', () => {
    expect(matchTrigger('HEJKA ZIOM', 'hejka', 'contains')).toBe(true);
    expect(matchTrigger('hejka ziom', 'HEJKA', 'contains')).toBe(true);
    expect(matchTrigger('PING', 'ping', 'exact')).toBe(true);
    expect(matchTrigger('Hello World', 'HELLO', 'starts')).toBe(true);
  });
});

describe('matchTrigger — pusty trigger NIGDY nie pasuje (anti-spam)', () => {
  it('pusty/whitespace trigger → false we wszystkich trybach', () => {
    for (const mode of ['contains', 'exact', 'starts'] as const) {
      expect(matchTrigger('jakakolwiek wiadomość', '', mode)).toBe(false);
    }
    // sam trigger pusty po normalizacji — exact na pustej treści też nie łapie
    expect(matchTrigger('', '', 'exact')).toBe(false);
  });
});
