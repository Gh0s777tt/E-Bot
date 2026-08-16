import { recordAudit } from '../../../lib/audit';
import {
  getPriceTrackerConfig,
  type PriceTrackerConfig,
  savePriceTrackerConfig,
} from '../../../lib/community';
import { parseBody, pricetrackerSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getPriceTrackerConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, pricetrackerSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await savePriceTrackerConfig(parsed.data as PriceTrackerConfig);
  await recordAudit(request, 'pricetracker');
  return Response.json({ ok: true, config: await getPriceTrackerConfig() });
}
