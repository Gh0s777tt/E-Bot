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
  mode: 'button' | 'captcha';
  minAccountAgeDays: number;
};
export const VERIFICATION_DEFAULT: VerificationConfig = {
  enabled: false,
  roleId: '',
  message: 'Kliknij poniżej, aby się zweryfikować i uzyskać dostęp do serwera. ✅',
  buttonLabel: 'Zweryfikuj się',
  mode: 'button',
  minAccountAgeDays: 0,
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
  altDetect: boolean;
  altMinAgeDays: number;
  altNoAvatar: boolean;
  altAction: 'alert' | 'kick' | 'ban' | 'timeout';
};
export const ANTIRAID_DEFAULT: AntiRaidConfig = {
  enabled: false,
  joinCount: 8,
  windowSec: 10,
  action: 'kick',
  alertChannelId: '',
  minAccountAgeDays: 0,
  altDetect: false,
  altMinAgeDays: 7,
  altNoAvatar: true,
  altAction: 'alert',
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

// ── AI-pomoc (RAG-lite, Tor C) ──
export type AiHelpConfig = { enabled: boolean; channelId: string; knowledge: string };
export const AIHELP_DEFAULT: AiHelpConfig = { enabled: false, channelId: '', knowledge: '' };
export async function getAiHelpConfig(): Promise<AiHelpConfig> {
  const raw = await getRawSetting('aihelp_config');
  if (!raw) return structuredClone(AIHELP_DEFAULT);
  try {
    return { ...AIHELP_DEFAULT, ...(JSON.parse(raw) as Partial<AiHelpConfig>) };
  } catch {
    return structuredClone(AIHELP_DEFAULT);
  }
}
export async function saveAiHelpConfig(cfg: AiHelpConfig): Promise<void> {
  await setRawSetting('aihelp_config', JSON.stringify(cfg));
}

// ── Tygodniowy digest serwera (Tor E) ──
export type DigestConfig = { enabled: boolean; channelId: string };
export const DIGEST_DEFAULT: DigestConfig = { enabled: false, channelId: '' };
export async function getDigestConfig(): Promise<DigestConfig> {
  const raw = await getRawSetting('digest_config');
  if (!raw) return structuredClone(DIGEST_DEFAULT);
  try {
    return { ...DIGEST_DEFAULT, ...(JSON.parse(raw) as Partial<DigestConfig>) };
  } catch {
    return structuredClone(DIGEST_DEFAULT);
  }
}
export async function saveDigestConfig(cfg: DigestConfig): Promise<void> {
  await setRawSetting('digest_config', JSON.stringify(cfg));
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

// ── Liczniki kanałów (Faza 7 / F7.4) ──
export type CounterType = 'members' | 'boosts' | 'channels' | 'roles';
export type CounterItem = { channelId: string; type: CounterType; template: string };
export type CountersConfig = { enabled: boolean; items: CounterItem[] };
export const COUNTERS_DEFAULT: CountersConfig = { enabled: false, items: [] };

export async function getCountersConfig(): Promise<CountersConfig> {
  const raw = await getRawSetting('counters_config');
  if (!raw) return structuredClone(COUNTERS_DEFAULT);
  try {
    return { ...COUNTERS_DEFAULT, ...(JSON.parse(raw) as Partial<CountersConfig>) };
  } catch {
    return structuredClone(COUNTERS_DEFAULT);
  }
}
export async function saveCountersConfig(cfg: CountersConfig): Promise<void> {
  await setRawSetting('counters_config', JSON.stringify(cfg));
}

// ── AI-moderacja (Faza 7 / F8.3) ──
export type AiModConfig = {
  enabled: boolean;
  action: 'delete' | 'warn' | 'log';
  logChannelId: string;
  exemptRoleId: string;
};
export const AIMOD_DEFAULT: AiModConfig = {
  enabled: false,
  action: 'delete',
  logChannelId: '',
  exemptRoleId: '',
};

export async function getAiModConfig(): Promise<AiModConfig> {
  const raw = await getRawSetting('aimod_config');
  if (!raw) return structuredClone(AIMOD_DEFAULT);
  try {
    return { ...AIMOD_DEFAULT, ...(JSON.parse(raw) as Partial<AiModConfig>) };
  } catch {
    return structuredClone(AIMOD_DEFAULT);
  }
}
export async function saveAiModConfig(cfg: AiModConfig): Promise<void> {
  await setRawSetting('aimod_config', JSON.stringify(cfg));
}

// ── Free-games feed (Faza 7 / F9.1) ──
export type FreeGamesConfig = { enabled: boolean; channelId: string };
export const FREEGAMES_DEFAULT: FreeGamesConfig = { enabled: false, channelId: '' };

export async function getFreeGamesConfig(): Promise<FreeGamesConfig> {
  const raw = await getRawSetting('freegames_config');
  if (!raw) return structuredClone(FREEGAMES_DEFAULT);
  try {
    return { ...FREEGAMES_DEFAULT, ...(JSON.parse(raw) as Partial<FreeGamesConfig>) };
  } catch {
    return structuredClone(FREEGAMES_DEFAULT);
  }
}
export async function saveFreeGamesConfig(cfg: FreeGamesConfig): Promise<void> {
  await setRawSetting('freegames_config', JSON.stringify(cfg));
}

// ── Patch-notes (Faza 7 / F9.1) ──
export type PatchApp = { appId: number; name: string };
export type PatchNotesConfig = { enabled: boolean; channelId: string; apps: PatchApp[] };
export const PATCHNOTES_DEFAULT: PatchNotesConfig = { enabled: false, channelId: '', apps: [] };

export async function getPatchNotesConfig(): Promise<PatchNotesConfig> {
  const raw = await getRawSetting('patchnotes_config');
  if (!raw) return structuredClone(PATCHNOTES_DEFAULT);
  try {
    return { ...PATCHNOTES_DEFAULT, ...(JSON.parse(raw) as Partial<PatchNotesConfig>) };
  } catch {
    return structuredClone(PATCHNOTES_DEFAULT);
  }
}
export async function savePatchNotesConfig(cfg: PatchNotesConfig): Promise<void> {
  await setRawSetting('patchnotes_config', JSON.stringify(cfg));
}

// ── Donejty Ko-fi (Faza 7 / F9.3) ──
export type KofiConfig = {
  enabled: boolean;
  channelId: string;
  verificationToken: string;
  message: string;
};
export const KOFI_DEFAULT: KofiConfig = {
  enabled: false,
  channelId: '',
  verificationToken: '',
  message: '🤝 **{name}** wsparł(a) nas za **{amount} {currency}**! {message}',
};

export async function getKofiConfig(): Promise<KofiConfig> {
  const raw = await getRawSetting('kofi_config');
  if (!raw) return structuredClone(KOFI_DEFAULT);
  try {
    return { ...KOFI_DEFAULT, ...(JSON.parse(raw) as Partial<KofiConfig>) };
  } catch {
    return structuredClone(KOFI_DEFAULT);
  }
}
export async function saveKofiConfig(cfg: KofiConfig): Promise<void> {
  await setRawSetting('kofi_config', JSON.stringify(cfg));
}

// ── Sezonowe rankingi levelingu (Faza 7 / F10.2) ──
export type SeasonsConfig = { enabled: boolean; channelId: string; top: number; reset: boolean };
export const SEASONS_DEFAULT: SeasonsConfig = {
  enabled: false,
  channelId: '',
  top: 10,
  reset: false,
};

export async function getSeasonsConfig(): Promise<SeasonsConfig> {
  const raw = await getRawSetting('seasons_config');
  if (!raw) return structuredClone(SEASONS_DEFAULT);
  try {
    return { ...SEASONS_DEFAULT, ...(JSON.parse(raw) as Partial<SeasonsConfig>) };
  } catch {
    return structuredClone(SEASONS_DEFAULT);
  }
}
export async function saveSeasonsConfig(cfg: SeasonsConfig): Promise<void> {
  await setRawSetting('seasons_config', JSON.stringify(cfg));
}

// ── Śledzenie cen ITAD (Faza 7 / F9.3) ──
export type PriceTrackerConfig = { enabled: boolean; channelId: string };
export const PRICETRACKER_DEFAULT: PriceTrackerConfig = { enabled: false, channelId: '' };

export async function getPriceTrackerConfig(): Promise<PriceTrackerConfig> {
  const raw = await getRawSetting('pricetracker_config');
  if (!raw) return structuredClone(PRICETRACKER_DEFAULT);
  try {
    return { ...PRICETRACKER_DEFAULT, ...(JSON.parse(raw) as Partial<PriceTrackerConfig>) };
  } catch {
    return structuredClone(PRICETRACKER_DEFAULT);
  }
}
export async function savePriceTrackerConfig(cfg: PriceTrackerConfig): Promise<void> {
  await setRawSetting('pricetracker_config', JSON.stringify(cfg));
}
