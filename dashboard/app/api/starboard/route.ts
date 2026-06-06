import { getStarboard, type StarboardConfig, saveStarboard } from '../../../lib/engagement';
import { parseBody, starboardSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getStarboard());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, starboardSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveStarboard(parsed.data as StarboardConfig);
  return Response.json({ ok: true, config: await getStarboard() });
}
