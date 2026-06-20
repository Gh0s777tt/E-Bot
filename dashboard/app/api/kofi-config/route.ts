// Config donejtów Ko-fi (GLOBALNY, single-instance). Webhook jest osobno w /api/kofi (publiczny).
// Bramka isInstanceAdminRequest: w self-serve tenant-admin (session.role='admin', resolveRole=null)
// NIE może odczytać sekretu `verificationToken` (GET) ani nadpisać globalnej konfiguracji (POST).
import { getKofiConfig, type KofiConfig, saveKofiConfig } from '../../../lib/community';
import { isInstanceAdminRequest } from '../../../lib/panelRoles';
import { kofiSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  if (!(await isInstanceAdminRequest(request))) {
    return Response.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  return Response.json(await getKofiConfig());
}

export async function POST(request: Request): Promise<Response> {
  if (!(await isInstanceAdminRequest(request))) {
    return Response.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  const parsed = await parseBody(request, kofiSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveKofiConfig(parsed.data as KofiConfig);
  return Response.json({ ok: true, config: await getKofiConfig() });
}
