import { getOrigin, parseCookie, SESSION_COOKIE } from '../../../../lib/auth';
import { createCheckoutSession } from '../../../../lib/billing';
import { getPrimaryGuildId } from '../../../../lib/guild';
import { getAuthSecret, verifySession } from '../../../../lib/session';

export const dynamic = 'force-dynamic';

// M5 — start Stripe Checkout dla AKTUALNEGO serwera użytkownika (przez chokepoint
// getPrimaryGuildId → user może kupić premium tylko dla SWOJEGO serwera). Wymaga sesji.
// Bez kluczy Stripe → 400 (billing uśpiony).
export async function POST(request: Request): Promise<Response> {
  const token = parseCookie(request.headers.get('cookie'))[SESSION_COOKIE];
  const session = token ? await verifySession(token, getAuthSecret()) : null;
  if (!session?.uid) return Response.json({ ok: false, error: 'brak sesji' }, { status: 401 });

  const guildId = await getPrimaryGuildId();
  if (!guildId) return Response.json({ ok: false, error: 'brak serwera' }, { status: 400 });

  const url = await createCheckoutSession(guildId, getOrigin(request));
  if (!url)
    return Response.json({ ok: false, error: 'billing nieskonfigurowany' }, { status: 400 });
  return Response.json({ ok: true, url });
}
