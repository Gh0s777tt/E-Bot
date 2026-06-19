import { z } from 'zod';
import { parseCookie, SESSION_COOKIE } from '../../../../lib/auth';
import { reviewCommunityPlugin } from '../../../../lib/communityPlugins';
import { resolveRole } from '../../../../lib/panelRoles';
import { parseBody } from '../../../../lib/schemas';
import { getAuthSecret, verifySession } from '../../../../lib/session';

export const dynamic = 'force-dynamic';

const reviewSchema = z.object({
  key: z.string().max(48),
  status: z.enum(['approved', 'rejected']),
});

// M6 — moderacja pluginu community (approve/reject). Tylko właściciel/staff INSTANCJI
// (resolveRole = 'admin'); tenant-admini (rola tylko w guild_members) → 403, bo katalog
// community jest globalny, nie per-serwer.
export async function POST(request: Request): Promise<Response> {
  const token = parseCookie(request.headers.get('cookie'))[SESSION_COOKIE];
  const session = token ? await verifySession(token, getAuthSecret()) : null;
  if (!session?.uid) return Response.json({ ok: false, error: 'brak sesji' }, { status: 401 });

  const role = await resolveRole(session.uid);
  if (role !== 'admin')
    return Response.json({ ok: false, error: 'brak uprawnień' }, { status: 403 });

  const parsed = await parseBody(request, reviewSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });

  const ok = await reviewCommunityPlugin(parsed.data.key, parsed.data.status);
  return Response.json({ ok }, { status: ok ? 200 : 400 });
}
