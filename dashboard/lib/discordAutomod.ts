// Etap I — natywny Discord AutoMod zarządzany z panelu (REST, token bota; wymaga uprawnienia
// bota „Zarządzanie serwerem"). Reguły działają server-side — chronią nawet gdy bot leży.
// Limity Discorda: 6× KEYWORD, 1× SPAM, 1× KEYWORD_PRESET, 1× MENTION_SPAM na serwer.
import { getPrimaryGuildId } from './guild';

export type NativeAction = {
  type: number; // 1 block, 2 alert, 3 timeout
  channelId?: string;
  durationSec?: number;
};
export type NativeRule = {
  id: string;
  name: string;
  enabled: boolean;
  triggerType: number; // 1 KEYWORD, 3 SPAM, 4 KEYWORD_PRESET, 5 MENTION_SPAM, 6 MEMBER_PROFILE
  keywords: string[];
  presets: number[]; // 1 profanity, 2 sexual, 3 slurs
  mentionLimit: number | null;
  actions: NativeAction[];
};

type RawAction = {
  type: number;
  metadata?: { channel_id?: string; duration_seconds?: number; custom_message?: string };
};
type RawRule = {
  id: string;
  name: string;
  enabled: boolean;
  trigger_type: number;
  trigger_metadata?: {
    keyword_filter?: string[];
    presets?: number[];
    mention_total_limit?: number;
  };
  actions: RawAction[];
};

// Jeden helper na wszystkie wywołania AutoMod API (GET/POST/PATCH/DELETE).
export async function automodFetch(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  rulePath: string,
  body?: unknown,
): Promise<{ ok: boolean; status: number; json: unknown }> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = await getPrimaryGuildId();
  if (!token || !guildId) return { ok: false, status: 0, json: null };
  const r = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/auto-moderation/rules${rulePath}`,
    {
      method,
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
        'X-Audit-Log-Reason': encodeURIComponent('E-Bot panel - Discord AutoMod'),
      },
      cache: 'no-store',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    },
  ).catch(() => null);
  if (!r) return { ok: false, status: 0, json: null };
  const json = r.status === 204 ? null : await r.json().catch(() => null);
  return { ok: r.ok, status: r.status, json };
}

export function mapRule(raw: RawRule): NativeRule {
  return {
    id: raw.id,
    name: raw.name,
    enabled: raw.enabled,
    triggerType: raw.trigger_type,
    keywords: raw.trigger_metadata?.keyword_filter ?? [],
    presets: raw.trigger_metadata?.presets ?? [],
    mentionLimit: raw.trigger_metadata?.mention_total_limit ?? null,
    actions: (raw.actions ?? []).map((a) => ({
      type: a.type,
      channelId: a.metadata?.channel_id,
      durationSec: a.metadata?.duration_seconds,
    })),
  };
}

// Lista reguł do SSR strony moderacji. null = brak tokenu/uprawnień (sekcja pokaże notkę).
export async function getNativeRules(): Promise<NativeRule[] | null> {
  const r = await automodFetch('GET', '');
  if (!r.ok || !Array.isArray(r.json)) return null;
  return (r.json as RawRule[]).map(mapRule);
}
