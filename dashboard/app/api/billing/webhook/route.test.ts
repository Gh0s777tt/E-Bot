// Test kontraktowy trasy (audyt A-2): żądanie → odpowiedź, na prawdziwym `Request`/`Response`.
// To najbardziej wrażliwa trasa mutująca w repo — decyduje, kto ma premium, a wołający jest
// niezalogowany (Stripe). Kontrakt pilnuje więc kolejności bramek (secret → podpis → JSON),
// mapowania eventów na zmiany tieru oraz tego, że nieznany event nie wywraca webhooka.
// Sam HMAC ma własne testy jednostkowe (`lib/billing.stripe-sig.test.ts`) — tutaj jest zamockowany,
// żeby testować TRASĘ, nie kryptografię.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../lib/billing', () => ({
  verifyStripeSignature: vi.fn(),
  setGuildTier: vi.fn(),
  setPremiumUntilBySub: vi.fn(),
  downgradeBySubscription: vi.fn(),
}));
vi.mock('../../../../lib/sentry', () => ({ captureError: vi.fn() }));

import {
  downgradeBySubscription,
  setGuildTier,
  setPremiumUntilBySub,
  verifyStripeSignature,
} from '../../../../lib/billing';
import { captureError } from '../../../../lib/sentry';
import { POST } from './route';

const verifySig = vi.mocked(verifyStripeSignature);
const setTier = vi.mocked(setGuildTier);
const setUntil = vi.mocked(setPremiumUntilBySub);
const downgrade = vi.mocked(downgradeBySubscription);
const sentry = vi.mocked(captureError);

function hook(body: unknown, sig = 't=1,v1=deadbeef'): Request {
  return new Request('https://panel.e-forge.test/api/billing/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': sig },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test');
  verifySig.mockResolvedValue(true);
  setTier.mockResolvedValue(true);
});

describe('POST /api/billing/webhook — bramki wejściowe', () => {
  it('bez STRIPE_WEBHOOK_SECRET → 400 „billing off", podpis nawet nie sprawdzany', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');
    const res = await POST(hook({ type: 'checkout.session.completed' }));
    expect(res.status).toBe(400);
    await expect(res.text()).resolves.toBe('billing off');
    expect(verifySig).not.toHaveBeenCalled();
  });

  it('zły podpis → 400 i ZERO zmian tieru (obcy nie nada sobie premium)', async () => {
    verifySig.mockResolvedValue(false);
    const res = await POST(
      hook({
        type: 'checkout.session.completed',
        data: { object: { client_reference_id: '999' } },
      }),
    );
    expect(res.status).toBe(400);
    await expect(res.text()).resolves.toBe('bad signature');
    expect(setTier).not.toHaveBeenCalled();
    expect(downgrade).not.toHaveBeenCalled();
  });

  it('podpis liczony z SUROWEGO body, nie z przeparsowanego obiektu', async () => {
    const raw = '{"type":"nieznany.event","data":{"object":{}}}';
    await POST(hook(raw));
    expect(verifySig).toHaveBeenCalledWith(raw, 't=1,v1=deadbeef', 'whsec_test');
  });

  it('zły JSON po POPRAWNYM podpisie → 400 + zgłoszenie do Sentry (to anomalia)', async () => {
    const res = await POST(hook('{nie-json'));
    expect(res.status).toBe(400);
    await expect(res.text()).resolves.toBe('bad json');
    expect(sentry).toHaveBeenCalledWith(expect.stringContaining('zły JSON'), { label: 'billing' });
  });

  it('nieznany typ eventu → 200 (Stripe nie ma czego ponawiać)', async () => {
    const res = await POST(hook({ type: 'invoice.paid', data: { object: { id: 'in_1' } } }));
    expect(res.status).toBe(200);
    expect(setTier).not.toHaveBeenCalled();
    expect(setUntil).not.toHaveBeenCalled();
    expect(downgrade).not.toHaveBeenCalled();
  });
});

describe('POST /api/billing/webhook — checkout.session.completed', () => {
  const done = (object: Record<string, unknown>) =>
    hook({ type: 'checkout.session.completed', data: { object } });

  it('nadaje premium po `client_reference_id` i zapisuje id-ki Stripe', async () => {
    const res = await POST(
      done({ client_reference_id: '999', customer: 'cus_1', subscription: 'sub_1' }),
    );
    expect(res.status).toBe(200);
    expect(setTier).toHaveBeenCalledWith('999', 'premium', {
      customerId: 'cus_1',
      subId: 'sub_1',
    });
  });

  it('gdy brak `client_reference_id` — bierze `metadata.guild_id`', async () => {
    await POST(done({ metadata: { guild_id: '777' } }));
    expect(setTier).toHaveBeenCalledWith('777', 'premium', expect.anything());
  });

  it('bez żadnego id serwera → 200, ale nikomu nie nadaje premium', async () => {
    const res = await POST(done({ customer: 'cus_1' }));
    expect(res.status).toBe(200);
    expect(setTier).not.toHaveBeenCalled();
  });

  it('nietekstowe `customer`/`subscription` → pomijane zamiast trafić jako śmieć do bazy', async () => {
    await POST(done({ client_reference_id: '999', customer: 42, subscription: null }));
    expect(setTier).toHaveBeenCalledWith('999', 'premium', {
      customerId: undefined,
      subId: undefined,
    });
  });

  it('opłacony upgrade, który NIE zapisał tieru → Sentry (user płaci, premium nie ma)', async () => {
    setTier.mockResolvedValue(false);
    const res = await POST(done({ client_reference_id: '999' }));
    expect(res.status).toBe(200);
    expect(sentry).toHaveBeenCalledWith(expect.stringContaining('999'), { label: 'billing' });
  });
});

describe('POST /api/billing/webhook — cykl życia subskrypcji', () => {
  const sub = (type: string, object: Record<string, unknown>) => hook({ type, data: { object } });
  const PERIOD_END = 1_800_000_000; // sekundy Stripe → ISO

  it.each(['active', 'trialing'])('status „%s" → odświeżenie daty końca okresu', async (status) => {
    await POST(
      sub('customer.subscription.updated', {
        id: 'sub_1',
        status,
        current_period_end: PERIOD_END,
      }),
    );
    expect(setUntil).toHaveBeenCalledWith('sub_1', new Date(PERIOD_END * 1000).toISOString());
    expect(downgrade).not.toHaveBeenCalled();
  });

  it('brak `current_period_end` → data czyszczona (null), nie zgadywana', async () => {
    await POST(sub('customer.subscription.created', { id: 'sub_1', status: 'active' }));
    expect(setUntil).toHaveBeenCalledWith('sub_1', null);
  });

  it.each([
    'canceled',
    'unpaid',
    'incomplete_expired',
  ])('status „%s" → downgrade do free', async (status) => {
    await POST(sub('customer.subscription.updated', { id: 'sub_1', status }));
    expect(downgrade).toHaveBeenCalledWith('sub_1');
    expect(setUntil).not.toHaveBeenCalled();
  });

  it('status pośredni („past_due") nie rusza tieru — Stripe jeszcze ponawia płatność', async () => {
    await POST(sub('customer.subscription.updated', { id: 'sub_1', status: 'past_due' }));
    expect(setUntil).not.toHaveBeenCalled();
    expect(downgrade).not.toHaveBeenCalled();
  });

  it('`customer.subscription.deleted` → downgrade po id subskrypcji', async () => {
    const res = await POST(sub('customer.subscription.deleted', { id: 'sub_9' }));
    expect(res.status).toBe(200);
    expect(downgrade).toHaveBeenCalledWith('sub_9');
  });

  it('event subskrypcji bez `id` → 200 i żadnej mutacji', async () => {
    await POST(sub('customer.subscription.deleted', { status: 'canceled' }));
    expect(downgrade).not.toHaveBeenCalled();
  });
});
