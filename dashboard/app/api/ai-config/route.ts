import { type AiConfig, getAiConfig, saveAiConfig } from '../../../lib/faza4';
import { isInstanceAdminRequest } from '../../../lib/panelRoles';
import { aiConfigSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getAiConfig());
}

// Config AI GLOBALNY (limity/model dla całej instancji) → zapis bramkowany instance-admin.
export async function POST(request: Request): Promise<Response> {
  if (!(await isInstanceAdminRequest(request))) {
    return Response.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  const parsed = await parseBody(request, aiConfigSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveAiConfig(parsed.data as AiConfig);
  return Response.json({ ok: true, config: await getAiConfig() });
}
