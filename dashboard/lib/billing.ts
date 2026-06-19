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
