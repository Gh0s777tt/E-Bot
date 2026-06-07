import { type CountingConfig, getCounting, saveCounting } from '../../../lib/engagement';
import { countingSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getCounting());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, countingSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveCounting(parsed.data as CountingConfig);
  return Response.json({ ok: true, config: await getCounting() });
}
