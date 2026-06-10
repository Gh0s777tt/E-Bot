// Etap I — API natywnego Discord AutoModa: lista, kreatory szablonów, toggle, delete.
// Wszystko przez REST z tokenem bota (automodFetch); błędy Discorda (limity reguł,
// brak uprawnień) wracają czytelnie do formularza.
import { z } from 'zod';
import { automodFetch, getNativeRules, mapRule } from '../../../lib/discordAutomod';
import { parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

const BLOCK = {
  type: 1,
  metadata: { custom_message: 'Wiadomosc zablokowana przez AutoMod (E-Bot).' },
};

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('toggle'), id: z.string().min(1), enabled: z.boolean() }),
  z.object({ action: z.literal('delete'), id: z.string().min(1) }),
  z.object({ action: z.literal('create-preset') }),
  z.object({ action: z.literal('create-spam') }),
  z.object({ action: z.literal('create-mention'), limit: z.number().int().min(1).max(50) }),
  z.object({
    action: z.literal('create-keyword'),
    name: z.string().min(1).max(100),
    keywords: z.array(z.string().min(1).max(60)).min(1).max(50),
    alertChannelId: z.string().optional(),
  }),
]);

function discordError(status: number, json: unknown): string {
  const msg =
    json && typeof json === 'object' && 'message' in json
      ? String((json as { message: unknown }).message)
      : '';
  if (status === 403) return 'Bot nie ma uprawnienia „Zarządzanie serwerem" na tym serwerze.';
  if (status === 0) return 'Brak DISCORD_BOT_TOKEN w środowisku panelu.';
  return msg || `Discord API: błąd ${status}.`;
}

export async function GET(): Promise<Response> {
  const rules = await getNativeRules();
  if (!rules) return Response.json({ ok: false, rules: [] });
  return Response.json({ ok: true, rules });
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, schema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const a = parsed.data;

  if (a.action === 'toggle') {
    const r = await automodFetch('PATCH', `/${a.id}`, { enabled: a.enabled });
    if (!r.ok)
      return Response.json({ ok: false, error: discordError(r.status, r.json) }, { status: 502 });
    return Response.json({ ok: true });
  }

  if (a.action === 'delete') {
    const r = await automodFetch('DELETE', `/${a.id}`);
    if (!r.ok)
      return Response.json({ ok: false, error: discordError(r.status, r.json) }, { status: 502 });
    return Response.json({ ok: true });
  }

  let body: Record<string, unknown>;
  if (a.action === 'create-preset') {
    body = {
      name: '🤬 Filtr Discorda: wulgaryzmy + treści 18+ + obelgi',
      event_type: 1,
      trigger_type: 4,
      trigger_metadata: { presets: [1, 2, 3], allow_list: [] },
      actions: [BLOCK],
      enabled: true,
    };
  } else if (a.action === 'create-spam') {
    body = {
      name: '🌊 Anty-spam treści (heurystyka Discorda)',
      event_type: 1,
      trigger_type: 3,
      actions: [BLOCK],
      enabled: true,
    };
  } else if (a.action === 'create-mention') {
    body = {
      name: `📣 Limit wzmianek (${a.limit}) + anty-raid pingów`,
      event_type: 1,
      trigger_type: 5,
      trigger_metadata: { mention_total_limit: a.limit, mention_raid_protection_enabled: true },
      actions: [BLOCK, { type: 3, metadata: { duration_seconds: 600 } }],
      enabled: true,
    };
  } else {
    const actions: unknown[] = [BLOCK];
    if (a.alertChannelId) actions.push({ type: 2, metadata: { channel_id: a.alertChannelId } });
    body = {
      name: a.name,
      event_type: 1,
      trigger_type: 1,
      trigger_metadata: { keyword_filter: a.keywords, allow_list: [] },
      actions,
      enabled: true,
    };
  }

  const r = await automodFetch('POST', '', body);
  if (!r.ok)
    return Response.json({ ok: false, error: discordError(r.status, r.json) }, { status: 502 });
  return Response.json({
    ok: true,
    rule: mapRule(r.json as Parameters<typeof mapRule>[0]),
  });
}
