// Rygiel podpisanej sesji (signSession · verifySession · getAuthSecret) — HMAC-SHA256 na Web Crypto.
// To bramka autoryzacji panelu: podrobiona/zmanipulowana sesja = przejęcie konta. Czysty moduł
// (crypto.subtle, bez bazy/sieci). KLUCZ: zły sekret / podmieniony body / podmieniony podpis / wygaśnięcie
// → null; getAuthSecret fail-closed w produkcji (krótki/brak AUTH_SECRET → wyjątek, nie publiczny fallback).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAuthSecret, type Session, signSession, verifySession } from './session';

const SECRET = 'test-secret-key-0123456789';
const sess = (over: Partial<Session> = {}): Session => ({
  uid: '42',
  uname: 'Ghost',
  avatar: 'abc',
  role: 'admin',
  exp: Date.now() + 60_000,
  ...over,
});

describe('signSession / verifySession — round-trip i odporność na podrobienie', () => {
  it('round-trip: podpisana sesja weryfikuje się i zwraca payload', async () => {
    const p = sess();
    const got = await verifySession(await signSession(p, SECRET), SECRET);
    expect(got).toEqual(p);
  });

  it('RYGIEL: weryfikacja innym sekretem → null (anty-forge)', async () => {
    const token = await signSession(sess(), SECRET);
    expect(await verifySession(token, 'inny-sekret-0123456789')).toBeNull();
  });

  it('RYGIEL: podmieniony body (manipulacja payloadu) → null', async () => {
    const token = await signSession(sess(), SECRET);
    const [body, sig] = token.split('.');
    const tampered = `${body.slice(0, -1)}${body.at(-1) === 'A' ? 'B' : 'A'}.${sig}`;
    expect(await verifySession(tampered, SECRET)).toBeNull();
  });

  it('RYGIEL: podmieniony podpis (z innej sesji) → null', async () => {
    const [bodyA] = (await signSession(sess({ uid: 'A' }), SECRET)).split('.');
    const [, sigB] = (await signSession(sess({ uid: 'B' }), SECRET)).split('.');
    expect(await verifySession(`${bodyA}.${sigB}`, SECRET)).toBeNull();
  });

  it('token bez kropki / pusty / śmieci → null (nie rzuca)', async () => {
    for (const t of ['', 'bezkropki', '.', 'a.', '.b', 'losowe-śmieci'])
      expect(await verifySession(t, SECRET)).toBeNull();
  });

  it('RYGIEL wygaśnięcia: exp w przeszłości → null; brak exp → null; przyszłość → ważna', async () => {
    expect(await verifySession(await signSession(sess({ exp: 1 }), SECRET), SECRET)).toBeNull();
    expect(await verifySession(await signSession(sess({ exp: 0 }), SECRET), SECRET)).toBeNull();
    expect(
      await verifySession(await signSession(sess({ exp: Date.now() + 5_000 }), SECRET), SECRET),
    ).not.toBeNull();
  });
});

describe('getAuthSecret — fail-closed w produkcji', () => {
  // vi.stubEnv: NODE_ENV jest typowany read-only (typy Next) — stubEnv to obchodzi i czyści po teście.
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('AUTH_SECRET ≥16 znaków → zwrócony', () => {
    vi.stubEnv('AUTH_SECRET', 'a-bardzo-dlugi-sekret-256');
    expect(getAuthSecret()).toBe('a-bardzo-dlugi-sekret-256');
  });

  it('RYGIEL: produkcja (VERCEL=1) + krótki sekret → wyjątek (nie publiczny fallback)', () => {
    vi.stubEnv('AUTH_SECRET', 'krotki');
    vi.stubEnv('VERCEL', '1');
    expect(() => getAuthSecret()).toThrow();
  });

  it('RYGIEL: produkcja (NODE_ENV=production) + brak sekretu → wyjątek', () => {
    vi.stubEnv('AUTH_SECRET', undefined);
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL', undefined);
    expect(() => getAuthSecret()).toThrow();
  });

  it('lokalnie (nie-prod) + brak sekretu → dev-fallback (≥16, nie rzuca)', () => {
    vi.stubEnv('AUTH_SECRET', undefined);
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VERCEL', undefined);
    const s = getAuthSecret();
    expect(s.length).toBeGreaterThanOrEqual(16);
  });
});
