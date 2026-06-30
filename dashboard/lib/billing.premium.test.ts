// Rygiel logiki Premium (#668) — czyste helpery: wygasanie ręcznych nadań + kształt pól nadania.
// isPremiumActive: manual z datą w przeszłości → wygasa; stripe ignoruje datę (downgrade = webhook);
// free zawsze nieaktywne. premiumGrantFields: poprawne since/until dla nadania na X dni / bezterminowo.
import { describe, expect, it } from 'vitest';
import { isPremiumActive, premiumGrantFields } from './billing';

const NOW = Date.parse('2026-06-30T00:00:00.000Z');
const DAY = 86_400_000;

describe('isPremiumActive — wygasanie', () => {
  it('free / brak → nieaktywne', () => {
    expect(isPremiumActive('free', null, null, NOW)).toBe(false);
    expect(isPremiumActive(null, null, null, NOW)).toBe(false);
    expect(isPremiumActive(undefined, null, 'manual', NOW)).toBe(false);
  });

  it('manual bez daty końca → aktywne (bezterminowo)', () => {
    expect(isPremiumActive('premium', null, 'manual', NOW)).toBe(true);
  });

  it('manual z datą w przyszłości → aktywne', () => {
    expect(isPremiumActive('premium', new Date(NOW + DAY).toISOString(), 'manual', NOW)).toBe(true);
  });

  it('manual z datą w przeszłości → WYGASŁE', () => {
    expect(isPremiumActive('premium', new Date(NOW - DAY).toISOString(), 'manual', NOW)).toBe(
      false,
    );
  });

  it('stripe z datą w przeszłości → wciąż aktywne (downgrade robi webhook, nie data)', () => {
    expect(isPremiumActive('premium', new Date(NOW - DAY).toISOString(), 'stripe', NOW)).toBe(true);
  });

  it('zła data → nie wygasza (brak false-positive na śmieciowym premium_until)', () => {
    expect(isPremiumActive('premium', 'nie-data', 'manual', NOW)).toBe(true);
  });
});

describe('premiumGrantFields — kształt nadania', () => {
  it('days>0 → premium_until = now + days, źródło manual', () => {
    const f = premiumGrantFields(30, '123456789012345678', NOW);
    expect(f.tier).toBe('premium');
    expect(f.premium_source).toBe('manual');
    expect(f.premium_granted_by).toBe('123456789012345678');
    expect(f.premium_since).toBe(new Date(NOW).toISOString());
    expect(f.premium_until).toBe(new Date(NOW + 30 * DAY).toISOString());
  });

  it('days=null/0/ujemne → bezterminowo (premium_until null)', () => {
    expect(premiumGrantFields(null, '1', NOW).premium_until).toBeNull();
    expect(premiumGrantFields(0, '1', NOW).premium_until).toBeNull();
    expect(premiumGrantFields(-5, '1', NOW).premium_until).toBeNull();
  });
});
