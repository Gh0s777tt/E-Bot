// Małżeństwa (/marry) — magazyn w settings 'marriages' (JSON): { [guildId]: { [userId]: {partner, since} } }.
// Obie strony zapisywane symetrycznie (A→B i B→A) dla O(1) odczytu.
import { getSettings, setSetting } from './db.mts';

export type Marriage = { partner: string; since: number };
type Store = Record<string, Record<string, Marriage>>;

function load(): Store {
  const raw = getSettings().marriages;
  if (!raw) return {};
  try {
    const o = JSON.parse(raw) as Store;
    return o && typeof o === 'object' ? o : {};
  } catch {
    return {};
  }
}

function save(store: Store): void {
  setSetting('marriages', JSON.stringify(store));
}

export function getMarriage(guildId: string, userId: string): Marriage | null {
  return load()[guildId]?.[userId] ?? null;
}

export function setMarriage(guildId: string, a: string, b: string): void {
  const store = load();
  const g = store[guildId] ?? {};
  const since = Date.now();
  g[a] = { partner: b, since };
  g[b] = { partner: a, since };
  store[guildId] = g;
  save(store);
}

// Usuwa związek użytkownika (i lustrzany wpis partnera). Zwraca false, gdy nie był w związku.
export function clearMarriage(guildId: string, userId: string): boolean {
  const store = load();
  const g = store[guildId];
  const m = g?.[userId];
  if (!g || !m) return false;
  delete g[userId];
  if (g[m.partner]?.partner === userId) delete g[m.partner];
  save(store);
  return true;
}
