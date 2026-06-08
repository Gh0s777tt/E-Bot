// Architekt serwera — zleca botowi utworzenie struktury (kanały/role/kategorie).
// POST: zapisuje plan do 'setup_provision' (bot wykona). GET ?id=: czyta 'setup_provision_result'.
import { getRawSetting, setRawSetting } from '../../../../lib/data';
import { parseBody, provisionSchema } from '../../../../lib/schemas';
import { buildPlan } from '../../../../lib/setup';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, provisionSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const plan = buildPlan(parsed.data.blocks, id);
  await setRawSetting('setup_provision', JSON.stringify(plan));
  return Response.json({ ok: true, id });
}

export async function GET(request: Request): Promise<Response> {
  const id = new URL(request.url).searchParams.get('id');
  try {
    const raw = await getRawSetting('setup_provision_result');
    if (raw) {
      const r = JSON.parse(raw) as { id?: string; done?: boolean; log?: unknown[] };
      if (r.id === id) return Response.json({ done: true, log: r.log ?? [] });
    }
  } catch {
    /* brak wyniku jeszcze */
  }
  return Response.json({ done: false });
}
