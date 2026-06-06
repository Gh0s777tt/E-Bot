// Faza 7 / F2 — wygląd kart rang (settings 'rankcard_config'); bot czyta przy /rank.
import { type CardStyle, RANKCARD_DEFAULT } from './cardStyle';
import { getRawSetting, setRawSetting } from './data';

export async function getRankCard(): Promise<CardStyle> {
  const raw = await getRawSetting('rankcard_config');
  if (!raw) return { ...RANKCARD_DEFAULT };
  try {
    return { ...RANKCARD_DEFAULT, ...(JSON.parse(raw) as Partial<CardStyle>) };
  } catch {
    return { ...RANKCARD_DEFAULT };
  }
}

export async function saveRankCard(s: CardStyle): Promise<void> {
  await setRawSetting('rankcard_config', JSON.stringify(s));
}
