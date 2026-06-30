import { z } from 'zod';
import { parseCookie, SESSION_COOKIE } from '../../../../lib/auth';
import { grantPremium, revokePremium } from '../../../../lib/billing';
import { parseBody } from '../../../../lib/schemas';
import { getAuthSecret, verifySession } from '../../../../lib/session';
import { hasSupabase } from '../../../../lib/supabase';
import { isOwner } from '../../../../lib/tenant';

export const dynamic = 'force-dynamic';

// Nadawanie / odbieranie Premium — narzędzie WŁAŚCICIELA (env DASHBOARD_OWNER_IDS), nie staff/tenant-admin.
//  • grant  → guilds.tier=premium, source='manual', granted_by=uid, until=now+days (days≤0 → bezterminowo)
//  • revoke → tier=free + czyszczenie pól Premium
// Bramka identyczna jak /api/dev/reset. Bez Supabase → 400.
const schema = z.object({
  action: z.enum(['grant', 'revoke']),
  guildId: z.string().regex(/^\d{15,25}$/, 'ID serwera = 15–25 cyfr.'),
  days: z.number().int().min(0).max(3650).optional(),
});

export async function POST(request: Request): Promise<Response> {
  const token = parseCookie(request.headers.get('cookie'))[SESSION_COOKIE];
  const s = token ? await verifySession(token, getAuthSecret()) : null;
  if (!s?.uid || !isOwner(s.uid)) {
    return Response.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  if (!hasSupabase) {
    return Response.json(
      { ok: false, error: 'Brak bazy (Supabase niezskonfigurowane).' },
      { status: 400 },
    );
  }

  const parsed = await parseBody(request, schema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const { action, guildId, days } = parsed.data;

  const ok =
    action === 'grant'
      ? await grantPremium(guildId, days && days > 0 ? days : null, s.uid)
      : await revokePremium(guildId);

  return ok
    ? Response.json({ ok: true, action, guildId })
    : Response.json({ ok: false, error: 'Zapis nie powiódł się.' }, { status: 500 });
}
