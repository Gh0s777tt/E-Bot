import { parseBody, wishlistAddSchema } from '../../../lib/schemas';
import { addWishlist, getWishlist, removeWishlist } from '../../../lib/wishlist';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getWishlist());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, wishlistAddSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const res = await addWishlist(parsed.data);
  if (!res.ok) return Response.json(res, { status: 500 });
  return Response.json({ ok: true, items: await getWishlist() });
}

export async function DELETE(request: Request): Promise<Response> {
  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!id) return Response.json({ ok: false, error: 'brak id' }, { status: 400 });
  const res = await removeWishlist(id);
  return Response.json(res, { status: res.ok ? 200 : 500 });
}
