// M5 — tiery + billing (env-gated). Bez STRIPE_SECRET_KEY billing jest UŚPIONY: brak paywalla
// (wszystkie pluginy dostępne), brak checkoutu — panel działa jak dziś. Tier serwera trzyma
// kolumna guilds.tier (nadawana przez webhook Stripe w kolejnym przyroście M5). Tier czytany
// dla AKTUALNEGO serwera (przez chokepoint getPrimaryGuildId). Dependency-free (jak Sentry/Twitch).
import { hasSupabase, supabase } from './supabase';

export type Tier = 'free' | 'premium';

// Billing aktywny tylko z kluczem Stripe. Bez niego: brak płatności, brak gatingu premium.
export function billingEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

// Tier serwera z DB (guilds.tier). Brak chmury/wiersza → 'free'.
export async function getGuildTier(guildId: string): Promise<Tier> {
  if (!guildId || !hasSupabase) return 'free';
  try {
    const { data, error } = await supabase()
      .from('guilds')
      .select('tier')
      .eq('guild_id', guildId)
      .limit(1);
    if (error || !data || !data.length) return 'free';
    return (data[0] as { tier?: string | null }).tier === 'premium' ? 'premium' : 'free';
  } catch {
    return 'free';
  }
}

// Czy plugin jest dostępny dla danego tieru serwera. Premium-plugin na 'free' → zablokowany,
// ALE tylko gdy billing włączony (bez billingu nie paywall'ujemy — wszystko dostępne).
export function canUsePlugin(tierRequired: Tier, guildTier: Tier): boolean {
  if (!billingEnabled()) return true;
  if (tierRequired !== 'premium') return true;
  return guildTier === 'premium';
}

// ── M5 część 2 — billing Stripe (env-gated, dependency-free) ─────────────────

// Ustawia tier serwera (+ opcjonalnie identyfikatory Stripe). Idempotentne (upsert).
export async function setGuildTier(
  guildId: string,
  tier: Tier,
  stripe?: { customerId?: string; subId?: string },
): Promise<boolean> {
  if (!guildId || !hasSupabase) return false;
  try {
    const row: Record<string, unknown> = { guild_id: guildId, tier };
    if (stripe?.customerId) row.stripe_customer_id = stripe.customerId;
    if (stripe?.subId) row.stripe_sub_id = stripe.subId;
    await supabase().from('guilds').upsert([row], { onConflict: 'guild_id' });
    return true;
  } catch {
    return false;
  }
}

// Downgrade po anulowaniu subskrypcji — znajdź serwer po stripe_sub_id → 'free'.
export async function downgradeBySubscription(subId: string): Promise<boolean> {
  if (!subId || !hasSupabase) return false;
  try {
    await supabase().from('guilds').update({ tier: 'free' }).eq('stripe_sub_id', subId);
    return true;
  } catch {
    return false;
  }
}

// Tworzy sesję Stripe Checkout (subskrypcja premium serwera). URL lub null. Surowy POST do API
// Stripe (form-encoded, bez zależności). Wymaga STRIPE_SECRET_KEY + STRIPE_PRICE_ID.
export async function createCheckoutSession(
  guildId: string,
  origin: string,
): Promise<string | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRICE_ID;
  if (!key || !price || !guildId) return null;
  try {
    const body = new URLSearchParams({
      mode: 'subscription',
      'line_items[0][price]': price,
      'line_items[0][quantity]': '1',
      client_reference_id: guildId,
      'metadata[guild_id]': guildId,
      success_url: `${origin}/marketplace?upgraded=1`,
      cancel_url: `${origin}/marketplace`,
    });
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { url?: string };
    return j.url ?? null;
  } catch {
    return null;
  }
}

// Weryfikacja podpisu webhooka Stripe: HMAC-SHA256 nad `${t}.${rawBody}`, porównanie w stałym
// czasie + tolerancja 5 min (anty-replay). Web Crypto — działa na Edge i w Node.
export async function verifyStripeSignature(
  rawBody: string,
  sigHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!sigHeader || !secret) return false;
  const parts: Record<string, string> = {};
  for (const kv of sigHeader.split(',')) {
    const i = kv.indexOf('=');
    if (i > 0) parts[kv.slice(0, i).trim()] = kv.slice(i + 1).trim();
  }
  const t = Number(parts.t);
  const v1 = parts.v1;
  if (!Number.isFinite(t) || !v1) return false;
  if (Math.abs(Date.now() / 1000 - t) > 300) return false; // poza tolerancją → odrzuć
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const mac = await crypto.subtle.sign('HMAC', key, enc.encode(`${parts.t}.${rawBody}`));
    const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
    return timingSafeEqualHex(hex, v1);
  } catch {
    return false;
  }
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
