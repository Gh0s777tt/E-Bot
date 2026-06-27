// Tor M — dane do PUBLICZNYCH stron (/p/*): rankingi i profil. Czyta Supabase (server-side).
import { hasSupabase, supabase } from './supabase';

// Fail-fast: publiczne strony (/p/*) renderują się server-side i bez tego zapytanie, które WISI
// (Supabase wolny/niedostępny/zły klucz), zostawia stronę na fallbacku „Ładowanie…" w nieskończoność.
// Po PUBLIC_FETCH_TIMEOUT_MS degradujemy do pustki (przez istniejące try/catch) zamiast blokować render.
const PUBLIC_FETCH_TIMEOUT_MS = 7000;
function withTimeout<T>(p: PromiseLike<T>, ms = PUBLIC_FETCH_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('supabase-timeout')), ms);
  });
  return Promise.race([Promise.resolve(p).finally(() => clearTimeout(timer)), timeout]);
}

export type LbRow = { user_id: string; username: string; value: number; sub?: string };

export async function topXp(limit = 15): Promise<LbRow[]> {
  if (!hasSupabase) return [];
  try {
    const { data, error } = await withTimeout(
      supabase()
        .from('user_levels')
        .select('user_id,username,xp,level')
        .order('xp', { ascending: false })
        .limit(limit),
    );
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
    const { data, error } = await withTimeout(
      supabase()
        .from('economy_users')
        .select('user_id,username,wallet,bank')
        .order('wallet', { ascending: false })
        .limit(80),
    );
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

export type ClanRow = { id: string; name: string; owner_id: string; bank: number; members: number };

// Ranking klanów wg wspólnego banku (+ liczebność z clan_members). Bez filtra guild — spójnie z topEco
// (instancja = serwer główny). Graceful: pusta lista przy braku Supabase / błędzie / timeoucie.
export async function topClans(limit = 25): Promise<ClanRow[]> {
  if (!hasSupabase) return [];
  try {
    const [clansRes, membersRes] = await Promise.all([
      withTimeout(
        supabase()
          .from('clans')
          .select('id,name,owner_id,bank')
          .order('bank', { ascending: false })
          .limit(limit),
      ),
      withTimeout(supabase().from('clan_members').select('clan_id')),
    ]);
    if (clansRes.error) throw new Error(clansRes.error.message);
    const counts = new Map<string, number>();
    for (const m of (membersRes.data ?? []) as { clan_id: string }[]) {
      counts.set(m.clan_id, (counts.get(m.clan_id) ?? 0) + 1);
    }
    return (
      (clansRes.data ?? []) as { id: string; name: string; owner_id: string; bank: number | null }[]
    ).map((c) => ({
      id: c.id,
      name: c.name,
      owner_id: c.owner_id,
      bank: c.bank || 0,
      members: counts.get(c.id) ?? 0,
    }));
  } catch {
    return [];
  }
}

// Top aktywni (suma wiadomości w oknie N dni; voice w podpisie). Agregacja po user_id.
export async function topActive(limit = 15, days = 30): Promise<LbRow[]> {
  if (!hasSupabase) return [];
  try {
    // Agregacja po stronie DB (RPC `top_active` — dashboard/scripts/topactive-rpc.sql): Postgres grupuje
    // i zwraca top-N zamiast ciągnięcia całego okna i sumowania w JS. Fallback niżej, gdy RPC nieutworzony.
    const rpc = await withTimeout(supabase().rpc('top_active', { p_days: days, p_limit: limit }));
    if (!rpc.error && Array.isArray(rpc.data)) {
      return (
        rpc.data as { user_id: string; username: string | null; value: number; voice_min: number }[]
      ).map((r) => ({
        user_id: r.user_id,
        username: r.username || r.user_id,
        value: r.value || 0,
        sub:
          (r.voice_min || 0) >= 60
            ? `${Math.floor((r.voice_min || 0) / 60)}h voice`
            : `${r.voice_min || 0}m voice`,
      }));
    }
    // Fallback (RPC nieutworzony): skan okna + agregacja w JS — dotychczasowe zachowanie, zero regresji.
    const since = new Date(Date.now() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
    const { data, error } = await withTimeout(
      supabase()
        .from('user_activity')
        .select('user_id,username,messages,voice_min')
        .gte('day', since),
    );
    if (error) throw new Error(error.message);
    type DbRow = { user_id: string; username?: string; messages?: number; voice_min?: number };
    const map = new Map<string, { username: string; messages: number; voice: number }>();
    for (const r of (data ?? []) as DbRow[]) {
      const cur = map.get(r.user_id) ?? {
        username: r.username || r.user_id,
        messages: 0,
        voice: 0,
      };
      cur.messages += r.messages || 0;
      cur.voice += r.voice_min || 0;
      if (r.username) cur.username = r.username;
      map.set(r.user_id, cur);
    }
    return [...map.entries()]
      .map(([user_id, v]) => ({
        user_id,
        username: v.username,
        value: v.messages,
        sub: v.voice >= 60 ? `${Math.floor(v.voice / 60)}h voice` : `${v.voice}m voice`,
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
    const [lvl, eco, inv, badges] = await withTimeout(
      Promise.all([
        sb.from('user_levels').select('username,xp,level').eq('user_id', uid).maybeSingle(),
        sb.from('economy_users').select('username,wallet,bank').eq('user_id', uid).maybeSingle(),
        sb
          .from('invites')
          .select('invited_id')
          .eq('inviter_id', uid)
          .eq('fake', false)
          .eq('has_left', false),
        sb.from('user_badges').select('badge_id').eq('user_id', uid),
      ]),
    );
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

// ── Karta profilu (dashboard) — bogatsza: poziom + pasek XP, ranking, ekonomia, wiadomości, voice ──
// Krzywa XP musi zgadzać się z bot/src/leveling.mts: do awansu z L na L+1 trzeba 5L²+50L+100 XP.
function xpToNextLevel(level: number): number {
  return 5 * level * level + 50 * level + 100;
}
function levelProgress(totalXp: number): { level: number; inLevel: number; forLevel: number } {
  let lvl = 0;
  let acc = 0;
  while (lvl < 1000 && acc + xpToNextLevel(lvl) <= totalXp) {
    acc += xpToNextLevel(lvl);
    lvl++;
  }
  return { level: lvl, inLevel: Math.max(0, totalXp - acc), forLevel: xpToNextLevel(lvl) };
}

export type ProfileCardData = {
  found: boolean;
  username: string;
  level: number;
  xp: number;
  inLevel: number;
  forLevel: number;
  rank: number;
  wallet: number;
  bank: number;
  messages: number;
  voiceMin: number;
  invites: number;
  badges: number;
  badgeIds: string[];
  dailyStreak: number;
  items: number;
  history: { delta: number; reason: string; ts: number }[];
  flowSeries: number[];
};

export async function profileCard(uid: string): Promise<ProfileCardData> {
  const empty: ProfileCardData = {
    found: false,
    username: uid,
    level: 0,
    xp: 0,
    inLevel: 0,
    forLevel: xpToNextLevel(0),
    rank: 0,
    wallet: 0,
    bank: 0,
    messages: 0,
    voiceMin: 0,
    invites: 0,
    badges: 0,
    badgeIds: [],
    dailyStreak: 0,
    items: 0,
    history: [],
    flowSeries: [],
  };
  if (!hasSupabase) return empty;
  try {
    const sb = supabase();
    const [lvl, eco, act, inv, badges, invtory, tx] = await withTimeout(
      Promise.all([
        sb.from('user_levels').select('username,xp,level').eq('user_id', uid).maybeSingle(),
        sb
          .from('economy_users')
          .select('username,wallet,bank,daily_streak')
          .eq('user_id', uid)
          .maybeSingle(),
        sb.from('user_activity').select('messages,voice_min').eq('user_id', uid),
        sb
          .from('invites')
          .select('invited_id')
          .eq('inviter_id', uid)
          .eq('fake', false)
          .eq('has_left', false),
        sb.from('user_badges').select('badge_id').eq('user_id', uid),
        sb.from('economy_inventory').select('qty').eq('user_id', uid),
        sb
          .from('economy_tx')
          .select('delta,reason,created_at')
          .eq('user_id', uid)
          .order('created_at', { ascending: true })
          .limit(40),
      ]),
    );
    const l = (lvl.data ?? null) as { username?: string; xp?: number; level?: number } | null;
    const e = (eco.data ?? null) as {
      username?: string;
      wallet?: number;
      bank?: number;
      daily_streak?: number;
    } | null;
    const xp = l?.xp ?? 0;
    const prog = levelProgress(xp);
    const actRows = (act.data ?? []) as { messages?: number; voice_min?: number }[];
    let rank = 0;
    if (xp > 0) {
      const { count } = await withTimeout(
        sb.from('user_levels').select('user_id', { count: 'exact', head: true }).gt('xp', xp),
      );
      rank = (count ?? 0) + 1;
    }
    // Transakcje (rosnąco) → historia (8 najnowszych) + seria ≈salda (rekonstrukcja z bieżącego stanu).
    const txRows = (
      (tx.data ?? []) as { delta?: number; reason?: string; created_at?: string }[]
    ).map((r) => ({
      delta: r.delta ?? 0,
      reason: r.reason ?? '',
      ts: r.created_at ? Date.parse(r.created_at) : 0,
    }));
    const total = (e?.wallet ?? 0) + (e?.bank ?? 0);
    const sumD = txRows.reduce((acc, r) => acc + r.delta, 0);
    let run = total - sumD;
    const flow: number[] = [];
    if (txRows.length >= 2) {
      flow.push(Math.max(0, Math.round(run)));
      for (const r of txRows) {
        run += r.delta;
        flow.push(Math.max(0, Math.round(run)));
      }
    }
    const history = txRows.slice(-8).reverse();
    return {
      found: Boolean(l || e),
      username: l?.username || e?.username || uid,
      level: l?.level ?? prog.level,
      xp,
      inLevel: prog.inLevel,
      forLevel: prog.forLevel,
      rank,
      wallet: e?.wallet ?? 0,
      bank: e?.bank ?? 0,
      messages: actRows.reduce((s, r) => s + (r.messages || 0), 0),
      voiceMin: actRows.reduce((s, r) => s + (r.voice_min || 0), 0),
      invites: (inv.data ?? []).length,
      badges: (badges.data ?? []).length,
      badgeIds: ((badges.data ?? []) as { badge_id: string }[]).map((b) => b.badge_id),
      dailyStreak: e?.daily_streak ?? 0,
      items: ((invtory.data ?? []) as { qty?: number }[]).reduce((s, r) => s + (r.qty || 0), 0),
      history,
      flowSeries: flow,
    };
  } catch {
    return empty;
  }
}
