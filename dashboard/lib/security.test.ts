// Testy RDZENIA BEZPIECZEŃSTWA — czyste/kryptograficzne funkcje, najtańszy zysk pokrycia:
// HMAC sesji (podrabianie cookie), podpis webhooka Stripe (fałszywe upgrade'y),
// SSRF-guard runnera pluginów, maska uprawnień self-serve. Bez sieci/mocków.
import { describe, expect, it } from 'vitest';
import { canManageGuild } from './auth';
import { verifyStripeSignature } from './billing';
import { isSafeEndpoint } from './pluginRunner';
import { getAuthSecret, type Session, signSession, verifySession } from './session';

const SECRET = 'test-secret-at-least-16-chars';
const future = (): number => Date.now() + 60_000;

describe('sesja HMAC — signSession/verifySession', () => {
  it('round-trip: poprawnie podpisana sesja weryfikuje się i zwraca payload', async () => {
    const s: Session = { uid: '123', uname: 'tester', role: 'admin', exp: future() };
    const token = await signSession(s, SECRET);
    const out = await verifySession(token, SECRET);
    expect(out?.uid).toBe('123');
    expect(out?.role).toBe('admin');
  });

  it('zły sekret → null (podrobione cookie odrzucone)', async () => {
    const token = await signSession({ uid: '1', uname: 'x', exp: future() }, SECRET);
    expect(await verifySession(token, 'inny-sekret-16-znak')).toBeNull();
  });

  it('zmanipulowany token (zmieniony bajt body) → null', async () => {
    const token = await signSession(
      { uid: '1', uname: 'x', role: 'viewer', exp: future() },
      SECRET,
    );
    const tampered = (token[0] === 'A' ? 'B' : 'A') + token.slice(1);
    expect(await verifySession(tampered, SECRET)).toBeNull();
  });

  it('wygasła sesja (exp w przeszłości) → null', async () => {
    const token = await signSession({ uid: '1', uname: 'x', exp: Date.now() - 1000 }, SECRET);
    expect(await verifySession(token, SECRET)).toBeNull();
  });

  it('śmieciowy token → null (bez wyjątku)', async () => {
    expect(await verifySession('niepoprawny', SECRET)).toBeNull();
    expect(await verifySession('', SECRET)).toBeNull();
  });
});

describe('getAuthSecret — fail-closed', () => {
  it('zwraca AUTH_SECRET, gdy ustawiony i ≥16 znaków', () => {
    const prev = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET = 'dlugi-sekret-produkcyjny-32-znaki';
    expect(getAuthSecret()).toBe('dlugi-sekret-produkcyjny-32-znaki');
    if (prev === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = prev;
  });

  it('w produkcji bez AUTH_SECRET → rzuca (odmowa podrabialnego sekretu)', () => {
    const prevS = process.env.AUTH_SECRET;
    const prevV = process.env.VERCEL;
    delete process.env.AUTH_SECRET;
    process.env.VERCEL = '1';
    try {
      expect(() => getAuthSecret()).toThrow();
    } finally {
      if (prevS === undefined) delete process.env.AUTH_SECRET;
      else process.env.AUTH_SECRET = prevS;
      if (prevV === undefined) delete process.env.VERCEL;
      else process.env.VERCEL = prevV;
    }
  });
});

// Buduje nagłówek `Stripe-Signature` (t=…,v1=…) tym samym HMAC, co weryfikator.
async function stripeSig(body: string, secret: string, t: number): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${body}`));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `t=${t},v1=${hex}`;
}

describe('verifyStripeSignature — webhook anti-forge + anti-replay', () => {
  const secret = 'whsec_test_secret';
  const body = '{"id":"evt_1","type":"checkout.session.completed"}';
  const now = (): number => Math.floor(Date.now() / 1000);

  it('poprawny podpis w tolerancji → true', async () => {
    expect(await verifyStripeSignature(body, await stripeSig(body, secret, now()), secret)).toBe(
      true,
    );
  });

  it('zły podpis (v1) → false', async () => {
    expect(await verifyStripeSignature(body, `t=${now()},v1=deadbeef`, secret)).toBe(false);
  });

  it('stary timestamp (>5 min) → false (anty-replay)', async () => {
    const old = now() - 400;
    expect(await verifyStripeSignature(body, await stripeSig(body, secret, old), secret)).toBe(
      false,
    );
  });

  it('podmieniony body → false', async () => {
    const header = await stripeSig(body, secret, now());
    expect(await verifyStripeSignature('{"id":"evt_HACKED"}', header, secret)).toBe(false);
  });

  it('brak nagłówka lub sekretu → false', async () => {
    expect(await verifyStripeSignature(body, null, secret)).toBe(false);
    expect(await verifyStripeSignature(body, `t=${now()},v1=x`, '')).toBe(false);
  });
});

describe('isSafeEndpoint — SSRF-guard runnera pluginów', () => {
  it('publiczny https → true', () => {
    expect(isSafeEndpoint('https://example.com/webhook')).toBe(true);
    expect(isSafeEndpoint('https://api.partner.io/hook')).toBe(true);
  });

  it('http (nie-https) → false', () => {
    expect(isSafeEndpoint('http://example.com')).toBe(false);
  });

  it('loopback / prywatne / link-local / metadata → false', () => {
    for (const u of [
      'https://localhost/x',
      'https://app.localhost/x',
      'https://service.internal/x',
      'https://127.0.0.1/x',
      'https://0.0.0.0/x',
      'https://10.0.0.5/x',
      'https://192.168.1.1/x',
      'https://172.16.0.1/x',
      'https://169.254.169.254/latest/meta-data', // metadata chmury
      'https://[::1]/x', // IPv6 loopback (po naprawie strip nawiasów)
      'https://[fc00::1]/x',
      'https://[fe80::1]/x',
      'https://[::]/x', // unspecified (≈ 0.0.0.0)
      'https://[::ffff:127.0.0.1]/x', // IPv4-mapped IPv6 loopback (URL kanonikalizuje → ::ffff:7f00:1)
      'https://[::ffff:169.254.169.254]/x', // IPv4-mapped metadata chmury
      'https://[::ffff:10.0.0.1]/x', // IPv4-mapped prywatny
      'https://[::ffff:192.168.1.1]/x', // IPv4-mapped prywatny
    ]) {
      expect(isSafeEndpoint(u), u).toBe(false);
    }
  });

  it('śmieciowy URL → false', () => {
    expect(isSafeEndpoint('to nie url')).toBe(false);
    expect(isSafeEndpoint('')).toBe(false);
  });
});

describe('canManageGuild — maska MANAGE_GUILD (0x20)', () => {
  it('właściciel serwera → true', () => {
    expect(canManageGuild({ id: '1', name: 'g', owner: true, permissions: '0' })).toBe(true);
  });

  it('uprawnienie MANAGE_GUILD ustawione → true', () => {
    expect(canManageGuild({ id: '1', name: 'g', permissions: '32' })).toBe(true); // 0x20
    expect(canManageGuild({ id: '1', name: 'g', permissions: '48' })).toBe(true); // 0x20 | 0x10
  });

  it('brak MANAGE_GUILD i nie-owner → false', () => {
    expect(canManageGuild({ id: '1', name: 'g', permissions: '16' })).toBe(false); // tylko 0x10
    expect(canManageGuild({ id: '1', name: 'g' })).toBe(false); // brak permissions
  });

  it('niepoprawny permissions → false (bez wyjątku)', () => {
    expect(canManageGuild({ id: '1', name: 'g', permissions: 'xyz' })).toBe(false);
  });
});
