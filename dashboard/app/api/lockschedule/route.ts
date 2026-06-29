import {
  getLockscheduleConfig,
  type LockscheduleConfig,
  saveLockscheduleConfig,
} from '../../../lib/community';
import { lockscheduleSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getLockscheduleConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, lockscheduleSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveLockscheduleConfig(parsed.data as LockscheduleConfig);
  return Response.json({ ok: true, config: await getLockscheduleConfig() });
}
