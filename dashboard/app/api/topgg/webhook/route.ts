import { z } from 'zod';
import { parseBody } from '../../../../lib/schemas';
import { hasSupabase, supabase } from '../../../../lib/supabase';
import { awardVoteTokens, voteRewardAmount, webhookAuthorized } from '../../../../lib/topgg';

export const dynamic = 'force-dynamic';

// Payload webhooka top.gg: { user, type ('upvote'|'test'), isWeekend, bot, query }.
const voteSchema = z.object({
  user: z.string().min(1).max(40),
  bot: z.string().max(40).optional(),
  type: z.string().max(20).optional(),
  isWeekend: z.boolean().optional(),
  query: z.string().max(2000).optional(),
});

// Webhook top.gg (głos użytkownika). Uwierzytelnienie sekretem z panelu webhooków top.gg
// (nagłówek Authorization == TOPGG_WEBHOOK_AUTH); fail-closed bez sekretu (401). Zapisuje głos
// (Supabase, best-effort) i — gdy skonfigurowany portal — przyznaje GT GLOBALNIE (głos nie jest
// per-serwer). Przy poprawnym sekrecie zawsze 200, by top.gg nie ponawiał dostarczenia.
export async function POST(request: Request): Promise<Response> {
  if (!webhookAuthorized(request)) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const parsed = await parseBody(request, voteSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });

  const { user, type, isWeekend } = parsed.data;
  const isTest = type === 'test';
  const weekend = Boolean(isWeekend);
  const amount = isTest ? 0 : voteRewardAmount(weekend);
  const award = amount > 0 ? await awardVoteTokens(user, amount) : { ok: false };

  if (hasSupabase) {
    try {
      await supabase()
        .from('topgg_votes')
        .insert({
          discord_id: user,
          type: type ?? 'upvote',
          is_weekend: weekend,
          rewarded: award.ok,
          reward: award.ok ? amount : 0,
        });
    } catch {
      /* zapis nieobowiązkowy — webhook i tak musi zwrócić 200 */
    }
  }

  return Response.json({
    ok: true,
    test: isTest,
    rewarded: award.ok,
    amount: award.ok ? amount : 0,
  });
}
