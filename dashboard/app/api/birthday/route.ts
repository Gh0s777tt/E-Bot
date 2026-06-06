import { type BirthdayConfig, getBirthdayConfig, saveBirthdayConfig } from '../../../lib/community';
import { birthdaySchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getBirthdayConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, birthdaySchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveBirthdayConfig(parsed.data as BirthdayConfig);
  return Response.json({ ok: true, config: await getBirthdayConfig() });
}
