import { type AutomodConfig, getAutomodConfig, saveAutomodConfig } from '../../../lib/community';
import { automodSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getAutomodConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, automodSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveAutomodConfig(parsed.data as AutomodConfig);
  return Response.json({ ok: true, config: await getAutomodConfig() });
}
