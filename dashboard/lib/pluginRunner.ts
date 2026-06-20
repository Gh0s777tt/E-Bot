// M6a — runner webhook pluginów community (model webhook-first z PLAN-M6-SANDBOX.md).
//
// Woła endpoint autora podpisanym, SCOPED payloadem i WALIDUJE odpowiedź (akcje deklaratywne).
// NIE wykonuje akcji — to robi host w M6b (scoped do guild_id, z autoryzacją per-akcja). Tu sama
// warstwa „zawołaj plugin i odbierz zwalidowane akcje". Obcego kodu NIE uruchamiamy u siebie.
//
// Zabezpieczenia: tylko https + SSRF-guard (blokada loopback/private/link-local/metadata), brak
// redirectów, timeout 3 s, limit rozmiaru odpowiedzi, podpis HMAC (autor weryfikuje pochodzenie).
import { z } from 'zod';

// ── Kontrakt akcji deklaratywnych (host wykona je scoped do guild_id w M6b) ──────────────────
export const pluginActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('sendMessage'),
    channelId: z.string().max(32),
    content: z.string().max(2000),
  }),
  z.object({ type: z.literal('addRole'), userId: z.string().max(32), roleId: z.string().max(32) }),
  z.object({ type: z.literal('setConfig'), key: z.string().max(64), value: z.string().max(4000) }),
]);
export type PluginAction = z.infer<typeof pluginActionSchema>;

export const pluginResponseSchema = z.object({ actions: z.array(pluginActionSchema).max(20) });

// ── SSRF-guard ───────────────────────────────────────────────────────────────────────────────
// Literalne adresy prywatne/loopback/link-local/metadata. UWAGA: nie rozwiązuje DNS — pełna ochrona
// (rebinding) wymaga egress-proxy z allowlistą (decyzja D3 w PLAN-M6-SANDBOX.md). To pierwsza warstwa.
function isPrivateHost(host: string): boolean {
  // IPv4-mapped/-compatible IPv6 (::ffff:127.0.0.1, ::ffff:169.254.169.254, ::127.0.0.1) osadza adres
  // IPv4 — wyłuskujemy go, inaczej reguły IPv4 niżej go nie złapią (klasyczny bypass SSRF na loopback/
  // metadata). UWAGA: `new URL()` kanonikalizuje formę dotted do HEX (::ffff:7f00:1) — obsługujemy obie.
  let h = host;
  const dotted = h.match(/^::(?:ffff:)?((?:\d{1,3}\.){3}\d{1,3})$/i);
  if (dotted) {
    h = dotted[1];
  } else {
    const hex = h.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
    if (hex) {
      const hi = Number.parseInt(hex[1], 16);
      const lo = Number.parseInt(hex[2], 16);
      h = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
    }
  }

  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.internal')) return true;
  if (
    h === '::1' ||
    h === '::' || // unspecified — bind do wszystkich interfejsów (≈ 0.0.0.0)
    h.startsWith('fe80:') ||
    h.startsWith('fc') ||
    h.startsWith('fd')
  ) {
    return true;
  }
  return (
    /^127\./.test(h) ||
    h === '0.0.0.0' ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^169\.254\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h)
  );
}

export function isSafeEndpoint(url: string): boolean {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  // hostname IPv6 z URL ma nawiasy ([::1]) — zdejmujemy je, by isPrivateHost łapał loopback/link-local.
  return (
    u.protocol === 'https:' && !isPrivateHost(u.hostname.toLowerCase().replace(/^\[|\]$/g, ''))
  );
}

// Podpis payloadu (HMAC-SHA256, hex) — autor weryfikuje nagłówkiem X-EBOT-Signature, że wywołanie
// pochodzi od nas (analogicznie do weryfikacji webhooka Stripe po stronie hosta).
async function signPayload(body: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export type PluginInvocation = {
  endpoint: string;
  secret: string;
  pluginKey: string;
  guildId: string;
  event: string;
  config: Record<string, unknown>;
  input?: unknown;
};

const TIMEOUT_MS = 3000;
const MAX_RESPONSE = 100_000; // 100 KB

// Woła plugin i zwraca ZWALIDOWANE akcje (lub błąd). Nic nie wykonuje — wykonanie to M6b.
export async function runPluginWebhook(
  inv: PluginInvocation,
): Promise<{ ok: true; actions: PluginAction[] } | { ok: false; error: string }> {
  if (!inv.endpoint || !inv.secret) return { ok: false, error: 'brak endpointu/sekretu' };
  if (!isSafeEndpoint(inv.endpoint))
    return { ok: false, error: 'niedozwolony endpoint (SSRF/https)' };

  const payload = JSON.stringify({
    event: inv.event,
    guild_id: inv.guildId,
    plugin_key: inv.pluginKey,
    config: inv.config,
    input: inv.input ?? null,
  });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const signature = await signPayload(payload, inv.secret);
    const r = await fetch(inv.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-EBOT-Signature': signature },
      body: payload,
      redirect: 'error',
      signal: ctrl.signal,
    });
    if (!r.ok) return { ok: false, error: `endpoint ${r.status}` };
    const text = (await r.text()).slice(0, MAX_RESPONSE);
    const parsed = pluginResponseSchema.safeParse(JSON.parse(text));
    if (!parsed.success) return { ok: false, error: 'nieprawidłowa odpowiedź pluginu' };
    return { ok: true, actions: parsed.data.actions };
  } catch {
    return { ok: false, error: ctrl.signal.aborted ? 'timeout' : 'błąd wywołania' };
  } finally {
    clearTimeout(timer);
  }
}
