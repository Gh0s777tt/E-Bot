// Faza 4 — warstwa danych panelu (leveling + tickety).
// Config trzymamy w tabeli `settings` (JSON, jak antinuke/presence) — działa od razu.
// Dane (ranking, tickety) czytamy z nowych tabel (faza4-schema.sql); brak tabeli → pusto.
import { getRawSetting, setRawSetting } from './data';
import { hasSupabase, supabase } from './supabase';

// ───────────────────────── 🏆 Leveling ─────────────────────────
export type LevelReward = { level: number; roleId: string };
export type LevelingConfig = {
  enabled: boolean;
  xpPerMessage: number;
  xpPerVoiceMin: number;
  cooldownSec: number;
  announceChannelId: string;
  rewards: LevelReward[];
};

export const LEVELING_DEFAULT: LevelingConfig = {
  enabled: false,
  xpPerMessage: 15,
  xpPerVoiceMin: 10,
  cooldownSec: 60,
  announceChannelId: '',
  rewards: [],
};

export async function getLevelingConfig(): Promise<LevelingConfig> {
  const raw = await getRawSetting('leveling_config');
  if (!raw) return structuredClone(LEVELING_DEFAULT);
  try {
    return { ...LEVELING_DEFAULT, ...(JSON.parse(raw) as Partial<LevelingConfig>) };
  } catch {
    return structuredClone(LEVELING_DEFAULT);
  }
}

export async function saveLevelingConfig(cfg: LevelingConfig): Promise<void> {
  await setRawSetting('leveling_config', JSON.stringify(cfg));
}

export type LevelRow = { user_id: string; username: string | null; xp: number; level: number };

export async function getLeaderboard(limit = 50): Promise<LevelRow[]> {
  if (!hasSupabase) return [];
  try {
    const { data, error } = await supabase()
      .from('user_levels')
      .select('user_id,username,xp,level')
      .order('xp', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as LevelRow[];
  } catch {
    return []; // tabela jeszcze nie istnieje / brak danych
  }
}

// ───────────────────────── 🎟️ Tickety ─────────────────────────
export type TicketsConfig = {
  enabled: boolean;
  categoryId: string;
  supportRoleId: string;
  welcome: string;
  logChannelId: string;
};

export const TICKETS_DEFAULT: TicketsConfig = {
  enabled: false,
  categoryId: '',
  supportRoleId: '',
  welcome: 'Dzięki za zgłoszenie! Obsługa odezwie się wkrótce.',
  logChannelId: '',
};

export async function getTicketsConfig(): Promise<TicketsConfig> {
  const raw = await getRawSetting('tickets_config');
  if (!raw) return structuredClone(TICKETS_DEFAULT);
  try {
    return { ...TICKETS_DEFAULT, ...(JSON.parse(raw) as Partial<TicketsConfig>) };
  } catch {
    return structuredClone(TICKETS_DEFAULT);
  }
}

export async function saveTicketsConfig(cfg: TicketsConfig): Promise<void> {
  await setRawSetting('tickets_config', JSON.stringify(cfg));
}

export type TicketRow = {
  id: string;
  user_id: string;
  username: string | null;
  subject: string | null;
  status: string;
  claimed_by: string | null;
  created_at: string;
  closed_at: string | null;
};

export async function getTickets(limit = 100): Promise<TicketRow[]> {
  if (!hasSupabase) return [];
  try {
    const { data, error } = await supabase()
      .from('tickets')
      .select('id,user_id,username,subject,status,claimed_by,created_at,closed_at')
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
    const { error } = await supabase()
      .from('tickets')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', id)
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
};

export const AI_DEFAULT: AiConfig = {
  enabled: false,
  model: 'deepseek',
  dailyRequestLimit: 20,
  dailyTokenLimit: 50_000,
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
    const { data, error } = await supabase()
      .from('ai_usage')
      .select('user_id,tokens_used,requests')
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
    const { data, error } = await supabase()
      .from('ai_usage')
      .select('day,tokens_used,requests')
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
    const { data, error } = await supabase()
      .from('mod_cases')
      .select('id,user_id,username,moderator_name,action,reason,created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as ModCase[];
  } catch {
    return []; // tabela jeszcze nie istnieje / brak danych
  }
}
