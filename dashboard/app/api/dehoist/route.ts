import { type DehoistConfig, getDehoistConfig, saveDehoistConfig } from '../../../lib/community';
import { dehoistSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getDehoistConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, dehoistSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveDehoistConfig(parsed.data as DehoistConfig);
  return Response.json({ ok: true, config: await getDehoistConfig() });
}
