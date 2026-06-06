import { getAntinuke, saveAntinuke, type AntinukeConfig } from '../../../lib/data';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getAntinuke());
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as AntinukeConfig;
    await saveAntinuke(body);
    return Response.json({ ok: true, config: await getAntinuke() });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}
