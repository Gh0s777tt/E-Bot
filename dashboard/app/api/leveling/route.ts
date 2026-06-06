import { getLevelingConfig, type LevelingConfig, saveLevelingConfig } from '../../../lib/faza4';
import { levelingSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getLevelingConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, levelingSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveLevelingConfig(parsed.data as LevelingConfig);
  return Response.json({ ok: true, config: await getLevelingConfig() });
}
