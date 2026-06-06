// Faza 6 — config powitań/autorole + automod (w tabeli settings, bez nowej tabeli).
import { type CardStyle, RANKCARD_DEFAULT } from './cardStyle';
import { getRawSetting, setRawSetting } from './data';

// ── Powitania + autorole (+ baner-grafika Faza 7/F2) ──
export type WelcomeConfig = {
  enabled: boolean;
  channelId: string;
  message: string;
  autoroleId: string;
  cardEnabled: boolean;
  card: CardStyle;
};
export const WELCOME_DEFAULT: WelcomeConfig = {
  enabled: false,
  channelId: '',
  message: 'Witaj {user} na serwerze GH0ST EMPIRE! 💀 Miłej zabawy!',
  autoroleId: '',
  cardEnabled: false,
  card: { ...RANKCARD_DEFAULT },
};

export async function getWelcomeConfig(): Promise<WelcomeConfig> {
  const raw = await getRawSetting('welcome_config');
  if (!raw) return structuredClone(WELCOME_DEFAULT);
  try {
    return { ...WELCOME_DEFAULT, ...(JSON.parse(raw) as Partial<WelcomeConfig>) };
  } catch {
    return structuredClone(WELCOME_DEFAULT);
  }
}
export async function saveWelcomeConfig(cfg: WelcomeConfig): Promise<void> {
  await setRawSetting('welcome_config', JSON.stringify(cfg));
}

// ── Automod ──
export type AutomodConfig = {
  enabled: boolean;
  blockInvites: boolean;
  blockLinks: boolean;
  maxMentions: number;
  antiSpamCount: number;
  antiSpamSec: number;
  modlogChannelId: string;
  exemptRoleId: string;
};
export const AUTOMOD_DEFAULT: AutomodConfig = {
  enabled: false,
  blockInvites: true,
  blockLinks: false,
  maxMentions: 6,
  antiSpamCount: 6,
  antiSpamSec: 5,
  modlogChannelId: '',
  exemptRoleId: '',
};

export async function getAutomodConfig(): Promise<AutomodConfig> {
  const raw = await getRawSetting('automod_config');
  if (!raw) return structuredClone(AUTOMOD_DEFAULT);
  try {
    return { ...AUTOMOD_DEFAULT, ...(JSON.parse(raw) as Partial<AutomodConfig>) };
  } catch {
    return structuredClone(AUTOMOD_DEFAULT);
  }
}
export async function saveAutomodConfig(cfg: AutomodConfig): Promise<void> {
  await setRawSetting('automod_config', JSON.stringify(cfg));
}
