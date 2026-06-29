import {
  getVoiceroleConfig,
  saveVoiceroleConfig,
  type VoiceroleConfig,
} from '../../../lib/community';
import { parseBody, voiceroleSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getVoiceroleConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, voiceroleSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveVoiceroleConfig(parsed.data as VoiceroleConfig);
  return Response.json({ ok: true, config: await getVoiceroleConfig() });
}
