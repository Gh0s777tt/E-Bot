// Realny status powiązania konta Discord z GH0ST EMPIRE (przez /api/internal/link-status).
// Wymaga GHOST_BOT_SECRET == BOT_SECRET w ghost-empire. Zwraca null przy braku konfiguracji/błędzie
// (panel pokazuje wtedy instrukcję /link — degradacja łagodna).
export type LinkStatus = { linked: boolean; username: string | null; tokens: number | null };

export async function getLinkStatus(discordId: string | undefined): Promise<LinkStatus | null> {
  const base = process.env.GHOST_API_URL || 'https://ghost-empire-web.vercel.app';
  const secret = process.env.GHOST_BOT_SECRET;
  if (!discordId || !secret) return null;
  try {
    const r = await fetch(
      `${base}/api/internal/link-status?discordId=${encodeURIComponent(discordId)}`,
      {
        headers: { Authorization: `Bearer ${secret}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(6000),
      },
    );
    if (!r.ok) return null;
    return (await r.json()) as LinkStatus;
  } catch {
    return null;
  }
}
