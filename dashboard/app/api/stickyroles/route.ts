import { recordAudit } from '../../../lib/audit';
import {
  getStickyrolesConfig,
  type StickyrolesConfig,
  saveStickyrolesConfig,
} from '../../../lib/community';
import { parseBody, stickyrolesSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getStickyrolesConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, stickyrolesSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveStickyrolesConfig(parsed.data as StickyrolesConfig);
  await recordAudit(request, 'stickyroles');
  return Response.json({ ok: true, config: await getStickyrolesConfig() });
}
