// Rygiel formatera czasu względnego (relTime) — „2 dni temu" itp. na pulpicie. Deterministyczny:
// `now` wstrzykiwany (bez fałszywego zegara). Lustro Intl po stronie testu — asercje NIE zależą od
// dokładnego brzmienia ICU, tylko od wyboru jednostki + ilości (logika progów i zaokrągleń).
// KLUCZ: clamp przyszłości (ts > now) → 0 sekund ("teraz"), nigdy „za X" na pulpicie aktywności.
import { describe, expect, it } from 'vitest';
import { relTime } from './insights';

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0);
const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

// Lustro: ta sama jednostka/ilość przez Intl, więc test jest odporny na wersję ICU.
const rtf = new Intl.RelativeTimeFormat('pl', { numeric: 'auto' });
const want = (n: number, u: Intl.RelativeTimeFormatUnit) => rtf.format(-n, u);

describe('relTime — wybór jednostki i granice kubełków', () => {
  it('sekundy poniżej 60 s', () => {
    expect(relTime(NOW - 5 * SEC, NOW)).toBe(want(5, 'second'));
    expect(relTime(NOW - 59 * SEC, NOW)).toBe(want(59, 'second'));
  });

  it('granica 60 s → 1 minuta; minuty poniżej 60', () => {
    expect(relTime(NOW - 60 * SEC, NOW)).toBe(want(1, 'minute'));
    expect(relTime(NOW - 30 * MIN, NOW)).toBe(want(30, 'minute'));
  });

  it('godziny poniżej 24', () => {
    expect(relTime(NOW - 3 * HOUR, NOW)).toBe(want(3, 'hour'));
    expect(relTime(NOW - 23 * HOUR, NOW)).toBe(want(23, 'hour'));
  });

  it('RYGIEL granicy dni: 25 h → kubełek dni (1 dzień), 2 dni', () => {
    expect(relTime(NOW - 25 * HOUR, NOW)).toBe(want(1, 'day'));
    expect(relTime(NOW - 2 * DAY, NOW)).toBe(want(2, 'day'));
  });

  it('RYGIEL clampu przyszłości: ts > now → "teraz" (0 s), nie „za X"', () => {
    expect(relTime(NOW + 10 * SEC, NOW)).toBe(want(0, 'second'));
    expect(relTime(NOW + 5 * DAY, NOW)).toBe(want(0, 'second'));
  });

  it('honoruje język (en daje inną jednostkową frazę niż pl)', () => {
    const en = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    expect(relTime(NOW - 2 * DAY, NOW, 'en')).toBe(en.format(-2, 'day'));
  });
});
