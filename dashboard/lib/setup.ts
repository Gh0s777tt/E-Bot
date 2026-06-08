// Presety kreatora startowego. Każdy preset = lista modułów do WŁĄCZENIA (merge enabled:true
// w istniejący config — nie nadpisuje innych pól). Szczegóły (kanały/role) user dokonfiguruje;
// Diagnostyka pokaże, czego brakuje. Klucze muszą mieć w configu pole `enabled`.
export type PresetId = 'streamer' | 'gaming' | 'community';

export type Preset = {
  id: PresetId;
  emoji: string;
  name: string;
  desc: string;
  modules: { key: string; label: string }[];
};

export const PRESETS: Preset[] = [
  {
    id: 'streamer',
    emoji: '🔴',
    name: 'Serwer streamera',
    desc: 'Powitania, poziomy, ekonomia i liczniki — pod budowanie społeczności widzów.',
    modules: [
      { key: 'welcome_config', label: 'Powitania' },
      { key: 'leveling_config', label: 'Poziomy / XP' },
      { key: 'economy_config', label: 'Ekonomia' },
      { key: 'counters_config', label: 'Liczniki kanałów' },
    ],
  },
  {
    id: 'gaming',
    emoji: '🎮',
    name: 'Serwer gamingowy',
    desc: 'Aktywność + rywalizacja + porządek: poziomy, ekonomia, automod i liczniki.',
    modules: [
      { key: 'welcome_config', label: 'Powitania' },
      { key: 'leveling_config', label: 'Poziomy / XP' },
      { key: 'economy_config', label: 'Ekonomia' },
      { key: 'automod_config', label: 'Automoderacja' },
      { key: 'counters_config', label: 'Liczniki kanałów' },
    ],
  },
  {
    id: 'community',
    emoji: '💬',
    name: 'Społeczność',
    desc: 'Bezpiecznie i z obsługą: powitania, poziomy, automod, tickety i weryfikacja.',
    modules: [
      { key: 'welcome_config', label: 'Powitania' },
      { key: 'leveling_config', label: 'Poziomy / XP' },
      { key: 'automod_config', label: 'Automoderacja' },
      { key: 'tickets_config', label: 'Tickety' },
      { key: 'verification_config', label: 'Weryfikacja' },
    ],
  },
];

export function presetById(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}

// ── Architekt serwera — bloki budowy struktury (kanały/role/kategorie) ──
export type ProvBlock =
  | 'welcome'
  | 'logs'
  | 'tickets'
  | 'announce'
  | 'counters'
  | 'muted'
  | 'levelRoles';

export const PROV_BLOCKS: { id: ProvBlock; emoji: string; label: string; desc: string }[] = [
  { id: 'welcome', emoji: '👋', label: 'Kanał powitań', desc: '#powitania' },
  { id: 'announce', emoji: '📢', label: 'Kanał ogłoszeń', desc: '#ogłoszenia (announcement)' },
  { id: 'logs', emoji: '📜', label: 'Kanał logów', desc: '#logi-serwera' },
  { id: 'tickets', emoji: '🎫', label: 'Kanał ticketów', desc: '#pomoc-tickety' },
  {
    id: 'counters',
    emoji: '📊',
    label: 'Liczniki (kategoria + 2 voice)',
    desc: 'zablokowane voice na statystyki',
  },
  { id: 'muted', emoji: '🔇', label: 'Rola Muted', desc: 'do wyciszeń / automoda' },
  { id: 'levelRoles', emoji: '🏅', label: 'Role poziomów', desc: 'Aktywny / Bywalec / Weteran' },
];

type ProvRole = { name: string; color?: number; hoist?: boolean };
type ProvCategory = { key: string; name: string };
type ProvChannel = {
  name: string;
  kind: 'text' | 'voice' | 'announcement';
  categoryKey?: string;
  lockSend?: boolean;
};
export type ProvPlan = {
  id: string;
  roles: ProvRole[];
  categories: ProvCategory[];
  channels: ProvChannel[];
};

// Zamienia wybrane bloki na konkretny plan (z dedup kategorii). Plan trafia do bota.
export function buildPlan(blocks: ProvBlock[], id: string): ProvPlan {
  const set = new Set(blocks);
  const roles: ProvRole[] = [];
  const categories: ProvCategory[] = [];
  const channels: ProvChannel[] = [];

  if (set.has('welcome')) channels.push({ name: 'powitania', kind: 'text' });
  if (set.has('announce')) channels.push({ name: 'ogłoszenia', kind: 'announcement' });
  if (set.has('logs')) channels.push({ name: 'logi-serwera', kind: 'text' });
  if (set.has('tickets')) channels.push({ name: 'pomoc-tickety', kind: 'text' });
  if (set.has('counters')) {
    categories.push({ key: 'stats', name: '📊 Statystyki' });
    channels.push({ name: '📊 Członkowie', kind: 'voice', categoryKey: 'stats', lockSend: true });
    channels.push({ name: '🚀 Boosty', kind: 'voice', categoryKey: 'stats', lockSend: true });
  }
  if (set.has('muted')) roles.push({ name: 'Muted' });
  if (set.has('levelRoles')) {
    roles.push(
      { name: 'Aktywny', hoist: true },
      { name: 'Bywalec', hoist: true },
      { name: 'Weteran', hoist: true },
    );
  }

  return { id, roles, categories, channels };
}
