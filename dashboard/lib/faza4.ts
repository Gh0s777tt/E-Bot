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
