// Pulpit 2.0 — przełącznik raidmode z panelu. Flaga w settings 'raidmode' ('1'/'');
// bot czyta ją w anti-raidzie (refresh ≤30 s) i wyrzuca nowe wejścia, póki włączona.
import { z } from 'zod';
import { getRawSetting, setRawSetting } from '../../../lib/data';
import { parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

const schema = z.object({ on: z.boolean() });

export async function GET(): Promise<Response> {
  const raw = await getRawSetting('raidmode');
  return Response.json({ on: raw === '1' });
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, schema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await setRawSetting('raidmode', parsed.data.on ? '1' : '');
  return Response.json({ ok: true, on: parsed.data.on });
}
