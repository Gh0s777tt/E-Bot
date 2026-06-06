import { getTicketsConfig, saveTicketsConfig, type TicketsConfig } from '../../../lib/faza4';
import { parseBody, ticketsConfigSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getTicketsConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, ticketsConfigSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveTicketsConfig(parsed.data as TicketsConfig);
  return Response.json({ ok: true, config: await getTicketsConfig() });
}
