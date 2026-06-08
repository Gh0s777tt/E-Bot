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
