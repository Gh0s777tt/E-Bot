import { z } from 'zod';
import { parseCookie, SESSION_COOKIE } from '../../../../lib/auth';
import { parseBody } from '../../../../lib/schemas';
import { getAuthSecret, verifySession } from '../../../../lib/session';
import { hasSupabase, supabase } from '../../../../lib/supabase';
import { isOwner } from '../../../../lib/tenant';

export const dynamic = 'force-dynamic';

const schema = z.object({
  mode: z.enum(['guild', 'all']),
  guildId: z.string().max(40).optional(),
  confirm: z.string().max(60),
});

// Reset bazy — narzędzie DEVELOPERA. Bramka: TYLKO właściciel instancji (env DASHBOARD_OWNER_IDS) —
// NIE staff/tenant-admin (resolveRole='admin' to za mało). Twarde potwierdzenie: 'all' → confirm='RESET-ALL';
// 'guild' → confirm == guildId. Wykonanie przez RPC service_role (dev_reset_all / dev_reset_guild).
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
  const { mode, guildId, confirm } = parsed.data;

  if (mode === 'all') {
    if (confirm !== 'RESET-ALL') {
      return Response.json(
        { ok: false, error: 'Wpisz RESET-ALL, aby potwierdzić.' },
        { status: 400 },
      );
    }
    const { error } = await supabase().rpc('dev_reset_all');
    if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
    return Response.json({ ok: true, mode: 'all' });
  }

  if (!guildId || !/^\d{15,25}$/.test(guildId)) {
    return Response.json(
      { ok: false, error: 'Podaj poprawne ID serwera (15–25 cyfr).' },
      { status: 400 },
    );
  }
  if (confirm !== guildId) {
    return Response.json(
      { ok: false, error: 'Potwierdzenie musi być równe ID serwera.' },
      { status: 400 },
    );
  }
  const { error } = await supabase().rpc('dev_reset_guild', { p_guild: guildId });
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true, mode: 'guild', guildId });
}
