import { recordAudit } from '../../../lib/audit';
import {
  getTwitchSubConfig,
  saveTwitchSubConfig,
  type TwitchSubConfig,
} from '../../../lib/community';
import { parseBody, twitchSubSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getTwitchSubConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, twitchSubSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveTwitchSubConfig(parsed.data as TwitchSubConfig);
  await recordAudit(request, 'twitchsub');
  return Response.json({ ok: true, config: await getTwitchSubConfig() });
}
