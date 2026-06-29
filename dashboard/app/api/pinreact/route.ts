import { getPinreactConfig, type PinreactConfig, savePinreactConfig } from '../../../lib/community';
import { parseBody, pinreactSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getPinreactConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, pinreactSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await savePinreactConfig(parsed.data as PinreactConfig);
  return Response.json({ ok: true, config: await getPinreactConfig() });
}
