// top.gg — webhook głosów: weryfikacja podpisu, normalizacja payloadu, kwota nagrody i przyznanie GT.
// Wspiera DWA modele webhooków top.gg (ten sam sekret TOPGG_WEBHOOK_AUTH):
//   • v1     — podpis HMAC SHA-256 w nagłówku `x-topgg-signature` ("t=<ts>,v1=<hex>"); payload `vote.create`
//              z `data.user.platform_id` (Discord ID) i `data.weight` (2 = weekend).
//   • legacy — nagłówek `Authorization` == sekret; payload `{ user, type, isWeekend }`.
// Głos NIE jest przypisany do serwera → nagroda GT idzie globalnie przez portal (jak bot/empire/award.mts).
import crypto from 'node:crypto';

export function voteRewardAmount(isWeekend: boolean): number {
  const base = Number(process.env.TOPGG_VOTE_REWARD ?? '100');
  const safe = Number.isFinite(base) && base > 0 ? Math.floor(base) : 0;
  return isWeekend ? safe * 2 : safe; // weekend liczy się podwójnie
}

// Weryfikacja autentyczności webhooka. Fail-closed: bez skonfigurowanego sekretu odrzucamy wszystko.
export function verifyWebhook(rawBody: string, headers: Headers): boolean {
  const secret = (process.env.TOPGG_WEBHOOK_AUTH ?? '').trim();
  if (!secret) return false;
  const sig = headers.get('x-topgg-signature');
  if (sig) return verifyHmac(rawBody, sig, secret); // v1 — podpis HMAC SHA-256
  return (headers.get('authorization') ?? '').trim() === secret; // legacy — równość sekretu
}

function verifyHmac(rawBody: string, sig: string, secret: string): boolean {
  try {
    const parts: Record<string, string> = {};
    for (const seg of sig.split(',')) {
      const i = seg.indexOf('=');
      if (i > 0) parts[seg.slice(0, i).trim()] = seg.slice(i + 1).trim();
    }
    const t = parts.t;
    const v1 = parts.v1;
    if (!t || !v1) return false;
    const expected = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(v1, 'utf8');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export type NormalizedVote = { userId: string; isWeekend: boolean; isTest: boolean };

// Sprowadza payload (v1 LUB legacy) do wspólnego kształtu. Zwraca null, gdy nie rozpoznano użytkownika.
export function normalizeVote(body: unknown): NormalizedVote | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  // v1: { type: 'vote.create', data: { user: { platform_id }, weight } }
  if (b.data && typeof b.data === 'object') {
    const d = b.data as Record<string, unknown>;
    if (d.user && typeof d.user === 'object') {
      const u = d.user as Record<string, unknown>;
      const uid = String(u.platform_id ?? u.id ?? '').trim();
      if (!uid) return null;
      return {
        userId: uid,
        isWeekend: Number(d.weight) >= 2,
        isTest: typeof b.type === 'string' && b.type.includes('test'),
      };
    }
  }
  // legacy: { user, type, isWeekend }
  if (typeof b.user === 'string' && b.user) {
    return { userId: b.user, isWeekend: Boolean(b.isWeekend), isTest: b.type === 'test' };
  }
  return null;
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
