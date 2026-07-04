import { describe, expect, it } from 'vitest';
import { verifyStripeSignature } from './billing';

const SECRET = 'whsec_testowy_sekret_123';

// Generuje prawdziwy nagłówek Stripe-Signature: `t=<ts>,v1=<HMAC-SHA256(t.body)>`.
async function sign(body: string, secret: string, ts: number): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(`${ts}.${body}`));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `t=${ts},v1=${hex}`;
}

const now = () => Math.floor(Date.now() / 1000);

describe('verifyStripeSignature — webhook Stripe (chroni nadania Premium)', () => {
  const body = JSON.stringify({ type: 'checkout.session.completed', id: 'evt_1' });

  it('poprawny świeży podpis → true', async () => {
    const h = await sign(body, SECRET, now());
    expect(await verifyStripeSignature(body, h, SECRET)).toBe(true);
  });

  it('zły sekret → false (obcy nie podrobi nadania Premium)', async () => {
    const h = await sign(body, 'whsec_INNY', now());
    expect(await verifyStripeSignature(body, h, SECRET)).toBe(false);
  });

  it('zmodyfikowane body → false (podpis nie pasuje)', async () => {
    const h = await sign(body, SECRET, now());
    const tampered = body.replace('evt_1', 'evt_HACK');
    expect(await verifyStripeSignature(tampered, h, SECRET)).toBe(false);
  });

  it('podmieniony v1 → false', async () => {
    const h = await sign(body, SECRET, now());
    const broken = h.replace(/v1=.*/, 'v1=deadbeef');
    expect(await verifyStripeSignature(body, broken, SECRET)).toBe(false);
  });

  it('ANTY-REPLAY: podpis starszy niż 300 s → false', async () => {
    const old = await sign(body, SECRET, now() - 400);
    expect(await verifyStripeSignature(body, old, SECRET)).toBe(false);
  });

  it('podpis z przyszłości poza tolerancją (>300 s) → false', async () => {
    const future = await sign(body, SECRET, now() + 400);
    expect(await verifyStripeSignature(body, future, SECRET)).toBe(false);
  });

  it('brak nagłówka / brak sekretu / śmieciowy nagłówek → false (fail-closed)', async () => {
    expect(await verifyStripeSignature(body, null, SECRET)).toBe(false);
    expect(await verifyStripeSignature(body, await sign(body, SECRET, now()), '')).toBe(false);
    expect(await verifyStripeSignature(body, 'losowe-śmieci', SECRET)).toBe(false);
    expect(await verifyStripeSignature(body, 't=abc,v1=xyz', SECRET)).toBe(false); // t nie-liczba
    expect(await verifyStripeSignature(body, `t=${now()}`, SECRET)).toBe(false); // brak v1
  });
});
