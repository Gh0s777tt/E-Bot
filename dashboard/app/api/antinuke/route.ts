import { type AntinukeConfig, getAntinuke, saveAntinuke } from '../../../lib/data';
import { antinukeSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getAntinuke());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, antinukeSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveAntinuke(parsed.data as AntinukeConfig);
  return Response.json({ ok: true, config: await getAntinuke() });
}
