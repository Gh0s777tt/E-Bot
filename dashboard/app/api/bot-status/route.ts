// Status bota dla paska panelu. Czyta opcjonalny endpoint zdrowia bota (BOT_STATUS_URL),
// który może wystawić moduł bota (np. { online: true, guilds: 1, tag: "E-Bot#4585" }).
// Bez BOT_STATUS_URL zwraca online: null (nieznany) — pasek pokaże szarą kropkę.
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const url = process.env.BOT_STATUS_URL;
  if (!url) return Response.json({ online: null, tag: 'E-Bot' });
  try {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) return Response.json({ online: false, tag: 'E-Bot' });
    const d = (await r.json()) as { online?: boolean; guilds?: number; tag?: string };
    return Response.json({ online: !!d.online, guilds: d.guilds ?? null, tag: d.tag ?? 'E-Bot' });
  } catch {
    return Response.json({ online: false, tag: 'E-Bot' });
  }
}
