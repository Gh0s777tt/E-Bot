import { type DigestConfig, getDigestConfig, saveDigestConfig } from '../../../lib/community';
import { digestSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getDigestConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, digestSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveDigestConfig(parsed.data as DigestConfig);
  return Response.json({ ok: true, config: await getDigestConfig() });
}
