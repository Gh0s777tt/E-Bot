import {
  getSocialFeedsConfig,
  type SocialFeedsConfig,
  saveSocialFeedsConfig,
} from '../../../lib/community';
import { parseBody, socialFeedsSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getSocialFeedsConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, socialFeedsSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveSocialFeedsConfig(parsed.data as SocialFeedsConfig);
  return Response.json({ ok: true, config: await getSocialFeedsConfig() });
}
