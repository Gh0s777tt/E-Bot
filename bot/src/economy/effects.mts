// Tor B — chwilowe efekty itemów (XP-boost, tarcza anty-rabunek). Trzymane W PAMIĘCI:
// krótkotrwałe, więc restart bota je czyści (akceptowalny limit MVP, zero zapisów per-wiadomość).
const active = new Map<string, number>(); // klucz guild:user:effect → expiresAt (ms)
const k = (g: string, u: string, e: string): string => `${g}:${u}:${e}`;

export function activateEffect(
  guildId: string,
  userId: string,
  effect: string,
  durationMs: number,
): void {
  active.set(k(guildId, userId, effect), Date.now() + durationMs);
}

export function hasEffect(guildId: string, userId: string, effect: string): boolean {
  const exp = active.get(k(guildId, userId, effect));
  if (!exp) return false;
  if (exp < Date.now()) {
    active.delete(k(guildId, userId, effect));
    return false;
  }
  return true;
}

export function xpMultiplier(guildId: string, userId: string): number {
  return hasEffect(guildId, userId, 'xp2') ? 2 : 1;
}
