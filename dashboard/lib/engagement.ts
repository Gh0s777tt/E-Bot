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

// ── Counting (Tor 3) ──
export type CountingConfig = {
  enabled: boolean;
  channelId: string;
  allowSameUser: boolean;
  resetOnFail: boolean;
};
export const COUNTING_DEFAULT: CountingConfig = {
  enabled: false,
  channelId: '',
  allowSameUser: false,
  resetOnFail: true,
};
export async function getCounting(): Promise<CountingConfig> {
  const raw = await getRawSetting('counting_config');
  if (!raw) return structuredClone(COUNTING_DEFAULT);
  try {
    return { ...COUNTING_DEFAULT, ...(JSON.parse(raw) as Partial<CountingConfig>) };
  } catch {
    return structuredClone(COUNTING_DEFAULT);
  }
}
export async function saveCounting(cfg: CountingConfig): Promise<void> {
  await setRawSetting('counting_config', JSON.stringify(cfg));
}

// ── Invite Tracker (Tor 3) ──
export type InviteReward = { count: number; roleId: string };
export type InvitesConfig = {
  enabled: boolean;
  logChannelId: string;
  fakeMinAgeDays: number;
  rewards: InviteReward[];
};
export const INVITES_DEFAULT: InvitesConfig = {
  enabled: false,
  logChannelId: '',
  fakeMinAgeDays: 7,
  rewards: [],
};
export async function getInvitesConfig(): Promise<InvitesConfig> {
  const raw = await getRawSetting('invites_config');
  if (!raw) return structuredClone(INVITES_DEFAULT);
  try {
    return { ...INVITES_DEFAULT, ...(JSON.parse(raw) as Partial<InvitesConfig>) };
  } catch {
    return structuredClone(INVITES_DEFAULT);
  }
}
export async function saveInvitesConfig(cfg: InvitesConfig): Promise<void> {
  await setRawSetting('invites_config', JSON.stringify(cfg));
}

// ── Menu ról (dropdown, Tor F) ──
export type RoleMenuOption = { label: string; roleId: string; description: string; emoji: string };
export type RoleMenuConfig = { message: string; placeholder: string; options: RoleMenuOption[] };
export const ROLEMENU_DEFAULT: RoleMenuConfig = {
  message: '🎭 Wybierz swoje role:',
  placeholder: 'Wybierz role…',
  options: [],
};
export async function getRoleMenu(): Promise<RoleMenuConfig> {
  const raw = await getRawSetting('rolemenu_config');
  if (!raw) return structuredClone(ROLEMENU_DEFAULT);
  try {
    return { ...ROLEMENU_DEFAULT, ...(JSON.parse(raw) as Partial<RoleMenuConfig>) };
  } catch {
    return structuredClone(ROLEMENU_DEFAULT);
  }
}
export async function saveRoleMenu(cfg: RoleMenuConfig): Promise<void> {
  await setRawSetting('rolemenu_config', JSON.stringify(cfg));
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
