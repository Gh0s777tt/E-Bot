import { type AiDigestConfig, getAiDigestConfig, saveAiDigestConfig } from '../../../lib/community';
import { aidigestSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getAiDigestConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, aidigestSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveAiDigestConfig(parsed.data as AiDigestConfig);
  return Response.json({ ok: true, config: await getAiDigestConfig() });
}
