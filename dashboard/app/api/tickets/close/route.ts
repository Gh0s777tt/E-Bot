import { z } from 'zod';
import { closeTicket } from '../../../../lib/faza4';
import { parseBody } from '../../../../lib/schemas';

export const dynamic = 'force-dynamic';

const schema = z.object({ id: z.string().min(1).max(64) });

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, schema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const ok = await closeTicket(parsed.data.id);
  return Response.json({ ok });
}
