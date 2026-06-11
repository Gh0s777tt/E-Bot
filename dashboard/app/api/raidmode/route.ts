// Pulpit 2.0 — przełącznik raidmode z panelu. PER-SERWER: flaga w settings wybranego serwera
// (g:<id>:raidmode, '1'/''); bot czyta ją świeżo przy każdym wejściu i wyrzuca nowe wejścia.
import { z } from 'zod';
import { getGuildRawSetting, setGuildRawSetting } from '../../../lib/data';
import { parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

const schema = z.object({ on: z.boolean() });

export async function GET(): Promise<Response> {
  const raw = await getGuildRawSetting('raidmode');
  return Response.json({ on: raw === '1' });
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, schema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await setGuildRawSetting('raidmode', parsed.data.on ? '1' : '');
  return Response.json({ ok: true, on: parsed.data.on });
}
