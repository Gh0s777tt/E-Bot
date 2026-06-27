// Klany / gildie (gamifikacja, eko 2.0). Grupa graczy w obrębie serwera; wspólny „bank" (pula coinów
// z dotacji członków) napędza ranking klanów. Jeden klan na usera/serwer; założenie to sink (koszt
// waluty). Dane w Supabase: `clans` (klan + bank) oraz `clan_members` (przynależność). Czyste funkcje
// (walidacja nazwy, klucz, sortowanie, ranking, walidacja dotacji) → testy; IO graceful no-op bez chmury.
import { cloudDelete, cloudSelect, cloudUpsert, hasCloud } from '../lib/cloud.mts';

export const MIN_CLAN_NAME = 3;
export const MAX_CLAN_NAME = 24;
export const CLAN_CREATE_COST = 10000; // koszt założenia klanu (sink waluty serwera)
export const MAX_CLAN_MEMBERS = 50; // miękki limit liczebności

export type Clan = {
  guild_id: string;
  id: string; // deterministyczny klucz z nazwy (URL-safe, niezależny od alfabetu)
  name: string; // nazwa wyświetlana (oryginalny zapis)
  owner_id: string;
  bank: number;
  created_at: string | null;
};

export type ClanMember = {
  guild_id: string;
  clan_id: string;
  user_id: string;
  joined_at: string | null;
};

// Normalizacja + walidacja nazwy: trim, zwiń wielokrotne spacje. null = poza zakresem długości.
export function normalizeClanName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, ' ');
  if (name.length < MIN_CLAN_NAME || name.length > MAX_CLAN_NAME) return null;
  return name;
}

// Deterministyczny klucz klanu z nazwy (FNV-1a 32-bit → base36). URL-safe i NIEZALEŻNY od alfabetu
// (cyrylica/CJK/arabski dają poprawny, niepusty klucz — w przeciwieństwie do slugifikacji ASCII).
// Wielkość liter i nadmiarowe spacje są ignorowane → „Wojownicy" i „wojownicy" to ten sam klan.
export function clanKey(name: string): string {
  const canon = name.trim().replace(/\s+/g, ' ').toLowerCase();
  let h = 0x811c9dc5;
  for (let i = 0; i < canon.length; i++) {
    h ^= canon.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return (h >>> 0).toString(36);
}

// Ranking klanów: malejąco wg banku, remis → nazwa rosnąco (stabilne, deterministyczne).
export function sortClansByBank(clans: Clan[]): Clan[] {
  return [...clans].sort((a, b) => b.bank - a.bank || a.name.localeCompare(b.name));
}

// Pozycja klanu (1-based) w rankingu wg banku. 0 = nie znaleziono.
export function clanRankByBank(clans: Clan[], id: string): number {
  const idx = sortClansByBank(clans).findIndex((c) => c.id === id);
  return idx < 0 ? 0 : idx + 1;
}

// Walidacja dotacji do banku klanu. 'amount' = nie-dodatnia/niecałkowita, 'funds' = brak środków.
export function donationError(amount: number, wallet: number): 'amount' | 'funds' | null {
  if (!Number.isInteger(amount) || amount <= 0) return 'amount';
  if (amount > wallet) return 'funds';
  return null;
}

// ── IO (Supabase, graceful no-op bez chmury) ─────────────────────────────────────────────────────
export async function getClan(guildId: string, id: string): Promise<Clan | null> {
  if (!hasCloud()) return null;
  const rows = await cloudSelect<Clan>('clans', `select=*&guild_id=eq.${guildId}&id=eq.${id}`);
  return rows[0] ?? null;
}

export async function getClanByName(guildId: string, name: string): Promise<Clan | null> {
  return getClan(guildId, clanKey(name));
}

export async function listClans(guildId: string): Promise<Clan[]> {
  if (!hasCloud()) return [];
  return cloudSelect<Clan>('clans', `select=*&guild_id=eq.${guildId}`);
}

export async function getMembership(guildId: string, userId: string): Promise<ClanMember | null> {
  if (!hasCloud()) return null;
  const rows = await cloudSelect<ClanMember>(
    'clan_members',
    `select=*&guild_id=eq.${guildId}&user_id=eq.${userId}`,
  );
  return rows[0] ?? null;
}

export async function listMembers(guildId: string, clanId: string): Promise<ClanMember[]> {
  if (!hasCloud()) return [];
  return cloudSelect<ClanMember>(
    'clan_members',
    `select=*&guild_id=eq.${guildId}&clan_id=eq.${clanId}`,
  );
}

// Tworzy LUB aktualizuje klan (np. zmiana banku / przekazanie własności) — upsert po (guild_id,id).
export async function saveClan(c: Clan): Promise<void> {
  if (!hasCloud()) return;
  await cloudUpsert('clans', [{ ...c }], 'guild_id,id');
}

export async function addMember(m: ClanMember): Promise<void> {
  if (!hasCloud()) return;
  await cloudUpsert('clan_members', [{ ...m }], 'guild_id,user_id');
}

export async function removeMember(guildId: string, userId: string): Promise<void> {
  if (!hasCloud()) return;
  await cloudDelete('clan_members', `guild_id=eq.${guildId}&user_id=eq.${userId}`);
}

// Rozwiązanie klanu: usuwa klan i WSZYSTKICH jego członków.
export async function removeClan(guildId: string, id: string): Promise<void> {
  if (!hasCloud()) return;
  await cloudDelete('clan_members', `guild_id=eq.${guildId}&clan_id=eq.${id}`);
  await cloudDelete('clans', `guild_id=eq.${guildId}&id=eq.${id}`);
}
