// Rygiel DRY helpera cooldownu: `minutesSince` (store.mts) to JEDYNE źródło prawdy formuły
// null→Infinity / (Date.now()−Date.parse)/60_000. cards.mts i pets.mts re-eksportują je jako
// `minutesSinceIso` (zamiast trzymać własne kopie). Test pilnuje, że to TA SAMA funkcja — gdyby
// ktoś przywrócił lokalną kopię (ryzyko dryfu), referencja się rozjedzie i ten rygiel zwala.
import { describe, expect, it } from 'vitest';
import { minutesSinceIso as cardsMinutesSince } from './cards.mts';
import { minutesSinceIso as petsMinutesSince } from './pets.mts';
import { minutesSince } from './store.mts';

describe('cooldown — jedno źródło prawdy (minutesSince) we wszystkich modułach eko', () => {
  it('cards.minutesSinceIso === store.minutesSince (ta sama referencja, nie kopia)', () => {
    expect(cardsMinutesSince).toBe(minutesSince);
  });

  it('pets.minutesSinceIso === store.minutesSince (ta sama referencja, nie kopia)', () => {
    expect(petsMinutesSince).toBe(minutesSince);
  });
});
