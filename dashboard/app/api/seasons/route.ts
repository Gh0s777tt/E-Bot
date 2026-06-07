import { getSeasonsConfig, type SeasonsConfig, saveSeasonsConfig } from '../../../lib/community';
import { parseBody, seasonsSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getSeasonsConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, seasonsSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveSeasonsConfig(parsed.data as SeasonsConfig);
  return Response.json({ ok: true, config: await getSeasonsConfig() });
}
