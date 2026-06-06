import { getModmailConfig, type ModmailConfig, saveModmailConfig } from '../../../lib/community';
import { modmailSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getModmailConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, modmailSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveModmailConfig(parsed.data as ModmailConfig);
  return Response.json({ ok: true, config: await getModmailConfig() });
}
