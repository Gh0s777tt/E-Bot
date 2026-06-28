// top.gg — webhook głosów: walidacja sekretu, kwota nagrody i best-effort przyznanie GT przez portal.
// Głos na top.gg NIE jest przypisany do serwera → nagroda idzie GLOBALNIE (GT) przez portal (tak jak
// bot/src/empire/award.mts). Ekonomia `/eco` jest per-serwer, więc nie pasuje do głosu bez kontekstu guildy.

export function voteRewardAmount(isWeekend: boolean): number {
  const base = Number(process.env.TOPGG_VOTE_REWARD ?? '100');
  const safe = Number.isFinite(base) && base > 0 ? Math.floor(base) : 0;
  return isWeekend ? safe * 2 : safe; // top.gg liczy głos weekendowy podwójnie
}

export function webhookAuthorized(request: Request): boolean {
  const expected = (process.env.TOPGG_WEBHOOK_AUTH ?? '').trim();
  if (!expected) return false; // fail-closed: bez skonfigurowanego sekretu NIE przyjmujemy webhooków
  return (request.headers.get('authorization') ?? '').trim() === expected;
}

// Przyznaje GT przez portal (POST /api/internal/award, Bearer GHOST_BOT_SECRET) — jak award.mts w bocie.
// Best-effort + env-gated: bez GHOST_BOT_SECRET (lub amount<=0) pomijamy (głos i tak zostaje zapisany).
export async function awardVoteTokens(
  discordId: string,
  amount: number,
): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env.GHOST_BOT_SECRET;
  if (!secret || amount <= 0) return { ok: false, reason: 'disabled' };
  const base = process.env.GHOST_API_URL || 'https://ghost-empire-web.vercel.app';
  try {
    const res = await fetch(`${base}/api/internal/award`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ discordId, amount, reason: 'topgg_vote' }),
    });
    return { ok: res.ok, reason: res.ok ? undefined : `http_${res.status}` };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
