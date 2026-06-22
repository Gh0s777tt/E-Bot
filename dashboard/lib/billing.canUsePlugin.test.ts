// Rygiel bramki monetyzacji (canUsePlugin) — kto może użyć płatnego pluginu. Regresja = albo paywall
// przecieka (serwer `free` dostaje plugin `premium`), albo płacący serwer zablokowany (utrata UX/przychodu),
// albo billing WYŁĄCZONY przypadkowo paywalluje wszystkich. Gate zależy od env `STRIPE_SECRET_KEY`
// (bez klucza billing UŚPIONY → wszystko dostępne). canUsePlugin czyta env przy wywołaniu — sterujemy nim.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { canUsePlugin } from './billing';

const KEY = 'STRIPE_SECRET_KEY';
let prev: string | undefined;
beforeEach(() => {
  prev = process.env[KEY];
});
afterEach(() => {
  if (prev === undefined) delete process.env[KEY];
  else process.env[KEY] = prev;
});

describe('canUsePlugin — billing WYŁĄCZONY (brak STRIPE_SECRET_KEY)', () => {
  beforeEach(() => {
    delete process.env[KEY];
  });
  it('RYGIEL: brak paywalla — KAŻDA kombinacja dozwolona', () => {
    expect(canUsePlugin('free', 'free')).toBe(true);
    expect(canUsePlugin('free', 'premium')).toBe(true);
    expect(canUsePlugin('premium', 'free')).toBe(true); // bez billingu nie paywallujemy
    expect(canUsePlugin('premium', 'premium')).toBe(true);
  });
});

describe('canUsePlugin — billing WŁĄCZONY (STRIPE_SECRET_KEY ustawiony)', () => {
  beforeEach(() => {
    process.env[KEY] = 'sk_test_dummy';
  });

  it('plugin `free` zawsze dostępny (niezależnie od tieru serwera)', () => {
    expect(canUsePlugin('free', 'free')).toBe(true);
    expect(canUsePlugin('free', 'premium')).toBe(true);
  });

  it('RYGIEL: plugin `premium` na serwerze `free` → ZABLOKOWANY (paywall trzyma)', () => {
    expect(canUsePlugin('premium', 'free')).toBe(false);
  });

  it('plugin `premium` na serwerze `premium` → dozwolony', () => {
    expect(canUsePlugin('premium', 'premium')).toBe(true);
  });
});
