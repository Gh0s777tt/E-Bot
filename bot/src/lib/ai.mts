// Faza 7 / F8 — współdzielona warstwa AI: config, wywołanie modelu (DeepSeek/OpenAI) + twardy
// dzienny limit kosztów per użytkownik (tabela 'ai_usage'). Używane przez /ai, /tldr, /translate.

import { cloudSelect, cloudUpsert, hasCloud } from './cloud.mts';
import { getSettings } from './db.mts';
import { log } from './log.mts';

export type AiModel = 'deepseek' | 'openai';
export type AiConfig = {
  enabled: boolean;
  model: AiModel;
  dailyRequestLimit: number;
  dailyTokenLimit: number;
  persona: string; // Tor C — własna osobowość bota (prefiks system-promptu /ai)
};
const DEFAULT: AiConfig = {
  enabled: false,
  model: 'deepseek',
  dailyRequestLimit: 20,
  dailyTokenLimit: 50_000,
  persona: '',
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

// guildId niesiony w Usage, żeby bumpUsage zapisał ten sam serwer co checkUsage policzył.
// DM/brak serwera → '' (te wiersze nie pokażą się żadnemu tenantowi na /stats — panel fail-closed).
export type Usage = {
  limited: string | null;
  usedTokens: number;
  usedReq: number;
  day: string;
  guildId: string;
};

// Fallback in-memory licznika zużycia AI gdy BRAK chmury (Supabase). Bez tego checkUsage zawsze
// widzi 0 → twarde limity kosztów nie działają (otwarty kran OpenAI/DeepSeek). Klucz zawiera `day`
// (auto-reset dzienny); stare dni przycinane przy rozroście mapy (anty-wyciek pamięci).
const memUsage = new Map<string, { tokens: number; requests: number }>();
const memKey = (guildId: string, userId: string, day: string): string =>
  `${guildId}:${userId}:${day}`;

/** Sprawdza dzisiejsze zużycie PRZED wywołaniem; `limited` = komunikat gdy limit przekroczony.
 *  Liczone PER-SERWER (Audyt #2): zużycie i dzienny limit są niezależne na każdym serwerze. */
export async function checkUsage(userId: string, guildId: string, cfg: AiConfig): Promise<Usage> {
  const day = new Date().toISOString().slice(0, 10);
  let usedTokens = 0;
  let usedReq = 0;
  if (hasCloud()) {
    const rows = await cloudSelect<{ tokens_used: number; requests: number }>(
      'ai_usage',
      `select=tokens_used,requests&guild_id=eq.${guildId}&user_id=eq.${userId}&day=eq.${day}`,
    );
    usedTokens = rows[0]?.tokens_used ?? 0;
    usedReq = rows[0]?.requests ?? 0;
  } else {
    // Bez chmury: zużycie z licznika in-memory (inaczej limit nigdy nie zadziała).
    const m = memUsage.get(memKey(guildId, userId, day));
    usedTokens = m?.tokens ?? 0;
    usedReq = m?.requests ?? 0;
  }
  let limited: string | null = null;
  if (cfg.dailyRequestLimit > 0 && usedReq >= cfg.dailyRequestLimit) {
    limited = `🛑 Dzienny limit zapytań osiągnięty (${cfg.dailyRequestLimit}). Wróć jutro.`;
  } else if (cfg.dailyTokenLimit > 0 && usedTokens >= cfg.dailyTokenLimit) {
    limited = `🛑 Dzienny limit tokenów osiągnięty (${cfg.dailyTokenLimit}). Wróć jutro.`;
  }
  return { limited, usedTokens, usedReq, day, guildId };
}

export async function bumpUsage(userId: string, u: Usage, addTokens: number): Promise<void> {
  if (!hasCloud()) {
    // Bez chmury: dolicz do licznika in-memory (parzyste z checkUsage powyżej).
    const k = memKey(u.guildId, userId, u.day);
    const m = memUsage.get(k) ?? { tokens: 0, requests: 0 };
    memUsage.set(k, { tokens: m.tokens + addTokens, requests: m.requests + 1 });
    if (memUsage.size > 5000) {
      for (const key of memUsage.keys()) if (!key.endsWith(`:${u.day}`)) memUsage.delete(key);
    }
    return;
  }
  await cloudUpsert(
    'ai_usage',
    [
      {
        guild_id: u.guildId,
        user_id: userId,
        day: u.day,
        tokens_used: u.usedTokens + addTokens,
        requests: u.usedReq + 1,
      },
    ],
    'guild_id,user_id,day',
  ).catch((e) => log.warn('[ai]', { err: e }));
}

/** Generuje obraz przez OpenAI (dall-e-3, 1024×1024) → PNG Buffer. Wymaga OPENAI_API_KEY. */
export async function generateImage(prompt: string): Promise<Buffer> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('brak OPENAI_API_KEY (generowanie obrazów wymaga OpenAI)');
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    }),
    signal: AbortSignal.timeout(60_000),
  });
  const d = (await r.json().catch(() => ({}))) as {
    data?: { b64_json?: string }[];
    error?: { message?: string };
  };
  if (!r.ok) throw new Error(d.error?.message || `HTTP ${r.status}`);
  const b64 = d.data?.[0]?.b64_json;
  if (!b64) throw new Error('brak obrazu w odpowiedzi');
  return Buffer.from(b64, 'base64');
}

/** Moderacja treści przez DARMOWY endpoint OpenAI (omni-moderation-latest). Wymaga OPENAI_API_KEY. */
export async function moderateText(
  text: string,
): Promise<{ flagged: boolean; categories: string[] }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('brak OPENAI_API_KEY (moderacja AI wymaga OpenAI)');
  const r = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'omni-moderation-latest', input: text }),
    signal: AbortSignal.timeout(15_000),
  });
  const d = (await r.json().catch(() => ({}))) as {
    results?: { flagged?: boolean; categories?: Record<string, boolean> }[];
    error?: { message?: string };
  };
  if (!r.ok) throw new Error(d.error?.message || `HTTP ${r.status}`);
  const res = d.results?.[0];
  const categories = res?.categories
    ? Object.entries(res.categories)
        .filter(([, v]) => v)
        .map(([k]) => k)
    : [];
  return { flagged: !!res?.flagged, categories };
}

/** Tor C — opis obrazka (vision). Wymaga OPENAI_API_KEY (gpt-4o-mini z wejściem image_url). */
export async function describeImage(
  imageUrl: string,
  prompt: string,
): Promise<{ text: string; tokens: number }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('brak OPENAI_API_KEY (analiza obrazów wymaga OpenAI)');
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(40_000),
  });
  const d = (await r.json().catch(() => ({}))) as {
    choices?: { message?: { content?: string } }[];
    usage?: { total_tokens?: number };
    error?: { message?: string };
  };
  if (!r.ok) throw new Error(d.error?.message || `HTTP ${r.status}`);
  return { text: d.choices?.[0]?.message?.content ?? '', tokens: d.usage?.total_tokens ?? 0 };
}
