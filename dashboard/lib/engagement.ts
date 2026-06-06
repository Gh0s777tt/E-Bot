// Faza 6 / B5 — engagement: button-role, starboard, temp-voice (config w settings) + lista giveawayów.
import { getRawSetting, setRawSetting } from './data';
import { hasSupabase, supabase } from './supabase';

// ── Button-role ──
export type BtnRole = { label: string; roleId: string; emoji: string };
export type ButtonRolesConfig = { message: string; buttons: BtnRole[] };
export const BUTTONROLES_DEFAULT: ButtonRolesConfig = {
  message: 'Kliknij, aby odebrać rolę:',
  buttons: [],
};

export async function getButtonRoles(): Promise<ButtonRolesConfig> {
  const raw = await getRawSetting('buttonroles_config');
  if (!raw) return structuredClone(BUTTONROLES_DEFAULT);
  try {
    return { ...BUTTONROLES_DEFAULT, ...(JSON.parse(raw) as Partial<ButtonRolesConfig>) };
  } catch {
    return structuredClone(BUTTONROLES_DEFAULT);
  }
}
export async function saveButtonRoles(cfg: ButtonRolesConfig): Promise<void> {
  await setRawSetting('buttonroles_config', JSON.stringify(cfg));
}

// ── Starboard ──
export type StarboardConfig = {
  enabled: boolean;
  channelId: string;
  threshold: number;
  emoji: string;
};
export const STARBOARD_DEFAULT: StarboardConfig = {
  enabled: false,
  channelId: '',
  threshold: 3,
  emoji: '⭐',
};

export async function getStarboard(): Promise<StarboardConfig> {
  const raw = await getRawSetting('starboard_config');
  if (!raw) return structuredClone(STARBOARD_DEFAULT);
  try {
    return { ...STARBOARD_DEFAULT, ...(JSON.parse(raw) as Partial<StarboardConfig>) };
  } catch {
    return structuredClone(STARBOARD_DEFAULT);
  }
}
export async function saveStarboard(cfg: StarboardConfig): Promise<void> {
  await setRawSetting('starboard_config', JSON.stringify(cfg));
}

// ── Temp-voice ──
export type TempVoiceConfig = {
  enabled: boolean;
  hubChannelId: string;
  categoryId: string;
  nameTemplate: string;
};
export const TEMPVOICE_DEFAULT: TempVoiceConfig = {
  enabled: false,
  hubChannelId: '',
  categoryId: '',
  nameTemplate: '🔊 {user}',
};

export async function getTempVoice(): Promise<TempVoiceConfig> {
  const raw = await getRawSetting('tempvoice_config');
  if (!raw) return structuredClone(TEMPVOICE_DEFAULT);
  try {
    return { ...TEMPVOICE_DEFAULT, ...(JSON.parse(raw) as Partial<TempVoiceConfig>) };
  } catch {
    return structuredClone(TEMPVOICE_DEFAULT);
  }
}
export async function saveTempVoice(cfg: TempVoiceConfig): Promise<void> {
  await setRawSetting('tempvoice_config', JSON.stringify(cfg));
}

// ── Lista giveawayów (read) ──
export type GiveawayRow = {
  id: string;
  prize: string;
  winners: number;
  ends_at: string;
  ended: boolean;
};

export async function getGiveaways(limit = 20): Promise<GiveawayRow[]> {
  if (!hasSupabase) return [];
  try {
    const { data, error } = await supabase()
      .from('giveaways')
      .select('id,prize,winners,ends_at,ended')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as GiveawayRow[];
  } catch {
    return [];
  }
}
