import {
  getResponderConfig,
  type ResponderConfig,
  saveResponderConfig,
} from '../../../lib/community';
import { guardLimit } from '../../../lib/planLimits';
import { parseBody, responderSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getResponderConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, responderSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const current = (await getResponderConfig()).autoresponders?.length ?? 0;
  const gate = await guardLimit('responders', parsed.data.autoresponders.length, current);
  if (!gate.ok) return Response.json({ ok: false, error: gate.error }, { status: 403 });
  await saveResponderConfig(parsed.data as ResponderConfig);
  return Response.json({ ok: true, config: await getResponderConfig() });
}
