import { parseCookie, SESSION_COOKIE } from '../../../../lib/auth';
import {
  communityEnabled,
  communityManifestSchema,
  submitCommunityPlugin,
} from '../../../../lib/communityPlugins';
import { parseBody } from '../../../../lib/schemas';
import { getAuthSecret, verifySession } from '../../../../lib/session';

export const dynamic = 'force-dynamic';

// M6 — zgłoszenie pluginu community (trafia do moderacji jako 'pending'). Gated env
// MARKETPLACE_COMMUNITY + wymaga sesji (autor = zalogowany uid). Bez flagi → 400.
export async function POST(request: Request): Promise<Response> {
  if (!communityEnabled()) {
    return Response.json({ ok: false, error: 'community wyłączone' }, { status: 400 });
  }
  const token = parseCookie(request.headers.get('cookie'))[SESSION_COOKIE];
  const session = token ? await verifySession(token, getAuthSecret()) : null;
  if (!session?.uid) return Response.json({ ok: false, error: 'brak sesji' }, { status: 401 });

  const parsed = await parseBody(request, communityManifestSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });

  const res = await submitCommunityPlugin(parsed.data, session.uid);
  return Response.json(res, { status: res.ok ? 200 : 400 });
}
