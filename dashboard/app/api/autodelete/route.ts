import {
  type AutodeleteConfig,
  getAutodeleteConfig,
  saveAutodeleteConfig,
} from '../../../lib/community';
import { autodeleteSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getAutodeleteConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, autodeleteSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveAutodeleteConfig(parsed.data as AutodeleteConfig);
  return Response.json({ ok: true, config: await getAutodeleteConfig() });
}
