// Faza 4 — warstwa danych panelu (leveling + tickety).
// Config trzymamy w tabeli `settings` (JSON, jak antinuke/presence) — działa od razu.
// Dane (ranking, tickety) czytamy z nowych tabel (faza4-schema.sql); brak tabeli → pusto.
import { getConfigSetting, getRawSetting, setConfigSetting, setRawSetting } from './data';
import { getPrimaryGuildId } from './guild';
import type { RichMessage } from './richMessage';
import { hasSupabase, supabase } from './supabase';

// ───────────────────────── 🏆 Leveling ─────────────────────────
export type LevelReward = { level: number; roleId: string };
export type LevelMultiplier = { roleId: string; factor: number };
export type LevelingConfig = {
  enabled: boolean;
  xpPerMessage: number;
  xpPerVoiceMin: number;
  cooldownSec: number;
  announceChannelId: string;
  rewards: LevelReward[];
  weekendBonus: number;
  multipliers: LevelMultiplier[];
  noXpChannels: string[];
  noXpRoles: string[];
  voiceAntiAfk: boolean;
  stackRewards: boolean;
  levelUpMessage: string;
  levelUpDm: boolean;
  achievementsEnabled: boolean;
  prestigeEnabled: boolean;
  prestigeLevel: number;
  prestigeRoleId: string;
  difficulty: 'easy' | 'normal' | 'hard';
};

export const LEVELING_DEFAULT: LevelingConfig = {
  enabled: false,
  xpPerMessage: 15,
  xpPerVoiceMin: 10,
  cooldownSec: 60,
  announceChannelId: '',
  rewards: [],
  weekendBonus: 1,
  multipliers: [],
  noXpChannels: [],
  noXpRoles: [],
  voiceAntiAfk: true,
  stackRewards: false,
  levelUpMessage: '',
  levelUpDm: false,
  achievementsEnabled: false,
  prestigeEnabled: false,
  prestigeLevel: 100,
  prestigeRoleId: '',
  difficulty: 'normal',
};

export async function getLevelingConfig(): Promise<LevelingConfig> {
  // Etap K — leveling_config per-serwer (router rozpoznaje zmigrowany klucz).
  const raw = await getConfigSetting('leveling_config');
  if (!raw) return structuredClone(LEVELING_DEFAULT);
  try {
    return { ...LEVELING_DEFAULT, ...(JSON.parse(raw) as Partial<LevelingConfig>) };
  } catch {
    return structuredClone(LEVELING_DEFAULT);
  }
}

export async function saveLevelingConfig(cfg: LevelingConfig): Promise<void> {
  await setConfigSetting('leveling_config', JSON.stringify(cfg));
}

export type LevelRow = { user_id: string; username: string | null; xp: number; level: number };

export async function getLeaderboard(limit = 50): Promise<LevelRow[]> {
  if (!hasSupabase) return [];
  try {
    // Scoped do bieżącego serwera (chokepoint) — bez tego ranking przeciekał między tenantami.
    const gid = await getPrimaryGuildId();
    const { data, error } = await supabase()
      .from('user_levels')
      .select('user_id,username,xp,level')
      .eq('guild_id', gid)
      .order('xp', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as LevelRow[];
  } catch {
    return []; // tabela jeszcze nie istnieje / brak danych
  }
}

// ───────────────────────── 🎟️ Tickety ─────────────────────────
export type TicketCategory = {
  id: string;
  label: string;
  emoji: string;
  style: 'primary' | 'secondary' | 'success' | 'danger';
  supportRoleId: string;
  welcome: string;
};
export type TicketsConfig = {
  enabled: boolean;
  categoryId: string;
  supportRoleId: string;
  welcome: string;
  logChannelId: string;
  panelMessage: string;
  panelSpec?: RichMessage;
  categories?: TicketCategory[];
  ratingEnabled: boolean;
  slaHours: number;
  questions?: string[]; // pytania formularza przed otwarciem (max 4)
};

export const TICKETS_DEFAULT: TicketsConfig = {
  enabled: false,
  categoryId: '',
  supportRoleId: '',
  welcome: 'Dzięki za zgłoszenie! Obsługa odezwie się wkrótce.',
  logChannelId: '',
  panelMessage: 'Masz sprawę? Otwórz ticket — kliknij poniżej. 🎟️',
  categories: [],
  ratingEnabled: true,
  slaHours: 0,
  questions: [],
};

export async function getTicketsConfig(): Promise<TicketsConfig> {
  const raw = await getConfigSetting('tickets_config');
  if (!raw) return structuredClone(TICKETS_DEFAULT);
  try {
    return { ...TICKETS_DEFAULT, ...(JSON.parse(raw) as Partial<TicketsConfig>) };
  } catch {
    return structuredClone(TICKETS_DEFAULT);
  }
}

export async function saveTicketsConfig(cfg: TicketsConfig): Promise<void> {
  await setConfigSetting('tickets_config', JSON.stringify(cfg));
}

export type TicketRow = {
  id: string;
  channel_id: string | null;
  user_id: string;
  username: string | null;
  subject: string | null;
  status: string;
  claimed_by: string | null;
  created_at: string;
  closed_at: string | null;
  rating: number | null;
};

export async function getTickets(limit = 100): Promise<TicketRow[]> {
  if (!hasSupabase) return [];
  try {
    const gid = await getPrimaryGuildId(); // scoped per-serwer (anty-przeciek tenantów)
    if (!gid) return [];
    const { data, error } = await supabase()
      .from('tickets')
      .select(
        'id,channel_id,user_id,username,subject,status,claimed_by,created_at,closed_at,rating',
      )
      .eq('guild_id', gid)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as TicketRow[];
  } catch {
    return [];
  }
}

export function ticketStats(rows: TicketRow[]): { open: number; claimed: number; closed: number } {
  return {
    open: rows.filter((t) => t.status === 'open').length,
    claimed: rows.filter((t) => t.status === 'claimed').length,
    closed: rows.filter((t) => t.status === 'closed').length,
  };
}

// Zamknięcie ticketu z panelu (bot zarchiwizuje wątek przez poller ticket-sync).
export async function closeTicket(id: string): Promise<boolean> {
  if (!hasSupabase) return false;
  try {
    const gid = await getPrimaryGuildId(); // anty-IDOR: tylko ticket z bieżącego serwera
    if (!gid) return false;
    const { error } = await supabase()
      .from('tickets')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('guild_id', gid)
      .neq('status', 'closed');
    if (error) throw new Error(error.message);
    return true;
  } catch (e) {
    console.warn('[faza4] closeTicket:', (e as Error).message);
    return false;
  }
}

// ───────────────────────── 🤖 Komendy AI ─────────────────────────
export type AiConfig = {
  enabled: boolean;
  model: 'deepseek' | 'openai';
  dailyRequestLimit: number;
  dailyTokenLimit: number;
  persona: string;
};

export const AI_DEFAULT: AiConfig = {
  enabled: false,
  model: 'deepseek',
  dailyRequestLimit: 20,
  dailyTokenLimit: 50_000,
  persona: '',
};

export async function getAiConfig(): Promise<AiConfig> {
  const raw = await getRawSetting('ai_config');
  if (!raw) return structuredClone(AI_DEFAULT);
  try {
    return { ...AI_DEFAULT, ...(JSON.parse(raw) as Partial<AiConfig>) };
  } catch {
    return structuredClone(AI_DEFAULT);
  }
}

export async function saveAiConfig(cfg: AiConfig): Promise<void> {
  await setRawSetting('ai_config', JSON.stringify(cfg));
}

export type AiUsageStat = { user_id: string; tokens_used: number; requests: number };

export async function getAiUsageToday(): Promise<{
  totalTokens: number;
  totalRequests: number;
  users: number;
  top: AiUsageStat[];
}> {
  const empty = { totalTokens: 0, totalRequests: 0, users: 0, top: [] as AiUsageStat[] };
  if (!hasSupabase) return empty;
  try {
    const day = new Date().toISOString().slice(0, 10);
    const gid = await getPrimaryGuildId(); // scoped per-serwer (ai_usage ma guild_id od v0.300)
    const { data, error } = await supabase()
      .from('ai_usage')
      .select('user_id,tokens_used,requests')
      .eq('guild_id', gid)
      .eq('day', day)
      .order('tokens_used', { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as AiUsageStat[];
    return {
      totalTokens: rows.reduce((a, r) => a + (r.tokens_used || 0), 0),
      totalRequests: rows.reduce((a, r) => a + (r.requests || 0), 0),
      users: rows.length,
      top: rows.slice(0, 10),
    };
  } catch {
    return empty;
  }
}

// ───────────────────────── 🧩 Reaction roles ─────────────────────────
// Config w settings (JSON) — bez nowej tabeli. Bot czyta zsynchronizowane settings i nadaje role.
export type ReactionRole = { messageId: string; emoji: string; roleId: string };

export async function getReactionRoles(): Promise<ReactionRole[]> {
  const raw = await getRawSetting('reaction_roles');
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? (arr as ReactionRole[]) : [];
  } catch {
    return [];
  }
}

export async function saveReactionRoles(list: ReactionRole[]): Promise<void> {
  await setRawSetting('reaction_roles', JSON.stringify(list));
}

// Panel reaction-role utworzony przez bota (Faza 8): embed (Message Studio) + pary emoji→rola.
export type ReactionPanel = {
  panelSpec?: RichMessage;
  pairs: { emoji: string; roleId: string }[];
  exclusive?: boolean; // „wybierz jedną" — reakcja zostawia tylko jedną rolę z panelu
};
export async function getReactionPanel(): Promise<ReactionPanel> {
  const raw = await getRawSetting('reaction_role_panel');
  if (!raw) return { pairs: [] };
  try {
    const o = JSON.parse(raw) as Partial<ReactionPanel>;
    return {
      panelSpec: o.panelSpec,
      pairs: Array.isArray(o.pairs) ? o.pairs : [],
      exclusive: o.exclusive === true,
    };
  } catch {
    return { pairs: [] };
  }
}
export async function saveReactionPanel(p: ReactionPanel): Promise<void> {
  await setRawSetting('reaction_role_panel', JSON.stringify(p));
}

// ───────────────────────── 📊 Statystyki ─────────────────────────
export type DayPoint = { day: string; tokens: number; requests: number };

export async function getAiUsageSeries(days = 14): Promise<DayPoint[]> {
  const skeleton = (): DayPoint[] => {
    const out: DayPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      out.push({
        day: new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10),
        tokens: 0,
        requests: 0,
      });
    }
    return out;
  };
  if (!hasSupabase) return skeleton();
  try {
    const since = new Date(Date.now() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
    const gid = await getPrimaryGuildId(); // scoped per-serwer (ai_usage ma guild_id od v0.300)
    const { data, error } = await supabase()
      .from('ai_usage')
      .select('day,tokens_used,requests')
      .eq('guild_id', gid)
      .gte('day', since);
    if (error) throw new Error(error.message);
    const map = new Map<string, { tokens: number; requests: number }>();
    for (const r of (data ?? []) as { day: string; tokens_used: number; requests: number }[]) {
      const cur = map.get(r.day) ?? { tokens: 0, requests: 0 };
      cur.tokens += r.tokens_used || 0;
      cur.requests += r.requests || 0;
      map.set(r.day, cur);
    }
    return skeleton().map((p) => ({ ...p, ...(map.get(p.day) ?? {}) }));
  } catch {
    return skeleton();
  }
}

// ───────────────────────── 📈 Aktywność serwera (Faza 7 / F10.1) ─────────────────────────
// Tor L — top aktywni + heatmapa godzinowa
export type TopUser = { user_id: string; username: string; messages: number; voice_min: number };
export async function getTopActiveUsers(days = 14, limit = 10): Promise<TopUser[]> {
  if (!hasSupabase) return [];
  try {
    const since = new Date(Date.now() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
    const gid = await getPrimaryGuildId(); // scoped do bieżącego serwera (anty-przeciek tenantów)
    const { data, error } = await supabase()
      .from('user_activity')
      .select('user_id,username,messages,voice_min')
      .eq('guild_id', gid)
      .gte('day', since);
    if (error) throw new Error(error.message);
    type DbRow = { user_id: string; username?: string; messages?: number; voice_min?: number };
    const map = new Map<string, TopUser>();
    for (const r of (data ?? []) as DbRow[]) {
      const cur = map.get(r.user_id) ?? {
        user_id: r.user_id,
        username: r.username || r.user_id,
        messages: 0,
        voice_min: 0,
      };
      cur.messages += r.messages || 0;
      cur.voice_min += r.voice_min || 0;
      if (r.username) cur.username = r.username;
      map.set(r.user_id, cur);
    }
    return [...map.values()].sort((a, b) => b.messages - a.messages).slice(0, limit);
  } catch {
    return [];
  }
}
export async function getHourlyActivity(): Promise<number[]> {
  const out = new Array<number>(24).fill(0);
  if (!hasSupabase) return out;
  try {
    const gid = await getPrimaryGuildId(); // scoped do bieżącego serwera (anty-przeciek tenantów)
    const { data, error } = await supabase()
      .from('activity_hourly')
      .select('hour,messages')
      .eq('guild_id', gid);
    if (error) throw new Error(error.message);
    for (const r of (data ?? []) as { hour: number; messages?: number }[]) {
      const h = Number(r.hour);
      if (h >= 0 && h < 24) out[h] = r.messages || 0;
    }
    return out;
  } catch {
    return out;
  }
}

export type ActivityPoint = {
  day: string;
  messages: number;
  joins: number;
  leaves: number;
  voice: number;
};

export async function getActivitySeries(days = 14): Promise<ActivityPoint[]> {
  const skeleton = (): ActivityPoint[] => {
    const out: ActivityPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      out.push({
        day: new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10),
        messages: 0,
        joins: 0,
        leaves: 0,
        voice: 0,
      });
    }
    return out;
  };
  if (!hasSupabase) return skeleton();
  try {
    const since = new Date(Date.now() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
    const gid = await getPrimaryGuildId(); // scoped do bieżącego serwera (anty-przeciek tenantów)
    const { data, error } = await supabase()
      .from('activity_daily')
      .select('*')
      .eq('guild_id', gid)
      .gte('day', since);
    if (error) throw new Error(error.message);
    type DbRow = {
      day: string;
      messages?: number;
      joins?: number;
      leaves?: number;
      voice_minutes?: number;
    };
    const map = new Map<
      string,
      { messages: number; joins: number; leaves: number; voice: number }
    >();
    for (const r of (data ?? []) as DbRow[]) {
      const cur = map.get(r.day) ?? { messages: 0, joins: 0, leaves: 0, voice: 0 };
      cur.messages += r.messages || 0;
      cur.joins += r.joins || 0;
      cur.leaves += r.leaves || 0;
      cur.voice += r.voice_minutes || 0;
      map.set(r.day, cur);
    }
    return skeleton().map((p) => ({ ...p, ...(map.get(p.day) ?? {}) }));
  } catch {
    return skeleton();
  }
}

// ───────────────────────── 🏆 Hall of Fame sezonów (Faza 7 / F10.2) ─────────────────────────
export type HofEntry = {
  month: string;
  user_id: string;
  username: string | null;
  xp: number;
  level: number;
  rank: number;
};

export async function getHallOfFame(limit = 10): Promise<HofEntry[]> {
  if (!hasSupabase) return [];
  try {
    const gid = await getPrimaryGuildId(); // scoped per-serwer (anty-przeciek tenantów)
    if (!gid) return [];
    const latest = await supabase()
      .from('xp_hall_of_fame')
      .select('month')
      .eq('guild_id', gid)
      .order('month', { ascending: false })
      .limit(1);
    if (latest.error) throw new Error(latest.error.message);
    const month = (latest.data?.[0] as { month?: string } | undefined)?.month;
    if (!month) return [];
    const { data, error } = await supabase()
      .from('xp_hall_of_fame')
      .select('month,user_id,username,xp,level,rank')
      .eq('guild_id', gid)
      .eq('month', month)
      .order('rank', { ascending: true })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as HofEntry[];
  } catch {
    return [];
  }
}

// ───────────────────────── 🛡️ Historia moderacji (Faza 6 / B2) ─────────────────────────
export type ModCase = {
  id: string;
  user_id: string;
  username: string | null;
  moderator_name: string | null;
  action: string; // warn | timeout | clear | kick | ban
  reason: string | null;
  created_at: string;
};

export async function getModCases(limit = 30): Promise<ModCase[]> {
  if (!hasSupabase) return [];
  try {
    const gid = await getPrimaryGuildId(); // scoped per-serwer (anty-przeciek tenantów)
    if (!gid) return [];
    const { data, error } = await supabase()
      .from('mod_cases')
      .select('id,user_id,username,moderator_name,action,reason,created_at')
      .eq('guild_id', gid)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as ModCase[];
  } catch {
    return []; // tabela jeszcze nie istnieje / brak danych
  }
}

// Aktywne tempbany (Faza 7 / F6) — bot auto-zdejmuje je po unban_at (poller co 60 s).
export type TempBan = {
  id: string;
  user_id: string;
  username: string | null;
  reason: string | null;
  unban_at: string;
  created_at: string;
};

export async function getTempBans(limit = 50): Promise<TempBan[]> {
  if (!hasSupabase) return [];
  try {
    const gid = await getPrimaryGuildId(); // scoped per-serwer (anty-przeciek tenantów)
    if (!gid) return [];
    const { data, error } = await supabase()
      .from('temp_bans')
      .select('id,user_id,username,reason,unban_at,created_at')
      .eq('guild_id', gid)
      .order('unban_at', { ascending: true })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as TempBan[];
  } catch {
    return []; // tabela jeszcze nie istnieje (f6-moderation-schema.sql) / brak danych
  }
}

// Sugestie (Faza 7 / F7.1)
export type Suggestion = {
  id: string;
  user_id: string | null;
  username: string | null;
  content: string;
  status: string; // open | approved | denied | considered
  created_at: string;
};

export async function getSuggestions(limit = 40): Promise<Suggestion[]> {
  if (!hasSupabase) return [];
  try {
    const gid = await getPrimaryGuildId(); // scoped per-serwer (anty-przeciek tenantów)
    if (!gid) return [];
    const { data, error } = await supabase()
      .from('suggestions')
      .select('id,user_id,username,content,status,created_at')
      .eq('guild_id', gid)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as Suggestion[];
  } catch {
    return []; // tabela jeszcze nie istnieje (f7-suggestions-schema.sql) / brak danych
  }
}
