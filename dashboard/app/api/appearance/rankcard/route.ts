import { getRankCard, saveRankCard } from '../../../../lib/appearance';
import { recordAudit } from '../../../../lib/audit';
import type { CardStyle } from '../../../../lib/cardStyle';
import { cardStyleSchema, parseBody } from '../../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getRankCard());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, cardStyleSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveRankCard(parsed.data as CardStyle);
  await recordAudit(request, 'rankcard');
  return Response.json({ ok: true, config: await getRankCard() });
}
