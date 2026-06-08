// Architekt serwera — AI-kreator: opis serwera → sugerowany preset + bloki struktury.
// Woła LLM server-side (DeepSeek jeśli jest klucz, inaczej OpenAI). Zwraca zwalidowany JSON.
import { aiSetupSchema, parseBody } from '../../../../lib/schemas';

export const dynamic = 'force-dynamic';

const BLOCKS = ['welcome', 'announce', 'logs', 'tickets', 'counters', 'muted', 'levelRoles'];
const PRESETS = ['streamer', 'gaming', 'community'];

const SYS = `Konfigurujesz bota Discord. Na podstawie opisu serwera zwróć WYŁĄCZNIE JSON:
{"preset": jeden z ["streamer","gaming","community"], "blocks": podzbiór ["welcome","announce","logs","tickets","counters","muted","levelRoles"]}.
welcome=kanał powitań, announce=ogłoszenia, logs=logi serwera, tickets=kanał pomocy, counters=liczniki statystyk (voice), muted=rola wyciszeń, levelRoles=role poziomów.
Wybierz preset i 3–6 sensownych bloków. Bez komentarzy, sam JSON.`;

async function callLLM(description: string): Promise<string | null> {
  const ds = process.env.DEEPSEEK_API_KEY;
  const oa = process.env.OPENAI_API_KEY;
  const cfg = ds
    ? { url: 'https://api.deepseek.com/chat/completions', key: ds, model: 'deepseek-chat' }
    : oa
      ? { url: 'https://api.openai.com/v1/chat/completions', key: oa, model: 'gpt-4o-mini' }
      : null;
  if (!cfg) return null;
  try {
    const r = await fetch(cfg.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.key}` },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: 'system', content: SYS },
          { role: 'user', content: description },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 200,
      }),
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { choices?: { message?: { content?: string } }[] };
    return j.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, aiSetupSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });

  const content = await callLLM(parsed.data.description);
  if (!content)
    return Response.json({
      ok: false,
      error: 'AI niedostępne — ustaw DEEPSEEK_API_KEY lub OPENAI_API_KEY w env bota.',
    });
  try {
    const out = JSON.parse(content) as { preset?: string; blocks?: unknown };
    const preset = out.preset && PRESETS.includes(out.preset) ? out.preset : null;
    const blocks = Array.isArray(out.blocks)
      ? (out.blocks as unknown[]).filter(
          (b): b is string => typeof b === 'string' && BLOCKS.includes(b),
        )
      : [];
    return Response.json({ ok: true, preset, blocks });
  } catch {
    return Response.json({ ok: false, error: 'Nieprawidłowa odpowiedź AI.' });
  }
}
