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

// ── Logi serwera (Faza 7 / F6.2) ──
export type LoggingConfig = {
  enabled: boolean;
  channelId: string;
  messages: boolean; // usunięcie / edycja / masowe usunięcie
  members: boolean; // dołączenie / wyjście
  memberUpdates: boolean; // zmiana nicku / ról
  moderation: boolean; // ban / unban
  server: boolean; // utworzenie / usunięcie kanału lub roli
  voice: boolean; // dołączenie / wyjście / przeniesienie na voice
  ignoreChannels: string[];
};
export const LOGGING_DEFAULT: LoggingConfig = {
  enabled: false,
  channelId: '',
  messages: true,
  members: true,
  memberUpdates: false,
  moderation: true,
  server: true,
  voice: false,
  ignoreChannels: [],
};

export async function getLoggingConfig(): Promise<LoggingConfig> {
  const raw = await getRawSetting('logging_config');
  if (!raw) return structuredClone(LOGGING_DEFAULT);
  try {
    return { ...LOGGING_DEFAULT, ...(JSON.parse(raw) as Partial<LoggingConfig>) };
  } catch {
    return structuredClone(LOGGING_DEFAULT);
  }
}
export async function saveLoggingConfig(cfg: LoggingConfig): Promise<void> {
  await setRawSetting('logging_config', JSON.stringify(cfg));
}

// ── Weryfikacja (Faza 7 / F6.3) ──
export type VerificationConfig = {
  enabled: boolean;
  roleId: string;
  message: string;
  buttonLabel: string;
};
export const VERIFICATION_DEFAULT: VerificationConfig = {
  enabled: false,
  roleId: '',
  message: 'Kliknij poniżej, aby się zweryfikować i uzyskać dostęp do serwera. ✅',
  buttonLabel: 'Zweryfikuj się',
};

export async function getVerificationConfig(): Promise<VerificationConfig> {
  const raw = await getRawSetting('verification_config');
  if (!raw) return structuredClone(VERIFICATION_DEFAULT);
  try {
    return { ...VERIFICATION_DEFAULT, ...(JSON.parse(raw) as Partial<VerificationConfig>) };
  } catch {
    return structuredClone(VERIFICATION_DEFAULT);
  }
}
export async function saveVerificationConfig(cfg: VerificationConfig): Promise<void> {
  await setRawSetting('verification_config', JSON.stringify(cfg));
}

// ── Anti-raid (Faza 7 / F6.3) ──
export type AntiRaidConfig = {
  enabled: boolean;
  joinCount: number;
  windowSec: number;
  action: 'kick' | 'ban' | 'timeout';
  alertChannelId: string;
  minAccountAgeDays: number;
};
export const ANTIRAID_DEFAULT: AntiRaidConfig = {
  enabled: false,
  joinCount: 8,
  windowSec: 10,
  action: 'kick',
  alertChannelId: '',
  minAccountAgeDays: 0,
};

export async function getAntiRaidConfig(): Promise<AntiRaidConfig> {
  const raw = await getRawSetting('antiraid_config');
  if (!raw) return structuredClone(ANTIRAID_DEFAULT);
  try {
    return { ...ANTIRAID_DEFAULT, ...(JSON.parse(raw) as Partial<AntiRaidConfig>) };
  } catch {
    return structuredClone(ANTIRAID_DEFAULT);
  }
}
export async function saveAntiRaidConfig(cfg: AntiRaidConfig): Promise<void> {
  await setRawSetting('antiraid_config', JSON.stringify(cfg));
}

// ── Modmail (Faza 7 / F6.4) ──
export type ModmailConfig = { enabled: boolean; channelId: string; greeting: string };
export const MODMAIL_DEFAULT: ModmailConfig = {
  enabled: false,
  channelId: '',
  greeting: 'Twoja wiadomość trafiła do obsługi. Odpiszemy najszybciej, jak to możliwe. 📨',
};

export async function getModmailConfig(): Promise<ModmailConfig> {
  const raw = await getRawSetting('modmail_config');
  if (!raw) return structuredClone(MODMAIL_DEFAULT);
  try {
    return { ...MODMAIL_DEFAULT, ...(JSON.parse(raw) as Partial<ModmailConfig>) };
  } catch {
    return structuredClone(MODMAIL_DEFAULT);
  }
}
export async function saveModmailConfig(cfg: ModmailConfig): Promise<void> {
  await setRawSetting('modmail_config', JSON.stringify(cfg));
}

// ── Sugestie (Faza 7 / F7.1) ──
export type SuggestionsConfig = { enabled: boolean; channelId: string; anonymous: boolean };
export const SUGGESTIONS_DEFAULT: SuggestionsConfig = {
  enabled: false,
  channelId: '',
  anonymous: false,
};

export async function getSuggestionsConfig(): Promise<SuggestionsConfig> {
  const raw = await getRawSetting('suggestions_config');
  if (!raw) return structuredClone(SUGGESTIONS_DEFAULT);
  try {
    return { ...SUGGESTIONS_DEFAULT, ...(JSON.parse(raw) as Partial<SuggestionsConfig>) };
  } catch {
    return structuredClone(SUGGESTIONS_DEFAULT);
  }
}
export async function saveSuggestionsConfig(cfg: SuggestionsConfig): Promise<void> {
  await setRawSetting('suggestions_config', JSON.stringify(cfg));
}

// ── Komendy własne + autoresponder (Faza 7 / F7.2) ──
export type CustomCommand = { name: string; response: string };
export type AutoResponder = {
  trigger: string;
  response: string;
  match: 'contains' | 'exact' | 'starts';
};
export type ResponderConfig = {
  enabled: boolean;
  prefix: string;
  commands: CustomCommand[];
  autoresponders: AutoResponder[];
};
export const RESPONDER_DEFAULT: ResponderConfig = {
  enabled: false,
  prefix: '!',
  commands: [],
  autoresponders: [],
};

export async function getResponderConfig(): Promise<ResponderConfig> {
  const raw = await getRawSetting('responder_config');
  if (!raw) return structuredClone(RESPONDER_DEFAULT);
  try {
    return { ...RESPONDER_DEFAULT, ...(JSON.parse(raw) as Partial<ResponderConfig>) };
  } catch {
    return structuredClone(RESPONDER_DEFAULT);
  }
}
export async function saveResponderConfig(cfg: ResponderConfig): Promise<void> {
  await setRawSetting('responder_config', JSON.stringify(cfg));
}

// ── Urodziny (Faza 7 / F7.3) ──
export type BirthdayConfig = {
  enabled: boolean;
  channelId: string;
  message: string;
  roleId: string;
};
export const BIRTHDAY_DEFAULT: BirthdayConfig = {
  enabled: false,
  channelId: '',
  message: '🎉 Dziś urodziny obchodzi {users}! Wszystkiego najlepszego! 🎂',
  roleId: '',
};

export async function getBirthdayConfig(): Promise<BirthdayConfig> {
  const raw = await getRawSetting('birthday_config');
  if (!raw) return structuredClone(BIRTHDAY_DEFAULT);
  try {
    return { ...BIRTHDAY_DEFAULT, ...(JSON.parse(raw) as Partial<BirthdayConfig>) };
  } catch {
    return structuredClone(BIRTHDAY_DEFAULT);
  }
}
export async function saveBirthdayConfig(cfg: BirthdayConfig): Promise<void> {
  await setRawSetting('birthday_config', JSON.stringify(cfg));
}
