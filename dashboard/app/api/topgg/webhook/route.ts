import { hasSupabase, supabase } from '../../../../lib/supabase';
import {
  awardVoteTokens,
  normalizeVote,
  verifyWebhook,
  voteRewardAmount,
} from '../../../../lib/topgg';

export const dynamic = 'force-dynamic';

// Webhook top.gg (głos użytkownika). Czytamy SUROWE body (potrzebne do weryfikacji podpisu HMAC v1),
// weryfikujemy autentyczność (v1 HMAC `x-topgg-signature` lub legacy `Authorization`; fail-closed bez
// sekretu → 401), normalizujemy payload (v1 vote.create / legacy) i — best-effort — przyznajemy GT
// GLOBALNIE (głos nie jest per-serwer). Przy poprawnym podpisie zawsze 200, by top.gg nie ponawiał.
export async function POST(request: Request): Promise<Response> {
  const raw = await request.text();
  if (!verifyWebhook(raw, request.headers)) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }
  const vote = normalizeVote(body);
  if (!vote) return Response.json({ ok: false, error: 'unrecognized payload' }, { status: 400 });

  const amount = vote.isTest ? 0 : voteRewardAmount(vote.isWeekend);
  const award = amount > 0 ? await awardVoteTokens(vote.userId, amount) : { ok: false };

  if (hasSupabase) {
    try {
      await supabase()
        .from('topgg_votes')
        .insert({
          discord_id: vote.userId,
          type: vote.isTest ? 'test' : 'vote',
          is_weekend: vote.isWeekend,
          rewarded: award.ok,
          reward: award.ok ? amount : 0,
        });
    } catch {
      /* zapis nieobowiązkowy — webhook i tak musi zwrócić 200 */
    }
  }

  return Response.json({
    ok: true,
    test: vote.isTest,
    rewarded: award.ok,
    amount: award.ok ? amount : 0,
  });
}
