// Realne testy połączeń (nie sama obecność kluczy w env) — Discord, Supabase, provider AI.
// Każdy ping ma timeout 6 s i mierzy latencję. Sekrety zostają server-side; wynik to {ok, detail, ms}.
import { hasSupabase, supabase } from './supabase';

export type ConnTest = { name: string; ok: boolean; detail: string; ms: number };
type Probe = () => Promise<{ ok: boolean; detail: string }>;

// Owija pojedynczy ping: mierzy czas i łapie wyjątek (timeout/sieć) → ok:false z komunikatem.
// Wyeksportowane do testu (logika opakowania jest deterministyczna, bez sieci).
export async function timed(name: string, probe: Probe): Promise<ConnTest> {
  const t0 = Date.now();
  try {
    const r = await probe();
    return { name, ok: r.ok, detail: r.detail, ms: Date.now() - t0 };
  } catch (e) {
    return { name, ok: false, detail: (e as Error).message.slice(0, 120), ms: Date.now() - t0 };
  }
}

async function discordProbe(): Promise<{ ok: boolean; detail: string }> {
  const tok = process.env.DISCORD_BOT_TOKEN;
  if (!tok) return { ok: false, detail: 'brak DISCORD_BOT_TOKEN' };
  const r = await fetch('https://discord.com/api/v10/users/@me', {
    headers: { Authorization: `Bot ${tok}` },
    signal: AbortSignal.timeout(6000),
    cache: 'no-store',
  });
  if (!r.ok) return { ok: false, detail: `HTTP ${r.status}` };
  const j = (await r.json()) as { username?: string; id?: string };
  return { ok: true, detail: `@${j.username ?? j.id ?? 'bot'}` };
}

async function supabaseProbe(): Promise<{ ok: boolean; detail: string }> {
  if (!hasSupabase) return { ok: false, detail: 'nieskonfigurowane' };
  const { error } = await supabase().from('settings').select('key').limit(1);
  return error ? { ok: false, detail: error.message.slice(0, 80) } : { ok: true, detail: 'OK' };
}

async function aiProbe(): Promise<{ ok: boolean; detail: string }> {
  const oa = process.env.OPENAI_API_KEY;
  const ds = process.env.DEEPSEEK_API_KEY;
  const target = oa
    ? { url: 'https://api.openai.com/v1/models', key: oa, label: 'OpenAI' }
    : ds
      ? { url: 'https://api.deepseek.com/models', key: ds, label: 'DeepSeek' }
      : null;
  if (!target) return { ok: false, detail: 'brak klucza AI' };
  const r = await fetch(target.url, {
    headers: { Authorization: `Bearer ${target.key}` },
    signal: AbortSignal.timeout(6000),
    cache: 'no-store',
  });
  return r.ok
    ? { ok: true, detail: `${target.label} OK` }
    : { ok: false, detail: `${target.label} HTTP ${r.status}` };
}

export async function runConnectionTests(): Promise<ConnTest[]> {
  return Promise.all([
    timed('Discord', discordProbe),
    timed('Supabase', supabaseProbe),
    timed('AI', aiProbe),
  ]);
}
