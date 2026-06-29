import {
  getQuotelinkConfig,
  type QuotelinkConfig,
  saveQuotelinkConfig,
} from '../../../lib/community';
import { parseBody, quotelinkSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getQuotelinkConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, quotelinkSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveQuotelinkConfig(parsed.data as QuotelinkConfig);
  return Response.json({ ok: true, config: await getQuotelinkConfig() });
}
