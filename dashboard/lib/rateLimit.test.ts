// Rygiel sliding-window rate-limitu — pierwsza warstwa anty-flood publicznych sinków (/api/sentry,
// /api/hook). Regresja = albo limit blokuje legalny ruch (off-by-one), albo nigdy nie domyka okna
// (DoS przechodzi). Czas sterowany fałszywym zegarem (vi) → w pełni deterministyczne. Każdy przypadek
// używa UNIKATOWEGO klucza, bo `buckets` to stan modułowy współdzielony między testami.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clientIp, rateLimited } from './rateLimit';

describe('rateLimited — okno przesuwne', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('pierwsze `limit` żądań przechodzą, (limit+1)-te jest zablokowane', () => {
    const k = 'rl-basic';
    expect(rateLimited(k, 3)).toBe(false); // 1
    expect(rateLimited(k, 3)).toBe(false); // 2
    expect(rateLimited(k, 3)).toBe(false); // 3 (== limit, jeszcze ok)
    expect(rateLimited(k, 3)).toBe(true); // 4 (> limit → blok)
  });

  it('po upływie windowMs licznik się resetuje (stare znaczniki wypadają)', () => {
    const k = 'rl-reset';
    expect(rateLimited(k, 2, 60_000)).toBe(false); // 1 @0
    expect(rateLimited(k, 2, 60_000)).toBe(false); // 2 @0
    expect(rateLimited(k, 2, 60_000)).toBe(true); // 3 @0 → blok
    vi.setSystemTime(60_000); // całe okno minęło
    expect(rateLimited(k, 2, 60_000)).toBe(false); // reset → znów ok
  });

  it('granica okna jest ścisła (`now - t < windowMs`)', () => {
    const a = 'rl-edge-in';
    vi.setSystemTime(0);
    expect(rateLimited(a, 1, 60_000)).toBe(false); // @0
    vi.setSystemTime(59_999); // tuż przed granicą → stary nadal liczy
    expect(rateLimited(a, 1, 60_000)).toBe(true);

    const b = 'rl-edge-out';
    vi.setSystemTime(0);
    expect(rateLimited(b, 1, 60_000)).toBe(false); // @0
    vi.setSystemTime(60_000); // dokładnie windowMs → stary wygasa
    expect(rateLimited(b, 1, 60_000)).toBe(false);
  });

  it('izolacja kluczy — różne klucze mają osobne kubełki', () => {
    expect(rateLimited('rl-x', 1)).toBe(false);
    expect(rateLimited('rl-x', 1)).toBe(true); // x wyczerpany
    expect(rateLimited('rl-y', 1)).toBe(false); // y niezależny
  });
});

// Lekki mock Request — clientIp czyta tylko request.headers.get(name).
const req = (headers: Record<string, string>): Request =>
  ({
    headers: { get: (n: string) => headers[n.toLowerCase()] ?? null },
  }) as unknown as Request;

describe('clientIp — wyciąganie IP zza proxy', () => {
  it('XFF: pierwszy token, przycięty', () => {
    expect(clientIp(req({ 'x-forwarded-for': '1.2.3.4' }))).toBe('1.2.3.4');
    expect(clientIp(req({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.0.0.0' }))).toBe('1.2.3.4');
    expect(clientIp(req({ 'x-forwarded-for': '  1.2.3.4  , 5.6.7.8' }))).toBe('1.2.3.4');
  });

  it('brak XFF → x-real-ip', () => {
    expect(clientIp(req({ 'x-real-ip': '9.9.9.9' }))).toBe('9.9.9.9');
  });

  it('XFF ma pierwszeństwo nad x-real-ip', () => {
    expect(clientIp(req({ 'x-forwarded-for': '1.1.1.1', 'x-real-ip': '9.9.9.9' }))).toBe('1.1.1.1');
  });

  it('brak nagłówków → "unknown"', () => {
    expect(clientIp(req({}))).toBe('unknown');
  });
});
