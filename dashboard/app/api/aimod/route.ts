import { recordAudit } from '../../../lib/audit';
import { type AiModConfig, getAiModConfig, saveAiModConfig } from '../../../lib/community';
import { aimodSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getAiModConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, aimodSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveAiModConfig(parsed.data as AiModConfig);
  await recordAudit(request, 'aimod');
  return Response.json({ ok: true, config: await getAiModConfig() });
}
