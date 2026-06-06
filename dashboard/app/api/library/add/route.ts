import { manualGameSchema, parseBody } from '../../../../lib/schemas';
import { addManualGame } from '../../../../lib/wishlist';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, manualGameSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const res = await addManualGame(parsed.data);
  return Response.json(res, { status: res.ok ? 200 : 500 });
}
