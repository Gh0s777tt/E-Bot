import { getTempVoice, saveTempVoice, type TempVoiceConfig } from '../../../lib/engagement';
import { parseBody, tempvoiceSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getTempVoice());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, tempvoiceSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveTempVoice(parsed.data as TempVoiceConfig);
  return Response.json({ ok: true, config: await getTempVoice() });
}
