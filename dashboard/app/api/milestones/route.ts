import {
  getMilestonesConfig,
  type MilestonesConfig,
  saveMilestonesConfig,
} from '../../../lib/community';
import { milestonesSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getMilestonesConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, milestonesSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveMilestonesConfig(parsed.data as MilestonesConfig);
  return Response.json({ ok: true, config: await getMilestonesConfig() });
}
