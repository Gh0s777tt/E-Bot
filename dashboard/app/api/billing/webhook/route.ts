import {
  downgradeBySubscription,
  setGuildTier,
  verifyStripeSignature,
} from '../../../../lib/billing';

export const dynamic = 'force-dynamic';

// M5 — webhook Stripe: weryfikacja podpisu (HMAC), potem aktualizacja guilds.tier:
//  • checkout.session.completed       → premium (+ zapis stripe ids)
//  • customer.subscription.deleted    → free (po stripe_sub_id)
// Bez STRIPE_WEBHOOK_SECRET → 400 (billing uśpiony). Zawsze 2xx przy obsłużonym/nieznanym evencie.
export async function POST(request: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response('billing off', { status: 400 });

  const raw = await request.text();
  const valid = await verifyStripeSignature(raw, request.headers.get('stripe-signature'), secret);
  if (!valid) return new Response('bad signature', { status: 400 });

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(raw) as typeof event;
  } catch {
    return new Response('bad json', { status: 400 });
  }

  const obj = event.data?.object ?? {};
  if (event.type === 'checkout.session.completed') {
    const meta = obj.metadata as Record<string, unknown> | undefined;
    const guildId = String(obj.client_reference_id ?? meta?.guild_id ?? '');
    if (guildId) {
      await setGuildTier(guildId, 'premium', {
        customerId: typeof obj.customer === 'string' ? obj.customer : undefined,
        subId: typeof obj.subscription === 'string' ? obj.subscription : undefined,
      });
    }
  } else if (event.type === 'customer.subscription.deleted') {
    const subId = typeof obj.id === 'string' ? obj.id : '';
    if (subId) await downgradeBySubscription(subId);
  }
  return new Response('ok', { status: 200 });
}
