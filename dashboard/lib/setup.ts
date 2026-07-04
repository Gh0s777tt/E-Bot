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
  // B1 pełne (#688): bloki struktury Discorda tworzone przy zastosowaniu presetu (opcjonalnie w UI)
  // — ten sam silnik co Blueprinty/Architekt (plan → 'setup_provision' → bot). Koniec z „włączyłem
  // preset, a na serwerze nic się nie zmieniło" (pain P3/B1 z audytu).
  blocks: ProvBlock[];
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
    blocks: ['welcome', 'announce', 'counters', 'levelRoles'],
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
    blocks: ['welcome', 'announce', 'logs', 'counters', 'levelRoles', 'muted'],
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
    blocks: ['welcome', 'announce', 'logs', 'tickets', 'muted'],
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

// ── Blueprinty — pełne szablony serwera: włącz moduły + utwórz strukturę jednym kliknięciem ──
export const BLUEPRINT_MODULES = [
  'welcome_config',
  'leveling_config',
  'economy_config',
  'automod_config',
  'tickets_config',
  'verification_config',
  'counters_config',
] as const;

export type Blueprint = {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  modules: string[];
  blocks: ProvBlock[];
};

export const BLUEPRINTS: Blueprint[] = [
  {
    id: 'streamerPro',
    emoji: '🔴',
    name: 'Streamer Pro',
    desc: 'Powitania, poziomy, ekonomia, liczniki + kanały ogłoszeń i role poziomów.',
    modules: ['welcome_config', 'leveling_config', 'economy_config', 'counters_config'],
    blocks: ['welcome', 'announce', 'counters', 'levelRoles'],
  },
  {
    id: 'gamingHub',
    emoji: '🎮',
    name: 'Gaming Hub',
    desc: 'Rywalizacja + porządek: poziomy, ekonomia, automod, liczniki, logi, Muted.',
    modules: [
      'welcome_config',
      'leveling_config',
      'economy_config',
      'automod_config',
      'counters_config',
    ],
    blocks: ['welcome', 'announce', 'logs', 'counters', 'levelRoles', 'muted'],
  },
  {
    id: 'communityXL',
    emoji: '💬',
    name: 'Społeczność XL',
    desc: 'Bezpiecznie i z obsługą: automod, tickety, weryfikacja, logi, powitania.',
    modules: [
      'welcome_config',
      'leveling_config',
      'automod_config',
      'tickets_config',
      'verification_config',
    ],
    blocks: ['welcome', 'announce', 'logs', 'tickets', 'muted'],
  },
  {
    id: 'shop',
    emoji: '🛒',
    name: 'Sklep / Ekonomia',
    desc: 'Pod ekonomię i nagrody: ekonomia, poziomy, powitania + role poziomów.',
    modules: ['economy_config', 'leveling_config', 'welcome_config'],
    blocks: ['welcome', 'announce', 'levelRoles'],
  },
  {
    id: 'minimal',
    emoji: '🌱',
    name: 'Minimalny',
    desc: 'Tylko podstawy: powitania + automod + logi.',
    modules: ['welcome_config', 'automod_config'],
    blocks: ['welcome', 'logs'],
  },
];

export type Recipe = { modules: string[]; blocks: ProvBlock[] };

// Recepta → kod (base64) do udostępniania / przenoszenia setupu i z powrotem.
// btoa/atob są globalne i w przeglądarce, i w Node 18+ (panel) — bez Buffera w bundlu klienta.
export function encodeRecipe(r: Recipe): string {
  return btoa(JSON.stringify({ m: r.modules, b: r.blocks }));
}
export function decodeRecipe(code: string): Recipe | null {
  try {
    const json = atob(code.trim());
    const p = JSON.parse(json) as { m?: unknown; b?: unknown };
    const modules = Array.isArray(p.m)
      ? p.m.filter(
          (x): x is string =>
            typeof x === 'string' && (BLUEPRINT_MODULES as readonly string[]).includes(x),
        )
      : [];
    const allBlocks = PROV_BLOCKS.map((x) => x.id) as string[];
    const blocks = Array.isArray(p.b)
      ? (p.b.filter(
          (x): x is ProvBlock => typeof x === 'string' && allBlocks.includes(x),
        ) as ProvBlock[])
      : [];
    if (!modules.length && !blocks.length) return null;
    return { modules, blocks };
  } catch {
    return null;
  }
}

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
