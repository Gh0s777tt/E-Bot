import { ecoSeasonSchema, parseBody } from '../../../lib/schemas';
import { type EcoSeasonConfig, getEcoSeason, saveEcoSeason } from '../../../lib/serverEconomy';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getEcoSeason());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, ecoSeasonSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveEcoSeason(parsed.data as EcoSeasonConfig);
  return Response.json({ ok: true, config: await getEcoSeason() });
}
