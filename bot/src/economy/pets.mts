// Etap J (eko 2.0) — pety. Adoptuj zwierzaka za walutę, karm (sink + progresja poziomu), a gdy
// jest najedzony, raz na 20 h przynosi prezent (źródło skalowane poziomem × sytością). Jeden pet
// na usera/serwer. Sytość liczona z last_fed (brak osobnej kolumny). Dane w Supabase economy_pets
// (graceful no-op bez chmury). Czas z Date.now() — bot runtime.
import { cloudDelete, cloudSelect, cloudUpsert, hasCloud } from '../lib/cloud.mts';

// Cooldown: jedno źródło prawdy w store.mts (re-eksport, by nie duplikować formuły null→Infinity / /60_000).
export { minutesSince as minutesSinceIso } from './store.mts';

export type Species = { id: string; emoji: string; adopt: number; giftBase: number };

// id = klucz i18n (pet.kind.<id>). adopt = koszt adopcji, giftBase = baza prezentu (×poziom×sytość).
export const SPECIES: Species[] = [
  { id: 'hamster', emoji: '🐹', adopt: 2000, giftBase: 30 },
  { id: 'penguin', emoji: '🐧', adopt: 3500, giftBase: 45 },
  { id: 'cat', emoji: '🐱', adopt: 5000, giftBase: 60 },
  { id: 'dog', emoji: '🐶', adopt: 5000, giftBase: 60 },
  { id: 'fox', emoji: '🦊', adopt: 8000, giftBase: 90 },
  { id: 'dragon', emoji: '🐉', adopt: 20000, giftBase: 200 },
];

export function findSpecies(id: string): Species | undefined {
  return SPECIES.find((s) => s.id === id.trim().toLowerCase());
}

export type Pet = {
  guild_id: string;
  user_id: string;
  species: string;
  name: string;
  xp: number;
  last_fed: string | null;
  last_gift: string | null;
};

const FEED_COOLDOWN_MIN = 120; // 2 h między karmieniami
const GIFT_COOLDOWN_MIN = 1200; // 20 h między prezentami
const FEED_XP = 20;
const HUNGER_DECAY_PER_H = 4; // sytość spada o 4 pkt/h → ~25 h do zera
const MAX_LEVEL = 50;

export async function getPet(guildId: string, userId: string): Promise<Pet | null> {
  if (!hasCloud()) return null;
  const rows = await cloudSelect<Pet>(
    'economy_pets',
    `select=*&guild_id=eq.${guildId}&user_id=eq.${userId}`,
  );
  return rows[0] ?? null;
}

export async function savePet(p: Pet): Promise<void> {
  if (!hasCloud()) return;
  await cloudUpsert('economy_pets', [{ ...p }], 'guild_id,user_id');
}

export async function deletePet(guildId: string, userId: string): Promise<void> {
  if (!hasCloud()) return;
  await cloudDelete('economy_pets', `guild_id=eq.${guildId}&user_id=eq.${userId}`);
}

function hoursSince(iso: string | null): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  return (Date.now() - Date.parse(iso)) / 3_600_000;
}

// Sytość 0–100 z czasu od ostatniego karmienia (karmienie ustawia 100).
export function fullness(pet: Pet): number {
  return Math.max(
    0,
    Math.min(100, Math.round(100 - hoursSince(pet.last_fed) * HUNGER_DECAY_PER_H)),
  );
}

// Poziom z XP: każdy poziom kosztuje 100 XP (kap MAX_LEVEL).
export function petLevel(xp: number): number {
  return Math.min(MAX_LEVEL, Math.floor(xp / 100) + 1);
}
export function xpIntoLevel(xp: number): { into: number; need: number } {
  // Na maksymalnym poziomie nie ma kolejnego progu → pasek pełny (bez mylącego „do poziomu 51").
  if (petLevel(xp) >= MAX_LEVEL) return { into: 100, need: 100 };
  return { into: xp % 100, need: 100 };
}

export const FEED_COOLDOWN = FEED_COOLDOWN_MIN;
export const GIFT_COOLDOWN = GIFT_COOLDOWN_MIN;
export const FEED_XP_GAIN = FEED_XP;

// Wartość prezentu = giftBase × poziom × współczynnik sytości (0.2–1.0).
export function giftValue(pet: Pet, sp: Species): number {
  const factor = 0.2 + 0.8 * (fullness(pet) / 100);
  return Math.max(1, Math.round(sp.giftBase * petLevel(pet.xp) * factor));
}

// Pasek postępu/sytości w tekście (10 segmentów).
export function bar(pct: number): string {
  const filled = Math.round((Math.max(0, Math.min(100, pct)) / 100) * 10);
  return `${'█'.repeat(filled)}${'░'.repeat(10 - filled)}`;
}

// Nastrój wg sytości — klucz i18n (pet.mood.*).
export function moodKey(pct: number): string {
  if (pct >= 70) return 'happy';
  if (pct >= 35) return 'ok';
  if (pct > 0) return 'hungry';
  return 'starving';
}

// ── Walka petów (PvP, kosmetyczna — bragging rights, bez nagród) ─────────────────────────────────
// Moc bojowa: poziom dominuje (×10), sytość modyfikuje (głodny pet słabszy), gatunek daje bazę
// (rzadszy = mocniejszy, z giftBase). Czysta funkcja → test.
export function petPower(pet: Pet): number {
  const lvl = petLevel(pet.xp);
  const full = fullness(pet);
  const sp = findSpecies(pet.species);
  const speciesBase = sp ? Math.round(sp.giftBase / 10) : 3;
  return Math.max(1, Math.round(lvl * 10 + full * 0.3 + speciesBase));
}

// Deterministyczny float [0,1) z seeda (mix bitowy) — powtarzalny wynik dla tych samych wejść.
function seededFloat(seed: number): number {
  let x = (Math.trunc(seed) ^ 0x9e3779b9) >>> 0;
  x = Math.imul(x ^ (x >>> 15), 0x2c1b3c6d) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 0x297a2d39) >>> 0;
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}

export type BattleResult = { winner: 'a' | 'b' | 'draw'; scoreA: number; scoreB: number };

// Walka: każdy pet = moc + seedowana wariancja (do 50% mocy). Deterministyczna względem seeda →
// sprawiedliwa i testowalna. Kosmetyczna (bez nagród → reroll nie ma sensu, brak abuse'u).
export function petBattle(powerA: number, powerB: number, seed: number): BattleResult {
  const scoreA = powerA + Math.round(powerA * 0.5 * seededFloat(seed));
  const scoreB = powerB + Math.round(powerB * 0.5 * seededFloat(seed ^ 0x55555555));
  return { winner: scoreA > scoreB ? 'a' : scoreB > scoreA ? 'b' : 'draw', scoreA, scoreB };
}

// Lista wszystkich petów serwera (do rankingu /pet top). Graceful pusta bez chmury.
export async function listPets(guildId: string): Promise<Pet[]> {
  if (!hasCloud()) return [];
  return cloudSelect<Pet>('economy_pets', `select=*&guild_id=eq.${guildId}`);
}

// Ranking petów wg mocy bojowej (petPower) — malejąco; remis → wyższy poziom, potem nazwa. Czysty.
export function topPetsByPower(
  pets: Pet[],
  limit = 10,
): { name: string; species: string; power: number; level: number }[] {
  return pets
    .map((p) => ({ name: p.name, species: p.species, power: petPower(p), level: petLevel(p.xp) }))
    .sort((a, b) => b.power - a.power || b.level - a.level || a.name.localeCompare(b.name))
    .slice(0, Math.max(1, limit));
}
