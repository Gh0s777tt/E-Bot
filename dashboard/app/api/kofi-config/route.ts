// Config donejtów Ko-fi (authed — panel). Webhook jest osobno w /api/kofi (publiczny).
import { getKofiConfig, type KofiConfig, saveKofiConfig } from '../../../lib/community';
import { kofiSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getKofiConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, kofiSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveKofiConfig(parsed.data as KofiConfig);
  return Response.json({ ok: true, config: await getKofiConfig() });
}
