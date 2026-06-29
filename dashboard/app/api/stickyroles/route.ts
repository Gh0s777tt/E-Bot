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
  return Response.json({ ok: true, config: await getStickyrolesConfig() });
}
