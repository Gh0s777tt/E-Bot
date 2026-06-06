import { searchIgdb } from '../../../../lib/igdb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const q = new URL(request.url).searchParams.get('q') ?? '';
  if (q.trim().length < 2) return Response.json({ results: [] });
  try {
    return Response.json({ results: await searchIgdb(q) });
  } catch (e) {
    return Response.json({ results: [], error: (e as Error).message }, { status: 502 });
  }
}
