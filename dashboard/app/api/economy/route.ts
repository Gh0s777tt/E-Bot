import { economySchema, parseBody } from '../../../lib/schemas';
import {
  type EconomyConfig,
  getServerEconomy,
  saveServerEconomy,
} from '../../../lib/serverEconomy';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getServerEconomy());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, economySchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveServerEconomy(parsed.data as EconomyConfig);
  return Response.json({ ok: true, config: await getServerEconomy() });
}
