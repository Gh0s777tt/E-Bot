import { recordAudit } from '../../../lib/audit';
import { type DonateConfig, getDonateConfig, saveDonateConfig } from '../../../lib/community';
import { donateSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getDonateConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, donateSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveDonateConfig(parsed.data as DonateConfig);
  await recordAudit(request, 'donate');
  return Response.json({ ok: true, config: await getDonateConfig() });
}
