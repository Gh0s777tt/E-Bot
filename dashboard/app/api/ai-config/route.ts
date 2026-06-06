import { type AiConfig, getAiConfig, saveAiConfig } from '../../../lib/faza4';
import { aiConfigSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getAiConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, aiConfigSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveAiConfig(parsed.data as AiConfig);
  return Response.json({ ok: true, config: await getAiConfig() });
}
