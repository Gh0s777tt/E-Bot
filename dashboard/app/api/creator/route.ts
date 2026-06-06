import { type CreatorConfig, getCreatorConfig, saveCreatorConfig } from '../../../lib/creator';
import { creatorSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getCreatorConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, creatorSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveCreatorConfig(parsed.data as CreatorConfig);
  return Response.json({ ok: true, config: await getCreatorConfig() });
}
