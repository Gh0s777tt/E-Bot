// GH0ST EMPIRE economy — award Ghost Tokens (GT) via the portal's internal API.
// E-Bot is the Discord arm of GH0ST EMPIRE: it grants GT for Discord activity by calling
// the same portal endpoint the old ghost-empire-bot used (now superseded by E-Bot). The GT
// balance lives in the portal's Postgres — E-Bot only calls the API (no local economy state).
// Reuses GHOST_API_URL / GHOST_BOT_SECRET (already set for the /link command).
// Adres portalu bierzemy WYŁĄCZNIE z ghostUrl() — jednej bramki w config.mts. Dawny fallback na
// zaszytą domenę powodował, że przy pustym GHOST_API_URL (udokumentowany stan „wyłączone") bot
// słał `Bearer <sekret>` + discordId każdego członka do cudzego deploymentu przy KAŻDYM GT.
import { ghostUrl } from './config.mts';

export type AwardResponse =
  | { ok: true; awarded: number; newBalance: number }
  | { ok: false; reason?: string }
  | { error: string };

/** POST /api/internal/award (Bearer GHOST_BOT_SECRET). Matches a Discord user to a GH0ST
 *  account by discordId; returns { ok:false, reason:"user_not_linked" } if not linked yet. */
export async function awardTokens(params: {
  discordId: string;
  amount: number;
  reason: string;
  multiplier?: number;
}): Promise<AwardResponse> {
  const base = ghostUrl();
  const secret = process.env.GHOST_BOT_SECRET;
  if (!base) return { error: 'no_portal_url' }; // integracja wyłączona — cicho, jak przy no_secret
  if (!secret) return { error: 'no_secret' };
  try {
    const res = await fetch(`${base}/api/internal/award`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify(params),
    });
    const data = (await res.json().catch(() => ({}))) as AwardResponse;
    if (!res.ok) return { error: (data as { error?: string }).error ?? `HTTP ${res.status}` };
    return data;
  } catch (e) {
    return { error: (e as Error).message };
  }
}
