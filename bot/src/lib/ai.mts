// Faza 7 / F8 — współdzielona warstwa AI: config, wywołanie modelu (DeepSeek/OpenAI) + twardy
// dzienny limit kosztów per użytkownik (tabela 'ai_usage'). Używane przez /ai, /tldr, /translate.
import { cloudSelect, cloudUpsert, hasCloud } from './cloud.mts';
import { getSettings } from './db.mts';

export type AiModel = 'deepseek' | 'openai';
export type AiConfig = {
  enabled: boolean;
  model: AiModel;
  dailyRequestLimit: number;
  dailyTokenLimit: number;
};
const DEFAULT: AiConfig = {
  enabled: false,
  model: 'deepseek',
  dailyRequestLimit: 20,
  dailyTokenLimit: 50_000,
};

export function aiConfig(): AiConfig {
  const raw = getSettings()['ai_config'];
  if (!raw) return DEFAULT;
  try {
    return { ...DEFAULT, ...(JSON.parse(raw) as Partial<AiConfig>) };
  } catch {
    return DEFAULT;
  }
}

export type ChatMsg = { role: 'system' | 'user' | 'assistant'; content: string };

export async function callModel(
  model: AiModel,
  messages: ChatMsg[],
  maxTokens = 800,
): Promise<{ text: string; tokens: number }> {
  const isOpenai = model === 'openai';
  const key = isOpenai ? process.env.OPENAI_API_KEY : process.env.DEEPSEEK_API_KEY;
  if (!key)
    throw new Error(`brak klucza API (${isOpenai ? 'OPENAI_API_KEY' : 'DEEPSEEK_API_KEY'})`);

  const url = isOpenai
    ? 'https://api.openai.com/v1/chat/completions'
    : 'https://api.deepseek.com/chat/completions';
  const body = {
    model: isOpenai ? 'gpt-4o-mini' : 'deepseek-chat',
    messages,
    max_tokens: maxTokens,
  };

  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  const d = (await r.json().catch(() => ({}))) as {
    choices?: { message?: { content?: string } }[];
    usage?: { total_tokens?: number };
    error?: { message?: string };
  };
  if (!r.ok) throw new Error(d.error?.message || `HTTP ${r.status}`);
  return { text: d.choices?.[0]?.message?.content ?? '', tokens: d.usage?.total_tokens ?? 0 };
}

export type Usage = { limited: string | null; usedTokens: number; usedReq: number; day: string };

/** Sprawdza dzisiejsze zużycie PRZED wywołaniem; `limited` = komunikat gdy limit przekroczony. */
export async function checkUsage(userId: string, cfg: AiConfig): Promise<Usage> {
  const day = new Date().toISOString().slice(0, 10);
  let usedTokens = 0;
  let usedReq = 0;
  if (hasCloud()) {
    const rows = await cloudSelect<{ tokens_used: number; requests: number }>(
      'ai_usage',
      `select=tokens_used,requests&user_id=eq.${userId}&day=eq.${day}`,
    );
    usedTokens = rows[0]?.tokens_used ?? 0;
    usedReq = rows[0]?.requests ?? 0;
  }
  let limited: string | null = null;
  if (cfg.dailyRequestLimit > 0 && usedReq >= cfg.dailyRequestLimit) {
    limited = `🛑 Dzienny limit zapytań osiągnięty (${cfg.dailyRequestLimit}). Wróć jutro.`;
  } else if (cfg.dailyTokenLimit > 0 && usedTokens >= cfg.dailyTokenLimit) {
    limited = `🛑 Dzienny limit tokenów osiągnięty (${cfg.dailyTokenLimit}). Wróć jutro.`;
  }
  return { limited, usedTokens, usedReq, day };
}

export async function bumpUsage(userId: string, u: Usage, addTokens: number): Promise<void> {
  if (!hasCloud()) return;
  await cloudUpsert(
    'ai_usage',
    [
      {
        user_id: userId,
        day: u.day,
        tokens_used: u.usedTokens + addTokens,
        requests: u.usedReq + 1,
      },
    ],
    'user_id,day',
  ).catch((e) => console.warn('[ai]', (e as Error).message));
}
