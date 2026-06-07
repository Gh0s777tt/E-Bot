import { type AiHelpConfig, getAiHelpConfig, saveAiHelpConfig } from '../../../lib/community';
import { aihelpSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getAiHelpConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, aihelpSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveAiHelpConfig(parsed.data as AiHelpConfig);
  return Response.json({ ok: true, config: await getAiHelpConfig() });
}
