import { recordAudit } from '../../../lib/audit';
import {
  type AutoreactConfig,
  getAutoreactConfig,
  saveAutoreactConfig,
} from '../../../lib/community';
import { autoreactSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getAutoreactConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, autoreactSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveAutoreactConfig(parsed.data as AutoreactConfig);
  await recordAudit(request, 'autoreact');
  return Response.json({ ok: true, config: await getAutoreactConfig() });
}
