import { type AutoslowConfig, getAutoslowConfig, saveAutoslowConfig } from '../../../lib/community';
import { autoslowSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getAutoslowConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, autoslowSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveAutoslowConfig(parsed.data as AutoslowConfig);
  return Response.json({ ok: true, config: await getAutoslowConfig() });
}
