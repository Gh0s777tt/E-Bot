import { type GoalsConfig, getGoalsConfig, saveGoalsConfig } from '../../../lib/community';
import { goalsSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getGoalsConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, goalsSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveGoalsConfig(parsed.data as GoalsConfig);
  return Response.json({ ok: true, config: await getGoalsConfig() });
}
