import {
  type AutopublishConfig,
  getAutopublishConfig,
  saveAutopublishConfig,
} from '../../../lib/community';
import { autopublishSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getAutopublishConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, autopublishSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveAutopublishConfig(parsed.data as AutopublishConfig);
  return Response.json({ ok: true, config: await getAutopublishConfig() });
}
