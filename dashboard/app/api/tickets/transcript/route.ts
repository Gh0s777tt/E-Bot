// Transkrypt ticketu jako strona HTML (renderowana przez przeglądarkę, otwierana w nowej karcie).
// Bot zapisuje 'transcript_html' przy zamknięciu ticketu (graceful — bez kolumny po prostu pusto).
// Treść wiadomości jest escapowana po stronie bota (buildTranscript → esc()), więc brak ryzyka XSS.
import { hasSupabase, supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

const page = (body: string): Response =>
  new Response(
    `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Transkrypt ticketu</title></head><body style="margin:0;background:#0a0a0a;color:#eee;font-family:system-ui,sans-serif;padding:24px">${body}</body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );

export async function GET(request: Request): Promise<Response> {
  const channel = new URL(request.url).searchParams.get('channel')?.trim() ?? '';
  if (!channel || !hasSupabase) return page('<p>Transkrypt niedostępny.</p>');
  try {
    const { data } = await supabase()
      .from('tickets')
      .select('transcript_html')
      .eq('channel_id', channel)
      .limit(1)
      .single();
    const html = (data as { transcript_html?: string | null } | null)?.transcript_html;
    if (html)
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch {
    /* kolumna transcript_html może nie istnieć (brak ALTER) — pokaż komunikat poniżej */
  }
  return page(
    '<p>Brak transkryptu dla tego ticketu.</p><p style="color:#888;font-size:13px">Możliwe powody: ticket zamknięto, zanim funkcja była aktywna, albo nie uruchomiono <code>scripts/etap-ticket-transcripts-schema.sql</code> w Supabase.</p>',
  );
}
