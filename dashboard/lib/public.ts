// Tor M — dane do PUBLICZNYCH stron (/p/*): rankingi i profil. Czyta Supabase (server-side).
import { hasSupabase, supabase } from './supabase';

export type LbRow = { user_id: string; username: string; value: number; sub?: string };

export async function topXp(limit = 15): Promise<LbRow[]> {
  if (!hasSupabase) return [];
  try {
    const { data, error } = await supabase()
      .from('user_levels')
      .select('user_id,username,xp,level')
      .order('xp', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []).map(
      (r: { user_id: string; username?: string; xp?: number; level?: number }) => ({
        user_id: r.user_id,
        username: r.username || r.user_id,
        value: r.xp || 0,
        sub: `lvl ${r.level ?? 0}`,
      }),
    );
  } catch {
    return [];
  }
}

export async function topEco(limit = 15): Promise<LbRow[]> {
  if (!hasSupabase) return [];
  try {
    const { data, error } = await supabase()
      .from('economy_users')
      .select('user_id,username,wallet,bank')
      .order('wallet', { ascending: false })
      .limit(80);
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((r: { user_id: string; username?: string; wallet?: number; bank?: number }) => ({
        user_id: r.user_id,
        username: r.username || r.user_id,
        value: (r.wallet || 0) + (r.bank || 0),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  } catch {
    return [];
  }
}

export type PublicProfile = {
  found: boolean;
  username: string;
  level: number;
  xp: number;
  total: number;
  invites: number;
  badges: number;
};

export async function publicProfile(uid: string): Promise<PublicProfile> {
  const empty: PublicProfile = {
    found: false,
    username: uid,
    level: 0,
    xp: 0,
    total: 0,
    invites: 0,
    badges: 0,
  };
  if (!hasSupabase) return empty;
  try {
    const sb = supabase();
    const [lvl, eco, inv, badges] = await Promise.all([
      sb.from('user_levels').select('username,xp,level').eq('user_id', uid).maybeSingle(),
      sb.from('economy_users').select('username,wallet,bank').eq('user_id', uid).maybeSingle(),
      sb
        .from('invites')
        .select('invited_id')
        .eq('inviter_id', uid)
        .eq('fake', false)
        .eq('has_left', false),
      sb.from('user_badges').select('badge_id').eq('user_id', uid),
    ]);
    const l = (lvl.data ?? null) as { username?: string; xp?: number; level?: number } | null;
    const e = (eco.data ?? null) as { username?: string; wallet?: number; bank?: number } | null;
    const found = Boolean(l || e);
    return {
      found,
      username: l?.username || e?.username || uid,
      level: l?.level ?? 0,
      xp: l?.xp ?? 0,
      total: (e?.wallet ?? 0) + (e?.bank ?? 0),
      invites: (inv.data ?? []).length,
      badges: (badges.data ?? []).length,
    };
  } catch {
    return empty;
  }
}
