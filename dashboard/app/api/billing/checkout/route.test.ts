// Test kontraktowy trasy (audyt A-2): żądanie → odpowiedź, na prawdziwym `Request`/`Response`.
// Trasa startuje Stripe Checkout, więc kontrakt pilnuje dwóch rzeczy naraz: statusów/kształtu JSON
// ORAZ tego, że chokepoint autoryzacji (sesja → getPrimaryGuildId) nie da kupić premium cudzemu
// serwerowi. Zamockowane są tylko granice (sesja, serwer, Stripe) — `lib/auth` chodzi prawdziwy,
// bo `parseCookie`/`getOrigin` to czyste funkcje i chcemy je mieć w kontrakcie.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../lib/session', () => ({
  getAuthSecret: () => 'sekret-testowy',
  verifySession: vi.fn(),
}));
vi.mock('../../../../lib/guild', () => ({ getPrimaryGuildId: vi.fn() }));
vi.mock('../../../../lib/billing', () => ({ createCheckoutSession: vi.fn() }));

import { createCheckoutSession } from '../../../../lib/billing';
import { getPrimaryGuildId } from '../../../../lib/guild';
import { verifySession } from '../../../../lib/session';
import { POST } from './route';

const verify = vi.mocked(verifySession);
const primaryGuild = vi.mocked(getPrimaryGuildId);
const checkout = vi.mocked(createCheckoutSession);

// SESSION_COOKIE = 'ebot_session' (lib/auth) — nazwa jest częścią kontraktu, więc wpisana wprost.
function req(opts: { cookie?: string; body?: unknown; host?: string } = {}): Request {
  const headers: Record<string, string> = { host: opts.host ?? 'panel.e-forge.test' };
  if (opts.cookie !== undefined) headers.cookie = opts.cookie;
  return new Request('https://panel.e-forge.test/api/billing/checkout', {
    method: 'POST',
    headers,
    body: opts.body === undefined ? undefined : String(opts.body),
  });
}

const zalogowany = (cookie = `ebot_session=tok`) => req({ cookie });

beforeEach(() => {
  vi.clearAllMocks();
  verify.mockResolvedValue({ uid: '111' } as never);
  primaryGuild.mockResolvedValue('999');
  checkout.mockResolvedValue('https://checkout.stripe.com/c/pay/abc');
});

describe('POST /api/billing/checkout — kontrakt', () => {
  it('bez ciasteczka sesji → 401 i zero ruchu do Stripe', async () => {
    const res = await POST(req());
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ ok: false, error: 'brak sesji' });
    expect(checkout).not.toHaveBeenCalled();
  });

  it('ciasteczko z niepoprawnym tokenem → 401 (sesja nie przechodzi weryfikacji)', async () => {
    verify.mockResolvedValue(null);
    const res = await POST(zalogowany('ebot_session=podrobka'));
    expect(res.status).toBe(401);
    expect(checkout).not.toHaveBeenCalled();
  });

  it('sesja bez `uid` → 401 (sam podpisany token nie wystarcza)', async () => {
    verify.mockResolvedValue({} as never);
    const res = await POST(zalogowany());
    expect(res.status).toBe(401);
    expect(checkout).not.toHaveBeenCalled();
  });

  it('zalogowany bez serwera → 400 „brak serwera", nadal bez ruchu do Stripe', async () => {
    primaryGuild.mockResolvedValue('');
    const res = await POST(zalogowany());
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ ok: false, error: 'brak serwera' });
    expect(checkout).not.toHaveBeenCalled();
  });

  it('uśpiony billing (brak kluczy Stripe → null) → 400 „billing nieskonfigurowany"', async () => {
    checkout.mockResolvedValue(null);
    const res = await POST(zalogowany());
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ ok: false, error: 'billing nieskonfigurowany' });
  });

  it('happy path → 200 { ok: true, url } z adresem Stripe', async () => {
    const res = await POST(zalogowany());
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      ok: true,
      url: 'https://checkout.stripe.com/c/pay/abc',
    });
  });

  it('kupuje ZAWSZE dla serwera z chokepointu, nigdy dla id podanego w body', async () => {
    await POST(req({ cookie: 'ebot_session=tok', body: JSON.stringify({ guildId: '666' }) }));
    expect(checkout).toHaveBeenCalledWith('999', expect.any(String), 'month');
  });

  it('origin liczony z nagłówków żądania (trafia do URL-i powrotnych Stripe)', async () => {
    await POST(req({ cookie: 'ebot_session=tok', host: 'panel.e-forge.test' }));
    expect(checkout).toHaveBeenCalledWith('999', 'https://panel.e-forge.test', 'month');
  });

  it.each([
    'month',
    'quarter',
    'half',
    'year',
  ])('plan „%s" z body idzie do Stripe', async (plan) => {
    await POST(req({ cookie: 'ebot_session=tok', body: JSON.stringify({ plan }) }));
    expect(checkout).toHaveBeenCalledWith('999', expect.any(String), plan);
  });

  it('nieznany plan → fallback na miesięczny (bez 500 i bez zgadywania ceny)', async () => {
    await POST(req({ cookie: 'ebot_session=tok', body: JSON.stringify({ plan: 'dekada' }) }));
    expect(checkout).toHaveBeenCalledWith('999', expect.any(String), 'month');
  });

  it('zepsute body → fallback na miesięczny, odpowiedź nadal 200', async () => {
    const res = await POST(req({ cookie: 'ebot_session=tok', body: '{nie-json' }));
    expect(res.status).toBe(200);
    expect(checkout).toHaveBeenCalledWith('999', expect.any(String), 'month');
  });

  it('puste body → fallback na miesięczny', async () => {
    await POST(zalogowany());
    expect(checkout).toHaveBeenCalledWith('999', expect.any(String), 'month');
  });
});
