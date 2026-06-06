// Faza 7 / F1 — rejestr modułów do Centrum sterowania (włącz/wyłącz wszystko z jednego miejsca).
// 'json' = flaga w configu JSON (settingsKey → path); 'bool' = bezpośredni klucz settings '1/0'.
export type ModuleDef = {
  key: string;
  label: string;
  group: string;
  href?: string;
  kind: 'json' | 'bool';
  settingsKey: string;
  path?: string; // dla 'json' (domyślnie 'enabled')
  default?: boolean; // dla 'bool' gdy brak zapisu
};

export const MODULES: ModuleDef[] = [
  // Moderacja & bezpieczeństwo
  {
    key: 'automod',
    label: 'Automod',
    group: 'Moderacja',
    href: '/moderation',
    kind: 'json',
    settingsKey: 'automod_config',
  },
  {
    key: 'logging',
    label: 'Logi serwera',
    group: 'Moderacja',
    href: '/logging',
    kind: 'json',
    settingsKey: 'logging_config',
  },
  {
    key: 'verification',
    label: 'Weryfikacja',
    group: 'Moderacja',
    href: '/security',
    kind: 'json',
    settingsKey: 'verification_config',
  },
  {
    key: 'antiraid',
    label: 'Anti-raid',
    group: 'Moderacja',
    href: '/security',
    kind: 'json',
    settingsKey: 'antiraid_config',
  },
  // Społeczność
  {
    key: 'welcome',
    label: 'Powitania',
    group: 'Społeczność',
    href: '/welcome',
    kind: 'json',
    settingsKey: 'welcome_config',
  },
  {
    key: 'leveling',
    label: 'Leveling',
    group: 'Społeczność',
    href: '/levels',
    kind: 'json',
    settingsKey: 'leveling_config',
  },
  {
    key: 'suggestions',
    label: 'Sugestie',
    group: 'Społeczność',
    href: '/suggestions',
    kind: 'json',
    settingsKey: 'suggestions_config',
  },
  {
    key: 'starboard',
    label: 'Starboard',
    group: 'Społeczność',
    href: '/engagement',
    kind: 'json',
    settingsKey: 'starboard_config',
  },
  {
    key: 'tempvoice',
    label: 'Kanały głosowe na żądanie',
    group: 'Społeczność',
    href: '/engagement',
    kind: 'json',
    settingsKey: 'tempvoice_config',
  },
  // Ekonomia
  {
    key: 'economy',
    label: 'Ekonomia serwera',
    group: 'Społeczność',
    href: '/eco',
    kind: 'json',
    settingsKey: 'economy_config',
  },
  // Tickety & AI
  {
    key: 'tickets',
    label: 'Tickety',
    group: 'Wsparcie',
    href: '/tickets',
    kind: 'json',
    settingsKey: 'tickets_config',
  },
  {
    key: 'modmail',
    label: 'Modmail',
    group: 'Wsparcie',
    href: '/modmail',
    kind: 'json',
    settingsKey: 'modmail_config',
  },
  {
    key: 'ai',
    label: 'Komendy AI',
    group: 'AI',
    href: '/ai',
    kind: 'json',
    settingsKey: 'ai_config',
  },
  // Twórca
  {
    key: 'creatorEvent',
    label: 'Auto-wydarzenie na live',
    group: 'Twórca',
    href: '/creator',
    kind: 'json',
    settingsKey: 'creator_config',
    path: 'autoEvent',
  },
  {
    key: 'creatorClips',
    label: 'Relay klipów Twitch',
    group: 'Twórca',
    href: '/creator',
    kind: 'json',
    settingsKey: 'creator_config',
    path: 'clipRelay',
  },
  // Powiadomienia live
  {
    key: 'notifyTwitch',
    label: 'Live: Twitch',
    group: 'Powiadomienia live',
    href: '/notifications',
    kind: 'bool',
    settingsKey: 'notify_enabled_twitch',
    default: true,
  },
  {
    key: 'notifyKick',
    label: 'Live: Kick',
    group: 'Powiadomienia live',
    href: '/notifications',
    kind: 'bool',
    settingsKey: 'notify_enabled_kick',
    default: true,
  },
  {
    key: 'notifyRumble',
    label: 'Live: Rumble',
    group: 'Powiadomienia live',
    href: '/notifications',
    kind: 'bool',
    settingsKey: 'notify_enabled_rumble',
    default: true,
  },
  {
    key: 'notifyYoutube',
    label: 'Live: YouTube',
    group: 'Powiadomienia live',
    href: '/notifications',
    kind: 'bool',
    settingsKey: 'notify_enabled_youtube',
    default: false,
  },
];

// Wersja serializowalna dla klienta (bez logiki kind/settingsKey).
export type ModuleView = { key: string; label: string; group: string; href?: string };
export const MODULE_VIEWS: ModuleView[] = MODULES.map((m) => ({
  key: m.key,
  label: m.label,
  group: m.group,
  href: m.href,
}));
