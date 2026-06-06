import { parseBody, shopItemSchema } from '../../../../lib/schemas';
import { addShopItem, getShopItems, removeShopItem } from '../../../../lib/serverEconomy';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getShopItems());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, shopItemSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const res = await addShopItem(parsed.data);
  if (!res.ok) return Response.json(res, { status: 500 });
  return Response.json({ ok: true, items: await getShopItems() });
}

export async function DELETE(request: Request): Promise<Response> {
  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!id) return Response.json({ ok: false, error: 'brak id' }, { status: 400 });
  const res = await removeShopItem(id);
  return Response.json(res, { status: res.ok ? 200 : 500 });
}
