import { type AntiRaidConfig, getAntiRaidConfig, saveAntiRaidConfig } from '../../../lib/community';
import { antiraidSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getAntiRaidConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, antiraidSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveAntiRaidConfig(parsed.data as AntiRaidConfig);
  return Response.json({ ok: true, config: await getAntiRaidConfig() });
}
