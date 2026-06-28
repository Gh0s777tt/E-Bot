import { type CountersConfig, getCountersConfig, saveCountersConfig } from '../../../lib/community';
import { guardLimit } from '../../../lib/planLimits';
import { countersSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getCountersConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, countersSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const current = (await getCountersConfig()).items?.length ?? 0;
  const gate = await guardLimit('counters', parsed.data.items.length, current);
  if (!gate.ok) return Response.json({ ok: false, error: gate.error }, { status: 403 });
  await saveCountersConfig(parsed.data as CountersConfig);
  return Response.json({ ok: true, config: await getCountersConfig() });
}
