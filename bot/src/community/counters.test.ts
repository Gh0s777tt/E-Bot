// Rygiel nazwy kanału-licznika (counterName) — wyłoniony behavior-preserving z `tick`. KLUCZ: podstawia
// PIERWSZE `{count}` formatem pl-PL (separator tysięcy) i przycina do 100 znaków — TWARDY limit nazwy
// kanału Discorda; dłuższa nazwa → API odrzuca `setName`, licznik przestaje się aktualizować. Format
// asertujemy lustrem Intl (odporne na wersję ICU). Regresja = zawieszony licznik albo surowe `{count}`.
import { describe, expect, it } from 'vitest';
import { counterName } from './counters.mts';

describe('counterName — nazwa kanału-licznika', () => {
  it('podstawia {count} liczbą w formacie pl-PL (separator tysięcy)', () => {
    expect(counterName('Członkowie: {count}', 1234)).toBe(
      `Członkowie: ${(1234).toLocaleString('pl-PL')}`,
    );
  });

  it('RYGIEL twardego limitu 100 znaków (limit nazwy kanału Discorda)', () => {
    const out = counterName(`${'X'.repeat(150)}{count}`, 5);
    expect(out).toHaveLength(100);
  });

  it('RYGIEL „tylko pierwsze {count}" (semantyka String.replace)', () => {
    expect(counterName('{count}-{count}', 12)).toBe('12-{count}');
  });

  it('brak {count} → szablon bez zmian (też przycięty do 100)', () => {
    expect(counterName('Online', 7)).toBe('Online');
  });
});
