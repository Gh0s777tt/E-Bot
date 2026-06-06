import {
  getResponderConfig,
  type ResponderConfig,
  saveResponderConfig,
} from '../../../lib/community';
import { parseBody, responderSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getResponderConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, responderSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveResponderConfig(parsed.data as ResponderConfig);
  return Response.json({ ok: true, config: await getResponderConfig() });
}
