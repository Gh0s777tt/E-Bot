import { getJoindmConfig, type JoindmConfig, saveJoindmConfig } from '../../../lib/community';
import { joindmSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getJoindmConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, joindmSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveJoindmConfig(parsed.data as JoindmConfig);
  return Response.json({ ok: true, config: await getJoindmConfig() });
}
