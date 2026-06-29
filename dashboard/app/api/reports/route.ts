import { getReportsConfig, type ReportsConfig, saveReportsConfig } from '../../../lib/community';
import { parseBody, reportsSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getReportsConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, reportsSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveReportsConfig(parsed.data as ReportsConfig);
  return Response.json({ ok: true, config: await getReportsConfig() });
}
