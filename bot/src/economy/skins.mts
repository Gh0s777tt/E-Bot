// Tor I — skórki kart rang/profilu. Presety (gradient + font), kupowane za walutę; założona skórka
// nadpisuje globalny styl w /rank i /profile. Dane w 'user_card_skins'.
import type { CardStyle } from '../lib/cards.mts';
import { cloudSelect, cloudUpdate, cloudUpsert, hasCloud } from '../lib/cloud.mts';

export type Skin = { id: string; name: string; price: number; style: CardStyle };

export const SKINS: Skin[] = [
  {
    id: 'classic',
    name: 'Klasyk (czerwień)',
    price: 0,
    style: { from: '#E50914', to: '#0A0A0A', angle: 135, font: 'Poppins', textColor: '#FFFFFF' },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    price: 5000,
    style: { from: '#0EA5E9', to: '#0A0A0A', angle: 135, font: 'Poppins', textColor: '#FFFFFF' },
  },
  {
    id: 'forest',
    name: 'Las',
    price: 10000,
    style: { from: '#22C55E', to: '#0A0A0A', angle: 135, font: 'Poppins', textColor: '#FFFFFF' },
  },
  {
    id: 'gold',
    name: 'Złoto',
    price: 15000,
    style: { from: '#F59E0B', to: '#1A1A1A', angle: 135, font: 'Anton', textColor: '#FFFFFF' },
  },
  {
    id: 'neon',
    name: 'Neon',
    price: 25000,
    style: { from: '#A855F7', to: '#EC4899', angle: 135, font: 'Bebas Neue', textColor: '#FFFFFF' },
  },
];

const byId = new Map(SKINS.map((s) => [s.id, s]));
export const skinById = (id: string): Skin | undefined => byId.get(id);

export async function getOwnedSkins(gid: string, uid: string): Promise<Set<string>> {
  if (!hasCloud()) return new Set();
  const rows = await cloudSelect<{ skin_id: string }>(
    'user_card_skins',
    `select=skin_id&guild_id=eq.${gid}&user_id=eq.${uid}`,
  ).catch(() => [] as { skin_id: string }[]);
  return new Set(rows.map((r) => r.skin_id));
}

export async function getEquippedStyle(gid: string, uid: string): Promise<CardStyle | null> {
  if (!hasCloud()) return null;
  const rows = await cloudSelect<{ skin_id: string }>(
    'user_card_skins',
    `select=skin_id&guild_id=eq.${gid}&user_id=eq.${uid}&equipped=eq.true`,
  ).catch(() => [] as { skin_id: string }[]);
  const s = rows[0] && byId.get(rows[0].skin_id);
  return s ? s.style : null;
}

export async function ownSkin(gid: string, uid: string, skinId: string): Promise<void> {
  await cloudUpsert(
    'user_card_skins',
    [{ guild_id: gid, user_id: uid, skin_id: skinId, equipped: false }],
    'guild_id,user_id,skin_id',
  );
}

export async function equipSkin(gid: string, uid: string, skinId: string): Promise<void> {
  await cloudUpdate('user_card_skins', `guild_id=eq.${gid}&user_id=eq.${uid}`, {
    equipped: false,
  }).catch(() => {});
  await cloudUpsert(
    'user_card_skins',
    [{ guild_id: gid, user_id: uid, skin_id: skinId, equipped: true }],
    'guild_id,user_id,skin_id',
  );
}
