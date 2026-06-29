// Faza 6 — config powitań/autorole + automod (w tabeli settings, bez nowej tabeli).
import { type CardStyle, RANKCARD_DEFAULT } from './cardStyle';
import { getConfigSetting, getRawSetting, setConfigSetting, setRawSetting } from './data';
import type { RichMessage } from './richMessage';

// ── Powitania + autorole (+ baner-grafika Faza 7/F2) ──
export type WelcomeConfig = {
  enabled: boolean;
  channelId: string;
  message: string;
  autoroleId: string;
  cardEnabled: boolean;
  card: CardStyle;
  messageSpec?: RichMessage;
  autoroleDelaySec?: number;
};
export const WELCOME_DEFAULT: WelcomeConfig = {
  enabled: false,
  channelId: '',
  message: 'Witaj {user} na serwerze E-Forge! 💀 Miłej zabawy!',
  autoroleId: '',
  cardEnabled: false,
  card: { ...RANKCARD_DEFAULT },
  autoroleDelaySec: 0,
};

export async function getWelcomeConfig(): Promise<WelcomeConfig> {
  // Etap K — welcome_config per-serwer (router rozpoznaje zmigrowany klucz).
  const raw = await getConfigSetting('welcome_config');
  if (!raw) return structuredClone(WELCOME_DEFAULT);
  try {
    return { ...WELCOME_DEFAULT, ...(JSON.parse(raw) as Partial<WelcomeConfig>) };
  } catch {
    return structuredClone(WELCOME_DEFAULT);
  }
}
export async function saveWelcomeConfig(cfg: WelcomeConfig): Promise<void> {
  await setConfigSetting('welcome_config', JSON.stringify(cfg));
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
  bannedWords?: string[];
  bannedRegex?: string[];
  allowedLinks?: string[];
  ignoreChannels?: string[];
  antiScam?: { enabled: boolean; customDomains?: string[] };
  pii?: {
    enabled: boolean;
    types?: {
      creditCard?: boolean;
      pesel?: boolean;
      idCard?: boolean;
      iban?: boolean;
      email?: boolean;
      phone?: boolean;
    };
  };
  action?: 'delete' | 'timeout' | 'kick' | 'ban';
  timeoutMinutes?: number;
  escalation?: {
    enabled: boolean;
    threshold: number;
    windowMin: number;
    action: 'timeout' | 'kick' | 'ban';
  };
  antiCaps?: { enabled: boolean; percent: number; minLength: number };
  antiSpoiler?: { enabled: boolean; maxSpoilers: number };
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
  bannedWords: [],
  bannedRegex: [],
  allowedLinks: [],
  ignoreChannels: [],
  antiScam: { enabled: false, customDomains: [] },
  pii: {
    enabled: false,
    types: { creditCard: true, pesel: true, idCard: true, iban: true, email: true, phone: false },
  },
  action: 'delete',
  timeoutMinutes: 10,
  escalation: { enabled: false, threshold: 3, windowMin: 10, action: 'timeout' },
  antiCaps: { enabled: false, percent: 70, minLength: 10 },
  antiSpoiler: { enabled: false, maxSpoilers: 5 },
};

export async function getAutomodConfig(): Promise<AutomodConfig> {
  // Etap K — automod_config per-serwer (router rozpoznaje zmigrowany klucz).
  const raw = await getConfigSetting('automod_config');
  if (!raw) return structuredClone(AUTOMOD_DEFAULT);
  try {
    return { ...AUTOMOD_DEFAULT, ...(JSON.parse(raw) as Partial<AutomodConfig>) };
  } catch {
    return structuredClone(AUTOMOD_DEFAULT);
  }
}
export async function saveAutomodConfig(cfg: AutomodConfig): Promise<void> {
  await setConfigSetting('automod_config', JSON.stringify(cfg));
}

// Statystyki automoda zliczane przez bota (cloud 'automod_stats': { 'YYYY-MM-DD': { kat: liczba } }).
export type AutomodStats = Record<string, Record<string, number>>;
export async function getAutomodStats(): Promise<AutomodStats> {
  const raw = await getRawSetting('automod_stats');
  if (!raw) return {};
  try {
    const o = JSON.parse(raw) as AutomodStats;
    return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
  } catch {
    return {};
  }
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
  const raw = await getConfigSetting('logging_config');
  if (!raw) return structuredClone(LOGGING_DEFAULT);
  try {
    return { ...LOGGING_DEFAULT, ...(JSON.parse(raw) as Partial<LoggingConfig>) };
  } catch {
    return structuredClone(LOGGING_DEFAULT);
  }
}
export async function saveLoggingConfig(cfg: LoggingConfig): Promise<void> {
  await setConfigSetting('logging_config', JSON.stringify(cfg));
}

// ── Weryfikacja (Faza 7 / F6.3) ──
export type VerificationConfig = {
  enabled: boolean;
  roleId: string;
  message: string;
  buttonLabel: string;
  mode: 'button' | 'captcha' | 'phrase';
  minAccountAgeDays: number;
  phrase: string; // hasło dla trybu 'phrase'
};
export const VERIFICATION_DEFAULT: VerificationConfig = {
  enabled: false,
  roleId: '',
  message: 'Kliknij poniżej, aby się zweryfikować i uzyskać dostęp do serwera. ✅',
  buttonLabel: 'Zweryfikuj się',
  mode: 'button',
  minAccountAgeDays: 0,
  phrase: '',
};

export async function getVerificationConfig(): Promise<VerificationConfig> {
  const raw = await getConfigSetting('verification_config');
  if (!raw) return structuredClone(VERIFICATION_DEFAULT);
  try {
    return { ...VERIFICATION_DEFAULT, ...(JSON.parse(raw) as Partial<VerificationConfig>) };
  } catch {
    return structuredClone(VERIFICATION_DEFAULT);
  }
}
export async function saveVerificationConfig(cfg: VerificationConfig): Promise<void> {
  await setConfigSetting('verification_config', JSON.stringify(cfg));
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
  autoLockdown: boolean;
  honeypot: { enabled: boolean; channelId: string; action: 'kick' | 'ban' | 'timeout' };
  crossIntel: { enabled: boolean; action: 'alert' | 'kick' | 'ban' | 'timeout' };
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
  autoLockdown: false,
  honeypot: { enabled: false, channelId: '', action: 'ban' },
  crossIntel: { enabled: false, action: 'alert' },
};

export async function getAntiRaidConfig(): Promise<AntiRaidConfig> {
  const raw = await getConfigSetting('antiraid_config');
  if (!raw) return structuredClone(ANTIRAID_DEFAULT);
  try {
    return { ...ANTIRAID_DEFAULT, ...(JSON.parse(raw) as Partial<AntiRaidConfig>) };
  } catch {
    return structuredClone(ANTIRAID_DEFAULT);
  }
}
export async function saveAntiRaidConfig(cfg: AntiRaidConfig): Promise<void> {
  await setConfigSetting('antiraid_config', JSON.stringify(cfg));
}

// ── AI-pomoc (RAG-lite, Tor C) ──
export type AiHelpConfig = { enabled: boolean; channelId: string; knowledge: string };
export const AIHELP_DEFAULT: AiHelpConfig = { enabled: false, channelId: '', knowledge: '' };
export async function getAiHelpConfig(): Promise<AiHelpConfig> {
  const raw = await getConfigSetting('aihelp_config');
  if (!raw) return structuredClone(AIHELP_DEFAULT);
  try {
    return { ...AIHELP_DEFAULT, ...(JSON.parse(raw) as Partial<AiHelpConfig>) };
  } catch {
    return structuredClone(AIHELP_DEFAULT);
  }
}
export async function saveAiHelpConfig(cfg: AiHelpConfig): Promise<void> {
  await setConfigSetting('aihelp_config', JSON.stringify(cfg));
}

// ── Tygodniowy digest serwera (Tor E) ──
export type DigestConfig = { enabled: boolean; channelId: string; aiRecap?: boolean };
export const DIGEST_DEFAULT: DigestConfig = { enabled: false, channelId: '', aiRecap: false };
export async function getDigestConfig(): Promise<DigestConfig> {
  const raw = await getConfigSetting('digest_config');
  if (!raw) return structuredClone(DIGEST_DEFAULT);
  try {
    return { ...DIGEST_DEFAULT, ...(JSON.parse(raw) as Partial<DigestConfig>) };
  } catch {
    return structuredClone(DIGEST_DEFAULT);
  }
}
export async function saveDigestConfig(cfg: DigestConfig): Promise<void> {
  await setConfigSetting('digest_config', JSON.stringify(cfg));
}

// ── Auto-wątki (Fala 1) — wybrane kanały auto-tworzą wątek na każdą wiadomość ──
export type AutothreadConfig = { enabled: boolean; channels: string[]; nameTemplate: string };
export const AUTOTHREAD_DEFAULT: AutothreadConfig = {
  enabled: false,
  channels: [],
  nameTemplate: '{user} — {date}',
};
export async function getAutothreadConfig(): Promise<AutothreadConfig> {
  const raw = await getConfigSetting('autothread_config');
  if (!raw) return structuredClone(AUTOTHREAD_DEFAULT);
  try {
    return { ...AUTOTHREAD_DEFAULT, ...(JSON.parse(raw) as Partial<AutothreadConfig>) };
  } catch {
    return structuredClone(AUTOTHREAD_DEFAULT);
  }
}
export async function saveAutothreadConfig(cfg: AutothreadConfig): Promise<void> {
  await setConfigSetting('autothread_config', JSON.stringify(cfg));
}

// ── Adaptacyjny slowmode — bot sam podnosi/zdejmuje slowmode wg tempa wiadomości na wybranych kanałach ──
export type AutoslowConfig = {
  enabled: boolean;
  channels: string[];
  threshold: number;
  window: number;
  maxSlow: number;
};
export const AUTOSLOW_DEFAULT: AutoslowConfig = {
  enabled: false,
  channels: [],
  threshold: 8,
  window: 10,
  maxSlow: 30,
};
export async function getAutoslowConfig(): Promise<AutoslowConfig> {
  const raw = await getConfigSetting('autoslow_config');
  if (!raw) return structuredClone(AUTOSLOW_DEFAULT);
  try {
    return { ...AUTOSLOW_DEFAULT, ...(JSON.parse(raw) as Partial<AutoslowConfig>) };
  } catch {
    return structuredClone(AUTOSLOW_DEFAULT);
  }
}
export async function saveAutoslowConfig(cfg: AutoslowConfig): Promise<void> {
  await setConfigSetting('autoslow_config', JSON.stringify(cfg));
}

// ── Trwałe role — snapshot ról przy wyjściu, przywracanie przy powrocie (anty-ucieczka od wyciszenia) ──
export type StickyrolesConfig = { enabled: boolean; all: boolean; roles: string[] };
export const STICKYROLES_DEFAULT: StickyrolesConfig = { enabled: false, all: false, roles: [] };
export async function getStickyrolesConfig(): Promise<StickyrolesConfig> {
  const raw = await getConfigSetting('stickyroles_config');
  if (!raw) return structuredClone(STICKYROLES_DEFAULT);
  try {
    return { ...STICKYROLES_DEFAULT, ...(JSON.parse(raw) as Partial<StickyrolesConfig>) };
  } catch {
    return structuredClone(STICKYROLES_DEFAULT);
  }
}
export async function saveStickyrolesConfig(cfg: StickyrolesConfig): Promise<void> {
  await setConfigSetting('stickyroles_config', JSON.stringify(cfg));
}

// ── Auto-reakcje — bot dodaje skonfigurowane reakcje do wiadomości na wybranych kanałach ──
export type AutoreactRule = { channelId: string; emojis: string[] };
export type AutoreactConfig = { enabled: boolean; rules: AutoreactRule[] };
export const AUTOREACT_DEFAULT: AutoreactConfig = { enabled: false, rules: [] };
export async function getAutoreactConfig(): Promise<AutoreactConfig> {
  const raw = await getConfigSetting('autoreact_config');
  if (!raw) return structuredClone(AUTOREACT_DEFAULT);
  try {
    return { ...AUTOREACT_DEFAULT, ...(JSON.parse(raw) as Partial<AutoreactConfig>) };
  } catch {
    return structuredClone(AUTOREACT_DEFAULT);
  }
}
export async function saveAutoreactConfig(cfg: AutoreactConfig): Promise<void> {
  await setConfigSetting('autoreact_config', JSON.stringify(cfg));
}

// ── Dehoisting — auto-czyszczenie nazw windujących na górę listy członków (wiodące !, [, ~, spacja) ──
export type DehoistConfig = { enabled: boolean; fallback: string };
export const DEHOIST_DEFAULT: DehoistConfig = { enabled: false, fallback: 'Dehoist' };
export async function getDehoistConfig(): Promise<DehoistConfig> {
  const raw = await getConfigSetting('dehoist_config');
  if (!raw) return structuredClone(DEHOIST_DEFAULT);
  try {
    return { ...DEHOIST_DEFAULT, ...(JSON.parse(raw) as Partial<DehoistConfig>) };
  } catch {
    return structuredClone(DEHOIST_DEFAULT);
  }
}
export async function saveDehoistConfig(cfg: DehoistConfig): Promise<void> {
  await setConfigSetting('dehoist_config', JSON.stringify(cfg));
}

// ── Auto-czyszczenie kanałów — kasowanie wiadomości starszych niż TTL na wybranych kanałach ──
export type AutodeleteRule = { channelId: string; minutes: number };
export type AutodeleteConfig = { rules: AutodeleteRule[] };
export const AUTODELETE_DEFAULT: AutodeleteConfig = { rules: [] };
export async function getAutodeleteConfig(): Promise<AutodeleteConfig> {
  const raw = await getConfigSetting('autodelete_config');
  if (!raw) return structuredClone(AUTODELETE_DEFAULT);
  try {
    return { ...AUTODELETE_DEFAULT, ...(JSON.parse(raw) as Partial<AutodeleteConfig>) };
  } catch {
    return structuredClone(AUTODELETE_DEFAULT);
  }
}
export async function saveAutodeleteConfig(cfg: AutodeleteConfig): Promise<void> {
  await setConfigSetting('autodelete_config', JSON.stringify(cfg));
}

// ── Podgląd linków do wiadomości — bot rozwija wklejony link w embed z treścią + „Skocz" ──
export type QuotelinkConfig = { enabled: boolean };
export const QUOTELINK_DEFAULT: QuotelinkConfig = { enabled: false };
export async function getQuotelinkConfig(): Promise<QuotelinkConfig> {
  const raw = await getConfigSetting('quotelink_config');
  if (!raw) return structuredClone(QUOTELINK_DEFAULT);
  try {
    return { ...QUOTELINK_DEFAULT, ...(JSON.parse(raw) as Partial<QuotelinkConfig>) };
  } catch {
    return structuredClone(QUOTELINK_DEFAULT);
  }
}
export async function saveQuotelinkConfig(cfg: QuotelinkConfig): Promise<void> {
  await setConfigSetting('quotelink_config', JSON.stringify(cfg));
}

// ── Powitalny DM — prywatna wiadomość do nowych członków (regulamin / pierwsze kroki) ──
export type JoindmConfig = { enabled: boolean; message: string };
export const JOINDM_DEFAULT: JoindmConfig = { enabled: false, message: '' };
export async function getJoindmConfig(): Promise<JoindmConfig> {
  const raw = await getConfigSetting('joindm_config');
  if (!raw) return structuredClone(JOINDM_DEFAULT);
  try {
    return { ...JOINDM_DEFAULT, ...(JSON.parse(raw) as Partial<JoindmConfig>) };
  } catch {
    return structuredClone(JOINDM_DEFAULT);
  }
}
export async function saveJoindmConfig(cfg: JoindmConfig): Promise<void> {
  await setConfigSetting('joindm_config', JSON.stringify(cfg));
}

// ── Tłumaczenie flagą — reakcja z flagą kraju → AI tłumaczy wiadomość (wspólne limity AI) ──
export type FlagtransConfig = { enabled: boolean };
export const FLAGTRANS_DEFAULT: FlagtransConfig = { enabled: false };
export async function getFlagtransConfig(): Promise<FlagtransConfig> {
  const raw = await getConfigSetting('flagtranslate_config');
  if (!raw) return structuredClone(FLAGTRANS_DEFAULT);
  try {
    return { ...FLAGTRANS_DEFAULT, ...(JSON.parse(raw) as Partial<FlagtransConfig>) };
  } catch {
    return structuredClone(FLAGTRANS_DEFAULT);
  }
}
export async function saveFlagtransConfig(cfg: FlagtransConfig): Promise<void> {
  await setConfigSetting('flagtranslate_config', JSON.stringify(cfg));
}

// ── Przypinanie reakcją — reakcja 📌 od uprawnionej roli przypina wiadomość (bez nadawania ManageMessages) ──
export type PinreactConfig = { enabled: boolean; emoji: string; roleId: string };
export const PINREACT_DEFAULT: PinreactConfig = { enabled: false, emoji: '📌', roleId: '' };
export async function getPinreactConfig(): Promise<PinreactConfig> {
  const raw = await getConfigSetting('pinreact_config');
  if (!raw) return structuredClone(PINREACT_DEFAULT);
  try {
    return { ...PINREACT_DEFAULT, ...(JSON.parse(raw) as Partial<PinreactConfig>) };
  } catch {
    return structuredClone(PINREACT_DEFAULT);
  }
}
export async function savePinreactConfig(cfg: PinreactConfig): Promise<void> {
  await setConfigSetting('pinreact_config', JSON.stringify(cfg));
}

// ── Zgłaszanie wiadomości — context-menu „Zgłoś wiadomość" → kanał recenzji moderacji z przyciskami ──
export type ReportsConfig = { enabled: boolean; channelId: string };
export const REPORTS_DEFAULT: ReportsConfig = { enabled: false, channelId: '' };
export async function getReportsConfig(): Promise<ReportsConfig> {
  const raw = await getConfigSetting('reports_config');
  if (!raw) return structuredClone(REPORTS_DEFAULT);
  try {
    return { ...REPORTS_DEFAULT, ...(JSON.parse(raw) as Partial<ReportsConfig>) };
  } catch {
    return structuredClone(REPORTS_DEFAULT);
  }
}
export async function saveReportsConfig(cfg: ReportsConfig): Promise<void> {
  await setConfigSetting('reports_config', JSON.stringify(cfg));
}

// ── Kamienie milowe serwera (Fala 1) — co N-tego członka świętowanie ──
export type MilestonesConfig = {
  enabled: boolean;
  channelId: string;
  every: number;
  message: string;
};
export const MILESTONES_DEFAULT: MilestonesConfig = {
  enabled: false,
  channelId: '',
  every: 100,
  message: '🎉 Osiągnęliśmy **{count}** członków! Witaj {user} 🎊',
};
export async function getMilestonesConfig(): Promise<MilestonesConfig> {
  const raw = await getConfigSetting('milestones_config');
  if (!raw) return structuredClone(MILESTONES_DEFAULT);
  try {
    return { ...MILESTONES_DEFAULT, ...(JSON.parse(raw) as Partial<MilestonesConfig>) };
  } catch {
    return structuredClone(MILESTONES_DEFAULT);
  }
}
export async function saveMilestonesConfig(cfg: MilestonesConfig): Promise<void> {
  await setConfigSetting('milestones_config', JSON.stringify(cfg));
}

// ── Cele społeczności (Fala 2) — zbiorowy target wiadomości w miesiącu ──
export type GoalsConfig = {
  enabled: boolean;
  channelId: string;
  target: number;
  title: string;
  reward: string;
};
export const GOALS_DEFAULT: GoalsConfig = {
  enabled: false,
  channelId: '',
  target: 0,
  title: 'Wspólny cel miesiąca',
  reward: '',
};
export async function getGoalsConfig(): Promise<GoalsConfig> {
  const raw = await getConfigSetting('goals_config');
  if (!raw) return structuredClone(GOALS_DEFAULT);
  try {
    return { ...GOALS_DEFAULT, ...(JSON.parse(raw) as Partial<GoalsConfig>) };
  } catch {
    return structuredClone(GOALS_DEFAULT);
  }
}
export async function saveGoalsConfig(cfg: GoalsConfig): Promise<void> {
  await setConfigSetting('goals_config', JSON.stringify(cfg));
}

// ── Auto-publikacja ogłoszeń (Fala 2) — crosspost na kanałach ogłoszeń ──
export type AutopublishConfig = { enabled: boolean; channels: string[] };
export const AUTOPUBLISH_DEFAULT: AutopublishConfig = { enabled: false, channels: [] };
export async function getAutopublishConfig(): Promise<AutopublishConfig> {
  const raw = await getConfigSetting('autopublish_config');
  if (!raw) return structuredClone(AUTOPUBLISH_DEFAULT);
  try {
    return { ...AUTOPUBLISH_DEFAULT, ...(JSON.parse(raw) as Partial<AutopublishConfig>) };
  } catch {
    return structuredClone(AUTOPUBLISH_DEFAULT);
  }
}
export async function saveAutopublishConfig(cfg: AutopublishConfig): Promise<void> {
  await setConfigSetting('autopublish_config', JSON.stringify(cfg));
}

// ── Odwołania od bana (publiczny formularz → kolejka → recenzja moderatora) ──
export type AppealsConfig = { enabled: boolean; channelId: string };
export const APPEALS_DEFAULT: AppealsConfig = { enabled: false, channelId: '' };
export async function getAppealsConfig(): Promise<AppealsConfig> {
  const raw = await getConfigSetting('appeals_config');
  if (!raw) return structuredClone(APPEALS_DEFAULT);
  try {
    return { ...APPEALS_DEFAULT, ...(JSON.parse(raw) as Partial<AppealsConfig>) };
  } catch {
    return structuredClone(APPEALS_DEFAULT);
  }
}
export async function saveAppealsConfig(cfg: AppealsConfig): Promise<void> {
  await setConfigSetting('appeals_config', JSON.stringify(cfg));
}

// ── Dzienny AI-digest (Tor J) ──
export type AiDigestConfig = {
  enabled: boolean;
  sourceChannelId: string;
  targetChannelId: string;
  hourUTC: number;
};
export const AIDIGEST_DEFAULT: AiDigestConfig = {
  enabled: false,
  sourceChannelId: '',
  targetChannelId: '',
  hourUTC: 18,
};
export async function getAiDigestConfig(): Promise<AiDigestConfig> {
  const raw = await getConfigSetting('aidigest_config');
  if (!raw) return structuredClone(AIDIGEST_DEFAULT);
  try {
    return { ...AIDIGEST_DEFAULT, ...(JSON.parse(raw) as Partial<AiDigestConfig>) };
  } catch {
    return structuredClone(AIDIGEST_DEFAULT);
  }
}
export async function saveAiDigestConfig(cfg: AiDigestConfig): Promise<void> {
  await setConfigSetting('aidigest_config', JSON.stringify(cfg));
}

// ── Aplikacje / rekrutacja (Tor K / Faza 8: wiele aplikacji) ──
export type Application = {
  id: string;
  label: string;
  emoji: string;
  style: 'primary' | 'secondary' | 'success' | 'danger';
  reviewChannelId: string;
  acceptRoleId: string;
  questions: string[];
};
export type ApplicationsConfig = {
  enabled: boolean;
  reviewChannelId: string;
  roleId: string;
  panelMessage: string;
  questions: string[];
  panelSpec?: RichMessage;
  applications?: Application[];
};
export const APPLICATIONS_DEFAULT: ApplicationsConfig = {
  enabled: false,
  reviewChannelId: '',
  roleId: '',
  panelMessage: '📋 Aplikuj do ekipy — kliknij poniżej.',
  questions: ['Dlaczego chcesz dołączyć?', 'Co możesz wnieść?'],
  applications: [],
};
export async function getApplicationsConfig(): Promise<ApplicationsConfig> {
  const raw = await getConfigSetting('applications_config');
  if (!raw) return structuredClone(APPLICATIONS_DEFAULT);
  try {
    return { ...APPLICATIONS_DEFAULT, ...(JSON.parse(raw) as Partial<ApplicationsConfig>) };
  } catch {
    return structuredClone(APPLICATIONS_DEFAULT);
  }
}
export async function saveApplicationsConfig(cfg: ApplicationsConfig): Promise<void> {
  await setConfigSetting('applications_config', JSON.stringify(cfg));
}

// ── Twitch sub → rola (Tor N) ──
export type TwitchSubConfig = { enabled: boolean; roleId: string };
export const TWITCHSUB_DEFAULT: TwitchSubConfig = { enabled: false, roleId: '' };
export async function getTwitchSubConfig(): Promise<TwitchSubConfig> {
  const raw = await getRawSetting('twitch_sub_config');
  if (!raw) return structuredClone(TWITCHSUB_DEFAULT);
  try {
    return { ...TWITCHSUB_DEFAULT, ...(JSON.parse(raw) as Partial<TwitchSubConfig>) };
  } catch {
    return structuredClone(TWITCHSUB_DEFAULT);
  }
}
export async function saveTwitchSubConfig(cfg: TwitchSubConfig): Promise<void> {
  await setRawSetting('twitch_sub_config', JSON.stringify(cfg));
}

// ── Automatyzacje IFTTT-lite (Tor O) ──
export type AutomationRule = {
  event: 'join' | 'keyword';
  keyword: string;
  action: 'message' | 'role' | 'dm';
  channelId: string;
  roleId: string;
  text: string;
};
export type AutomationsConfig = { enabled: boolean; rules: AutomationRule[] };
export const AUTOMATIONS_DEFAULT: AutomationsConfig = { enabled: false, rules: [] };
export async function getAutomationsConfig(): Promise<AutomationsConfig> {
  const raw = await getConfigSetting('automations_config');
  if (!raw) return structuredClone(AUTOMATIONS_DEFAULT);
  try {
    return { ...AUTOMATIONS_DEFAULT, ...(JSON.parse(raw) as Partial<AutomationsConfig>) };
  } catch {
    return structuredClone(AUTOMATIONS_DEFAULT);
  }
}
export async function saveAutomationsConfig(cfg: AutomationsConfig): Promise<void> {
  await setConfigSetting('automations_config', JSON.stringify(cfg));
}

// ── Modmail (Faza 7 / F6.4) ──
export type ModmailConfig = { enabled: boolean; channelId: string; greeting: string };
export const MODMAIL_DEFAULT: ModmailConfig = {
  enabled: false,
  channelId: '',
  greeting: 'Twoja wiadomość trafiła do obsługi. Odpiszemy najszybciej, jak to możliwe. 📨',
};

export async function getModmailConfig(): Promise<ModmailConfig> {
  const raw = await getConfigSetting('modmail_config');
  if (!raw) return structuredClone(MODMAIL_DEFAULT);
  try {
    return { ...MODMAIL_DEFAULT, ...(JSON.parse(raw) as Partial<ModmailConfig>) };
  } catch {
    return structuredClone(MODMAIL_DEFAULT);
  }
}
export async function saveModmailConfig(cfg: ModmailConfig): Promise<void> {
  await setConfigSetting('modmail_config', JSON.stringify(cfg));
}

// ── Sugestie (Faza 7 / F7.1) ──
export type SuggestionsConfig = { enabled: boolean; channelId: string; anonymous: boolean };
export const SUGGESTIONS_DEFAULT: SuggestionsConfig = {
  enabled: false,
  channelId: '',
  anonymous: false,
};

export async function getSuggestionsConfig(): Promise<SuggestionsConfig> {
  // Etap K — suggestions_config per-serwer (router rozpoznaje zmigrowany klucz).
  const raw = await getConfigSetting('suggestions_config');
  if (!raw) return structuredClone(SUGGESTIONS_DEFAULT);
  try {
    return { ...SUGGESTIONS_DEFAULT, ...(JSON.parse(raw) as Partial<SuggestionsConfig>) };
  } catch {
    return structuredClone(SUGGESTIONS_DEFAULT);
  }
}
export async function saveSuggestionsConfig(cfg: SuggestionsConfig): Promise<void> {
  await setConfigSetting('suggestions_config', JSON.stringify(cfg));
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
  const raw = await getConfigSetting('responder_config');
  if (!raw) return structuredClone(RESPONDER_DEFAULT);
  try {
    return { ...RESPONDER_DEFAULT, ...(JSON.parse(raw) as Partial<ResponderConfig>) };
  } catch {
    return structuredClone(RESPONDER_DEFAULT);
  }
}
export async function saveResponderConfig(cfg: ResponderConfig): Promise<void> {
  await setConfigSetting('responder_config', JSON.stringify(cfg));
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
  // Etap K — birthday_config per-serwer (router rozpoznaje zmigrowany klucz).
  const raw = await getConfigSetting('birthday_config');
  if (!raw) return structuredClone(BIRTHDAY_DEFAULT);
  try {
    return { ...BIRTHDAY_DEFAULT, ...(JSON.parse(raw) as Partial<BirthdayConfig>) };
  } catch {
    return structuredClone(BIRTHDAY_DEFAULT);
  }
}
export async function saveBirthdayConfig(cfg: BirthdayConfig): Promise<void> {
  await setConfigSetting('birthday_config', JSON.stringify(cfg));
}

// ── Liczniki kanałów (Faza 7 / F7.4) ──
export type CounterType =
  | 'members'
  | 'humans'
  | 'bots'
  | 'boosts'
  | 'boostTier'
  | 'channels'
  | 'roles'
  | 'emojis'
  | 'stickers'
  | 'voice'
  | 'ytSubs'
  | 'ytViews'
  | 'ytVideos'
  | 'twFollowers'
  | 'twSubs'
  | 'twViewers'
  | 'kickFollowers'
  | 'kickViewers';
export type CounterItem = { channelId: string; type: CounterType; template: string; arg?: string };
export type CountersConfig = { enabled: boolean; items: CounterItem[] };
export const COUNTERS_DEFAULT: CountersConfig = { enabled: false, items: [] };

export async function getCountersConfig(): Promise<CountersConfig> {
  // Etap K — counters_config per-serwer (router rozpoznaje zmigrowany klucz).
  const raw = await getConfigSetting('counters_config');
  if (!raw) return structuredClone(COUNTERS_DEFAULT);
  try {
    return { ...COUNTERS_DEFAULT, ...(JSON.parse(raw) as Partial<CountersConfig>) };
  } catch {
    return structuredClone(COUNTERS_DEFAULT);
  }
}
export async function saveCountersConfig(cfg: CountersConfig): Promise<void> {
  await setConfigSetting('counters_config', JSON.stringify(cfg));
}

// ── AI-moderacja (Faza 7 / F8.3) ──
export type AiModConfig = {
  enabled: boolean;
  action: 'delete' | 'warn' | 'log';
  logChannelId: string;
  exemptRoleId: string;
  scanImages: boolean;
};
export const AIMOD_DEFAULT: AiModConfig = {
  enabled: false,
  action: 'delete',
  logChannelId: '',
  exemptRoleId: '',
  scanImages: false,
};

export async function getAiModConfig(): Promise<AiModConfig> {
  const raw = await getConfigSetting('aimod_config');
  if (!raw) return structuredClone(AIMOD_DEFAULT);
  try {
    return { ...AIMOD_DEFAULT, ...(JSON.parse(raw) as Partial<AiModConfig>) };
  } catch {
    return structuredClone(AIMOD_DEFAULT);
  }
}
export async function saveAiModConfig(cfg: AiModConfig): Promise<void> {
  await setConfigSetting('aimod_config', JSON.stringify(cfg));
}

// ── Free-games feed (Faza 7 / F9.1) ──
export type FreeGamesConfig = { enabled: boolean; channelId: string; multiStore?: boolean };
export const FREEGAMES_DEFAULT: FreeGamesConfig = {
  enabled: false,
  channelId: '',
  multiStore: false,
};

export async function getFreeGamesConfig(): Promise<FreeGamesConfig> {
  const raw = await getConfigSetting('freegames_config');
  if (!raw) return structuredClone(FREEGAMES_DEFAULT);
  try {
    return { ...FREEGAMES_DEFAULT, ...(JSON.parse(raw) as Partial<FreeGamesConfig>) };
  } catch {
    return structuredClone(FREEGAMES_DEFAULT);
  }
}
export async function saveFreeGamesConfig(cfg: FreeGamesConfig): Promise<void> {
  await setConfigSetting('freegames_config', JSON.stringify(cfg));
}

// ── Patch-notes (Faza 7 / F9.1) ──
export type PatchApp = { appId: number; name: string };
// Źródło per-wpis — kształt IDENTYCZNY z bot/src/gaming/patchnotes.mts (Source) i gameCatalog.ts.
export type PatchSource = { kind: 'steam'; appId: number } | { kind: 'rss'; url: string };
export type PatchItem = {
  slug?: string;
  name: string;
  source: PatchSource;
  channelId?: string; // własny kanał (fallback: domyślny)
  roleId?: string; // ping roli
  pin?: boolean; // auto-pin
  image?: string; // miniatura/okładka
};
export type PatchNotesConfig = {
  enabled: boolean;
  channelId: string; // kanał domyślny
  digest: 'instant' | 'daily';
  digestHour: number; // 0–23 (UTC)
  aiSummary: boolean;
  items: PatchItem[]; // nowy kształt (po nazwie z katalogu)
  apps: PatchApp[]; // STARY kształt (wstecznie; migrowany do items przy zapisie)
};
export const PATCHNOTES_DEFAULT: PatchNotesConfig = {
  enabled: false,
  channelId: '',
  digest: 'instant',
  digestHour: 12,
  aiSummary: false,
  items: [],
  apps: [],
};

export async function getPatchNotesConfig(): Promise<PatchNotesConfig> {
  const raw = await getConfigSetting('patchnotes_config');
  if (!raw) return structuredClone(PATCHNOTES_DEFAULT);
  try {
    return { ...PATCHNOTES_DEFAULT, ...(JSON.parse(raw) as Partial<PatchNotesConfig>) };
  } catch {
    return structuredClone(PATCHNOTES_DEFAULT);
  }
}
export async function savePatchNotesConfig(cfg: PatchNotesConfig): Promise<void> {
  await setConfigSetting('patchnotes_config', JSON.stringify(cfg));
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

// ── Donejty: linki wsparcia (Faza 8) — PayPal / Buy Me a Coffee / Patreon / Ko-fi / własne ──
export type DonateProvider = { label: string; url: string; emoji: string };
export type DonateConfig = {
  enabled: boolean;
  title: string;
  description: string;
  providers: DonateProvider[];
};
export const DONATE_DEFAULT: DonateConfig = {
  enabled: false,
  title: '💖 Wesprzyj nas',
  description: 'Dziękujemy za wsparcie! Wybierz sposób poniżej:',
  providers: [],
};
export async function getDonateConfig(): Promise<DonateConfig> {
  const raw = await getRawSetting('donate_config');
  if (!raw) return structuredClone(DONATE_DEFAULT);
  try {
    return { ...DONATE_DEFAULT, ...(JSON.parse(raw) as Partial<DonateConfig>) };
  } catch {
    return structuredClone(DONATE_DEFAULT);
  }
}
export async function saveDonateConfig(cfg: DonateConfig): Promise<void> {
  await setRawSetting('donate_config', JSON.stringify(cfg));
}

// ── Powiadomienia social (RSS) — Faza 8 (TikTok/IG/FB/Threads/X/YouTube/blog przez URL RSS) ──
export type SocialFeed = { url: string; label: string };
export type SocialFeedsConfig = {
  enabled: boolean;
  channelId: string;
  message: string;
  feeds: SocialFeed[];
};
export const SOCIAL_FEEDS_DEFAULT: SocialFeedsConfig = {
  enabled: false,
  channelId: '',
  message: '📣 Nowy post od **{label}**: {title}\n{link}',
  feeds: [],
};
export async function getSocialFeedsConfig(): Promise<SocialFeedsConfig> {
  const raw = await getConfigSetting('social_feeds_config');
  if (!raw) return structuredClone(SOCIAL_FEEDS_DEFAULT);
  try {
    return { ...SOCIAL_FEEDS_DEFAULT, ...(JSON.parse(raw) as Partial<SocialFeedsConfig>) };
  } catch {
    return structuredClone(SOCIAL_FEEDS_DEFAULT);
  }
}
export async function saveSocialFeedsConfig(cfg: SocialFeedsConfig): Promise<void> {
  await setConfigSetting('social_feeds_config', JSON.stringify(cfg));
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
  const raw = await getConfigSetting('seasons_config');
  if (!raw) return structuredClone(SEASONS_DEFAULT);
  try {
    return { ...SEASONS_DEFAULT, ...(JSON.parse(raw) as Partial<SeasonsConfig>) };
  } catch {
    return structuredClone(SEASONS_DEFAULT);
  }
}
export async function saveSeasonsConfig(cfg: SeasonsConfig): Promise<void> {
  await setConfigSetting('seasons_config', JSON.stringify(cfg));
}

// ── Śledzenie cen ITAD (Faza 7 / F9.3) ──
export type PriceTrackerConfig = { enabled: boolean; channelId: string };
export const PRICETRACKER_DEFAULT: PriceTrackerConfig = { enabled: false, channelId: '' };

export async function getPriceTrackerConfig(): Promise<PriceTrackerConfig> {
  const raw = await getConfigSetting('pricetracker_config');
  if (!raw) return structuredClone(PRICETRACKER_DEFAULT);
  try {
    return { ...PRICETRACKER_DEFAULT, ...(JSON.parse(raw) as Partial<PriceTrackerConfig>) };
  } catch {
    return structuredClone(PRICETRACKER_DEFAULT);
  }
}
export async function savePriceTrackerConfig(cfg: PriceTrackerConfig): Promise<void> {
  await setConfigSetting('pricetracker_config', JSON.stringify(cfg));
}
