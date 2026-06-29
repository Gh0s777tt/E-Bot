import { type AppealsConfig, getAppealsConfig, saveAppealsConfig } from '../../../lib/community';
import { appealsConfigSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getAppealsConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, appealsConfigSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveAppealsConfig(parsed.data as AppealsConfig);
  return Response.json({ ok: true, config: await getAppealsConfig() });
}
