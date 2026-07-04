// „Wyślij teraz" (B3 fala 1, #686) — zapis żądania per-serwer ('scheduled_send_now' = {id, ts});
// bot (engagement/scheduledPosts.mts) odbiera na najbliższym ticku pollera (≤60 s) i wysyła post
// poza harmonogramem. Chronione sesją (proxy). Wysyłamy tylko posty ZAPISANE w configu.
import { setGuildRawSetting } from '../../../../lib/data';
import { getScheduledPosts } from '../../../../lib/scheduledPosts';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  let id = '';
  try {
    id = String(((await request.json()) as { id?: unknown }).id ?? '');
  } catch {
    /* brak/zepsute body → walidacja niżej */
  }
  if (!id) return Response.json({ ok: false, error: 'Brak id posta.' }, { status: 400 });
  const post = (await getScheduledPosts()).find((p) => p.id === id);
  if (!post) {
    return Response.json(
      { ok: false, error: 'Post nie istnieje — zapisz zmiany przed wysyłką.' },
      { status: 404 },
    );
  }
  if (!post.channelId) {
    return Response.json({ ok: false, error: 'Post nie ma ustawionego kanału.' }, { status: 400 });
  }
  await setGuildRawSetting('scheduled_send_now', JSON.stringify({ id, ts: Date.now() }));
  return Response.json({ ok: true });
}
