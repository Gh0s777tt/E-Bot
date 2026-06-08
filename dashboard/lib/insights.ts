// Insights pulpitu: wzrost serwera + alarm anti-raid. Czyta klucze pisane przez bota
// ('server_history', 'antiraid_state') przez getRawSetting (Supabase, server-side).
import { getRawSetting } from './data';

export type GrowthPoint = { day: string; members: number; boosts: number; channels: number };

export async function getServerHistory(): Promise<GrowthPoint[]> {
  try {
    const raw = await getRawSetting('server_history');
    if (!raw) return [];
    const arr = JSON.parse(raw) as GrowthPoint[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export type RaidEvent = {
  ts: number;
  type: 'raid' | 'alt' | 'young';
  detail: string;
  count: number;
};
export type AntiraidState = { events: RaidEvent[]; lastRaidAt: number };

export async function getAntiraidState(): Promise<AntiraidState> {
  try {
    const raw = await getRawSetting('antiraid_state');
    if (!raw) return { events: [], lastRaidAt: 0 };
    const d = JSON.parse(raw) as Partial<AntiraidState>;
    return { events: Array.isArray(d.events) ? d.events : [], lastRaidAt: d.lastRaidAt ?? 0 };
  } catch {
    return { events: [], lastRaidAt: 0 };
  }
}

// Względny czas „X temu" (PL), z timestampu ms. Liczone server-side na force-dynamic stronach.
export function relTime(ts: number, now: number): string {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return 'przed chwilą';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min temu`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h temu`;
  const d = Math.round(h / 24);
  return `${d} dni temu`;
}
