// Rygiel uwierzytelnienia mostu bot→panel (bridgeAuthorized · bridgeReady) — bramka tras /api/internal/*.
// To granica service-to-service: zła weryfikacja Bearer = obcy może wołać wewnętrzne trasy bota.
// Kluczowe: PUSTY sekret/token NIE może autoryzować (guard token.length > 0), porównanie w stałym czasie.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { bridgeAuthorized, bridgeReady } from './pluginBridge';

const SECRET = 'bridge-secret-32-znaki-mocny-klucz';
const SK = 'PLUGIN_BRIDGE_SECRET';
const CK = 'MARKETPLACE_COMMUNITY';
let prevS: string | undefined;
let prevC: string | undefined;
beforeEach(() => {
  prevS = process.env[SK];
  prevC = process.env[CK];
});
afterEach(() => {
  if (prevS === undefined) delete process.env[SK];
  else process.env[SK] = prevS;
  if (prevC === undefined) delete process.env[CK];
  else process.env[CK] = prevC;
});

const req = (authHeader?: string): Request =>
  ({
    headers: {
      get: (n: string) => (n.toLowerCase() === 'authorization' ? (authHeader ?? null) : null),
    },
  }) as unknown as Request;

describe('bridgeAuthorized — poprawny sekret ustawiony', () => {
  beforeEach(() => {
    process.env[SK] = SECRET;
  });

  it('poprawny `Bearer <secret>` → true', () => {
    expect(bridgeAuthorized(req(`Bearer ${SECRET}`))).toBe(true);
  });

  it('zły token / brak nagłówka / inny schemat → false', () => {
    expect(bridgeAuthorized(req('Bearer zly-token'))).toBe(false);
    expect(bridgeAuthorized(req())).toBe(false);
    expect(bridgeAuthorized(req(`Basic ${SECRET}`))).toBe(false); // nie-Bearer
  });

  it('`Bearer ` z pustym tokenem → false', () => {
    expect(bridgeAuthorized(req('Bearer '))).toBe(false);
  });

  it('token o innej długości → false (constant-time guard długości)', () => {
    expect(bridgeAuthorized(req(`Bearer ${SECRET}x`))).toBe(false);
    expect(bridgeAuthorized(req(`Bearer ${SECRET.slice(0, -1)}`))).toBe(false);
  });
});

describe('bridgeAuthorized — RYGIEL: pusty sekret nie autoryzuje', () => {
  it('brak PLUGIN_BRIDGE_SECRET + `Bearer ` (pusty token) → false (nie pusty==pusty)', () => {
    delete process.env[SK];
    expect(bridgeAuthorized(req('Bearer '))).toBe(false);
    expect(bridgeAuthorized(req('Bearer cokolwiek'))).toBe(false);
  });
});

describe('bridgeReady — env-gated (sekret ≥16 + community ON)', () => {
  it('sekret ≥16 + MARKETPLACE_COMMUNITY=1 → true', () => {
    process.env[SK] = SECRET;
    process.env[CK] = '1';
    expect(bridgeReady()).toBe(true);
  });

  it('sekret < 16 znaków → false (odmowa na słabym)', () => {
    process.env[SK] = 'krotki';
    process.env[CK] = '1';
    expect(bridgeReady()).toBe(false);
  });

  it('brak sekretu → false', () => {
    delete process.env[SK];
    process.env[CK] = '1';
    expect(bridgeReady()).toBe(false);
  });

  it('community OFF (mimo mocnego sekretu) → false', () => {
    process.env[SK] = SECRET;
    delete process.env[CK];
    expect(bridgeReady()).toBe(false);
  });
});
