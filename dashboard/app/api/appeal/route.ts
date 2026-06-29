// Publiczny POST odwołania. Tożsamość ZWERYFIKOWANA przez ciasteczko 'ebot_appeal' (uid nie do
// podrobienia). Dopisuje do kolejki g:<guildId>:appeals_queue (współdzielonej z botem). Dedup: jeden
// pending na użytkownika/serwer. Akcja gated po stronie moderatora (przycisk) — to tylko zgłoszenie.
import { appealIdentity } from '../../../lib/appealIdentity';
import { getRawSetting, setRawSetting } from '../../../lib/data';
import { appealSubmitSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

type Appeal = {
  id: string;
  userId: string;
  uname: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  at: number;
  posted?: boolean;
};

export async function POST(request: Request): Promise<Response> {
  const id = await appealIdentity();
  if (!id) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const parsed = await parseBody(request, appealSubmitSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const { guildId, reason } = parsed.data;

  const cfgRaw =
    (await getRawSetting(`g:${guildId}:appeals_config`)) ?? (await getRawSetting('appeals_config'));
  let enabled = false;
  try {
    enabled = !!(JSON.parse(cfgRaw || '{}') as { enabled?: boolean }).enabled;
  } catch {
    enabled = false;
  }
  if (!enabled) return Response.json({ ok: false, error: 'disabled' }, { status: 403 });

  const key = `g:${guildId}:appeals_queue`;
  let q: Appeal[] = [];
  try {
    q = JSON.parse((await getRawSetting(key)) || '[]') as Appeal[];
  } catch {
    q = [];
  }
  if (q.some((a) => a.userId === id.uid && a.status === 'pending'))
    return Response.json({ ok: false, error: 'duplicate' }, { status: 409 });

  q.push({
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    userId: id.uid,
    uname: id.uname,
    reason,
    status: 'pending',
    at: Date.now(),
    posted: false,
  });
  await setRawSetting(key, JSON.stringify(q.slice(-100)));
  return Response.json({ ok: true });
}
