// Insights pulpitu: wzrost serwera + alarm anti-raid. Czyta klucze pisane przez bota
// ('server_history' globalnie, 'antiraid_state' PER-SERWER) z Supabase, server-side.
import { getGuildRawSetting, getRawSetting } from './data';
import type { PanelLocale } from './panelI18n';

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
    const raw = await getGuildRawSetting('antiraid_state');
    if (!raw) return { events: [], lastRaidAt: 0 };
    const d = JSON.parse(raw) as Partial<AntiraidState>;
    return { events: Array.isArray(d.events) ? d.events : [], lastRaidAt: d.lastRaidAt ?? 0 };
  } catch {
    return { events: [], lastRaidAt: 0 };
  }
}

// Względny czas „X temu" zależny od języka panelu. Intl.RelativeTimeFormat daje natywną
// pluralizację dla wszystkich 14 języków (kody PanelLocale = poprawne tagi BCP47). Server-side.
export function relTime(ts: number, now: number, lang: PanelLocale = 'pl'): string {
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return rtf.format(-s, 'second');
  const m = Math.round(s / 60);
  if (m < 60) return rtf.format(-m, 'minute');
  const h = Math.round(m / 60);
  if (h < 24) return rtf.format(-h, 'hour');
  const d = Math.round(h / 24);
  return rtf.format(-d, 'day');
}
