// Faza 7 / F8 — współdzielona warstwa AI: config, wywołanie modelu (DeepSeek/OpenAI) + twardy
// dzienny limit kosztów per użytkownik (tabela 'ai_usage'). Używane przez /ai, /tldr, /translate.

import { cloudSelect, cloudUpsert, hasCloud } from './cloud.mts';
import { getSettings } from './db.mts';
import { log } from './log.mts';

export type AiModel = 'deepseek' | 'openai' | 'claude';
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
  const raw = getSettings().ai_config;
  if (!raw) return DEFAULT;
  try {
    return { ...DEFAULT, ...(JSON.parse(raw) as Partial<AiConfig>) };
  } catch {
    return DEFAULT;
  }
}

export type ChatMsg = { role: 'system' | 'user' | 'assistant'; content: string };

// Claude (Anthropic Messages API): `system` to OSOBNE pole (nie rola) — wydzielamy je z messages.
async function callClaude(
  messages: ChatMsg[],
  maxTokens: number,
): Promise<{ text: string; tokens: number }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('brak klucza API (ANTHROPIC_API_KEY)');
  const system = messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n\n');
  const msgs = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }));
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages: msgs,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  const d = (await r.json().catch(() => ({}))) as {
    content?: { text?: string }[];
    usage?: { input_tokens?: number; output_tokens?: number };
    error?: { message?: string };
  };
  if (!r.ok) throw new Error(d.error?.message || `HTTP ${r.status}`);
  const text = (d.content ?? []).map((c) => c.text ?? '').join('');
  return { text, tokens: (d.usage?.input_tokens ?? 0) + (d.usage?.output_tokens ?? 0) };
}

export async function callModel(
  model: AiModel,
  messages: ChatMsg[],
  maxTokens = 800,
): Promise<{ text: string; tokens: number }> {
  if (model === 'claude') return callClaude(messages, maxTokens);
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

// Shadow-counter zużycia AI (per proces). Pełni DWIE role (#5): (1) jedyne źródło bez chmury;
// (2) DOLNA GRANICA gdy chmura JEST, ale odczyt zawiódł — `cloudSelect` przy błędzie (timeout/5xx/
// rate-limit) zwraca [] i checkUsage widziałby 0 → otwarty kran OpenAI/DeepSeek. checkUsage bierze
// max(chmura, pamięć), więc awaria Supabase nie znosi limitu: po dobiciu w obrębie procesu blokuje.
// Klucz zawiera `day` (auto-reset dzienny); stare dni przycinane przy rozroście mapy.
const memUsage = new Map<string, { tokens: number; requests: number }>();
const memKey = (guildId: string, userId: string, day: string): string =>
  `${guildId}:${userId}:${day}`;

/** Sprawdza dzisiejsze zużycie PRZED wywołaniem; `limited` = komunikat gdy limit przekroczony.
 *  Liczone PER-SERWER (Audyt #2): zużycie i dzienny limit są niezależne na każdym serwerze.
 *  Fail-closed na awarię chmury (#5): bierze max(chmura, licznik-procesu). */
export async function checkUsage(userId: string, guildId: string, cfg: AiConfig): Promise<Usage> {
  const day = new Date().toISOString().slice(0, 10);
  const mem = memUsage.get(memKey(guildId, userId, day));
  let usedTokens = mem?.tokens ?? 0;
  let usedReq = mem?.requests ?? 0;
  if (hasCloud()) {
    const rows = await cloudSelect<{ tokens_used: number; requests: number }>(
      'ai_usage',
      `select=tokens_used,requests&guild_id=eq.${guildId}&user_id=eq.${userId}&day=eq.${day}`,
    );
    // max: gdy chmura żyje → jej wartość rządzi; gdy padła ([]) → dolna granica z licznika procesu.
    usedTokens = Math.max(usedTokens, rows[0]?.tokens_used ?? 0);
    usedReq = Math.max(usedReq, rows[0]?.requests ?? 0);
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
  // Licznik procesu doliczany ZAWSZE (#5) — jest dolną granicą dla checkUsage, gdy chmura padnie.
  const k = memKey(u.guildId, userId, u.day);
  const m = memUsage.get(k) ?? { tokens: 0, requests: 0 };
  memUsage.set(k, { tokens: m.tokens + addTokens, requests: m.requests + 1 });
  if (memUsage.size > 5000) {
    for (const key of memUsage.keys()) if (!key.endsWith(`:${u.day}`)) memUsage.delete(key);
  }
  if (!hasCloud()) return;
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

/** Moderacja OBRAZÓW przez omni-moderation-latest (multimodalny, `image_url`). DARMOWE jak tekst.
 *  Zwraca zbiorczo: flagged gdy KTÓRYKOLWIEK obraz naruszający + suma kategorii. Wymaga OPENAI_API_KEY. */
export async function moderateImages(
  urls: string[],
): Promise<{ flagged: boolean; categories: string[] }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('brak OPENAI_API_KEY (moderacja AI wymaga OpenAI)');
  if (!urls.length) return { flagged: false, categories: [] };
  const r = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'omni-moderation-latest',
      input: urls.map((url) => ({ type: 'image_url', image_url: { url } })),
    }),
    signal: AbortSignal.timeout(20_000),
  });
  const d = (await r.json().catch(() => ({}))) as {
    results?: { flagged?: boolean; categories?: Record<string, boolean> }[];
    error?: { message?: string };
  };
  if (!r.ok) throw new Error(d.error?.message || `HTTP ${r.status}`);
  const cats = new Set<string>();
  for (const res of d.results ?? [])
    if (res.categories) for (const [k, v] of Object.entries(res.categories)) if (v) cats.add(k);
  return { flagged: (d.results ?? []).some((res) => res.flagged), categories: [...cats] };
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
