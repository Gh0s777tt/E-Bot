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

// ── Premium: stan efektywny + wygasanie (czyste, testowalne) ─────────────────
// Manual-grant z datą końca WYGASA (premium_until < now → free). Stripe trzyma się webhooka
// (subscription.deleted/updated), więc po dacie go NIE wygaszamy — brak eventu nie ma kasować premium.
export function isPremiumActive(
  tier: string | null | undefined,
  premiumUntil: string | null | undefined,
  source: string | null | undefined,
  now: number,
): boolean {
  if (tier !== 'premium') return false;
  if (source === 'manual' && premiumUntil) {
    const t = Date.parse(premiumUntil);
    if (Number.isFinite(t) && t < now) return false;
  }
  return true;
}

// Pola wiersza guilds dla ręcznego nadania Premium (gift/współpraca). days≤0/null → bezterminowo.
export function premiumGrantFields(days: number | null, grantedBy: string, now: number) {
  return {
    tier: 'premium' as const,
    premium_source: 'manual' as const,
    premium_since: new Date(now).toISOString(),
    premium_until: days && days > 0 ? new Date(now + days * 86_400_000).toISOString() : null,
    premium_granted_by: grantedBy,
  };
}

export type PremiumInfo = {
  tier: Tier;
  source: string | null;
  since: string | null;
  until: string | null;
};
export type PremiumRow = PremiumInfo & {
  guildId: string;
  name: string | null;
  grantedBy: string | null;
  active: boolean;
};

// Tier serwera z DB (z uwzględnieniem wygasania ręcznych nadań). Brak chmury/wiersza → 'free'.
export async function getGuildTier(guildId: string): Promise<Tier> {
  if (!guildId || !hasSupabase) return 'free';
  try {
    const { data, error } = await supabase()
      .from('guilds')
      .select('tier, premium_until, premium_source')
      .eq('guild_id', guildId)
      .limit(1);
    if (error || !data || !data.length) return 'free';
    const r = data[0] as {
      tier?: string | null;
      premium_until?: string | null;
      premium_source?: string | null;
    };
    return isPremiumActive(r.tier, r.premium_until, r.premium_source, Date.now())
      ? 'premium'
      : 'free';
  } catch {
    return 'free';
  }
}

// Szczegóły Premium bieżącego serwera (sekcja „Plan" w panelu). Brak danych → free/null.
export async function getPremiumInfo(guildId: string): Promise<PremiumInfo> {
  const none: PremiumInfo = { tier: 'free', source: null, since: null, until: null };
  if (!guildId || !hasSupabase) return none;
  try {
    const { data, error } = await supabase()
      .from('guilds')
      .select('tier, premium_source, premium_since, premium_until')
      .eq('guild_id', guildId)
      .limit(1);
    if (error || !data || !data.length) return none;
    const r = data[0] as Record<string, unknown>;
    const active = isPremiumActive(
      r.tier as string,
      r.premium_until as string,
      r.premium_source as string,
      Date.now(),
    );
    return {
      tier: active ? 'premium' : 'free',
      source: (r.premium_source as string) ?? null,
      since: (r.premium_since as string) ?? null,
      until: (r.premium_until as string) ?? null,
    };
  } catch {
    return none;
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
  stripe?: { customerId?: string; subId?: string; until?: string | null },
): Promise<boolean> {
  if (!guildId || !hasSupabase) return false;
  try {
    const row: Record<string, unknown> = { guild_id: guildId, tier };
    if (tier === 'premium') {
      row.premium_source = 'stripe';
      row.premium_since = new Date().toISOString();
      if (stripe?.until !== undefined) row.premium_until = stripe.until;
    }
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
    await supabase()
      .from('guilds')
      .update({ tier: 'free', premium_source: null, premium_until: null })
      .eq('stripe_sub_id', subId);
    return true;
  } catch {
    return false;
  }
}

// Aktualizacja daty końca okresu (Stripe subscription.created/updated) — po stripe_sub_id.
export async function setPremiumUntilBySub(subId: string, until: string | null): Promise<boolean> {
  if (!subId || !hasSupabase) return false;
  try {
    await supabase()
      .from('guilds')
      .update({ tier: 'premium', premium_source: 'stripe', premium_until: until })
      .eq('stripe_sub_id', subId);
    return true;
  } catch {
    return false;
  }
}

// Ręczne nadanie Premium (gift/współpraca/test) — owner-only (bramka w /api/dev/premium). Idempotentne.
export async function grantPremium(
  guildId: string,
  days: number | null,
  grantedBy: string,
): Promise<boolean> {
  if (!guildId || !hasSupabase) return false;
  try {
    const row = { guild_id: guildId, ...premiumGrantFields(days, grantedBy, Date.now()) };
    await supabase().from('guilds').upsert([row], { onConflict: 'guild_id' });
    return true;
  } catch {
    return false;
  }
}

// Odebranie Premium (manual) — czyści pola Premium i wraca na 'free'.
export async function revokePremium(guildId: string): Promise<boolean> {
  if (!guildId || !hasSupabase) return false;
  try {
    await supabase()
      .from('guilds')
      .update({
        tier: 'free',
        premium_source: null,
        premium_since: null,
        premium_until: null,
        premium_granted_by: null,
      })
      .eq('guild_id', guildId);
    return true;
  } catch {
    return false;
  }
}

// Lista wszystkich serwerów Premium (globalny widok właściciela na /diagnostics). Najnowsze pierwsze.
export async function listPremiumGuilds(): Promise<PremiumRow[]> {
  if (!hasSupabase) return [];
  try {
    const { data, error } = await supabase()
      .from('guilds')
      .select(
        'guild_id, name, tier, premium_source, premium_since, premium_until, premium_granted_by',
      )
      .eq('tier', 'premium');
    if (error || !data) return [];
    const now = Date.now();
    return (data as Record<string, unknown>[])
      .map((r) => ({
        guildId: String(r.guild_id),
        name: (r.name as string) ?? null,
        tier: 'premium' as const,
        source: (r.premium_source as string) ?? null,
        since: (r.premium_since as string) ?? null,
        until: (r.premium_until as string) ?? null,
        grantedBy: (r.premium_granted_by as string) ?? null,
        active: isPremiumActive(
          'premium',
          r.premium_until as string,
          r.premium_source as string,
          now,
        ),
      }))
      .sort((a, b) => (b.since ?? '').localeCompare(a.since ?? ''));
  } catch {
    return [];
  }
}

// Tworzy sesję Stripe Checkout (subskrypcja premium serwera). URL lub null. Surowy POST do API
// Stripe (form-encoded, bez zależności). Wymaga STRIPE_SECRET_KEY + STRIPE_PRICE_ID. Plan 'year'
// używa STRIPE_PRICE_ID_YEAR (fallback do miesięcznego, gdy roczny price nieustawiony).
export async function createCheckoutSession(
  guildId: string,
  origin: string,
  plan: 'month' | 'year' = 'month',
): Promise<string | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  const price =
    plan === 'year'
      ? process.env.STRIPE_PRICE_ID_YEAR || process.env.STRIPE_PRICE_ID
      : process.env.STRIPE_PRICE_ID;
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
