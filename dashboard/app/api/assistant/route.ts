// Etap K — API asystenta AI panelu. POST { prompt } → plan krok-po-kroku z linkami do stron.
import { z } from 'zod';
import { askAssistant } from '../../../lib/assistant';
import { parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

const schema = z.object({ prompt: z.string().min(1).max(1000) });

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, schema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const reply = await askAssistant(parsed.data.prompt);
  return Response.json(reply);
}
