import {
  type FreeGamesConfig,
  getFreeGamesConfig,
  saveFreeGamesConfig,
} from '../../../lib/community';
import { freegamesSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getFreeGamesConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, freegamesSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveFreeGamesConfig(parsed.data as FreeGamesConfig);
  return Response.json({ ok: true, config: await getFreeGamesConfig() });
}
