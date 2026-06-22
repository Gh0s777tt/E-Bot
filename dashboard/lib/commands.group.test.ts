// Rygiel grupowania komend (groupCommands) — Discord API nie zwraca kategorii, panel mapuje je tu.
// Regresja = komenda gubiona / zduplikowana / w złej grupie / zła kolejność w widoku /commands.
// Używamy stabilnych nazw z katalogu: 'ping' (grupa „Ogólne", pierwsza), 'fun' (ostatnia grupa),
// + nieznana nazwa → „Inne". Niezmienniki strukturalne trzymają niezależnie od reszty katalogu.
import { describe, expect, it } from 'vitest';
import { groupCommands, type SlashCommand } from './commands';

const cmd = (name: string): SlashCommand => ({ name, description: '', subs: [] });
const flat = (gs: { commands: SlashCommand[] }[]) =>
  gs.flatMap((g) => g.commands.map((c) => c.name));

describe('groupCommands — konserwacja i przydział', () => {
  it('każda komenda dokładnie raz; nieznana → grupa „Inne"', () => {
    const input = [cmd('ping'), cmd('fun'), cmd('zzz_nieznana')];
    const groups = groupCommands(input);
    const names = flat(groups);
    expect(names.length).toBe(3); // brak duplikatów (gdyby `used` nie działał → 4)
    expect([...names].sort()).toEqual(['fun', 'ping', 'zzz_nieznana'].sort()); // brak gubienia
    expect(groups.find((g) => g.label === 'Inne')?.commands.map((c) => c.name)).toEqual([
      'zzz_nieznana',
    ]);
  });

  it('kolejność w grupie wg KATALOGU, nie wg kolejności wejścia', () => {
    // Katalog „Ogólne" = [ping, portal, link]; wejście podajemy w innej kolejności.
    const groups = groupCommands([cmd('link'), cmd('portal'), cmd('ping')]);
    const ogolne = groups.find((g) => g.label === 'Ogólne');
    expect(ogolne?.commands.map((c) => c.name)).toEqual(['ping', 'portal', 'link']);
  });
});

describe('groupCommands — struktura grup', () => {
  it('„Inne" jest OSTATNIą grupą', () => {
    const groups = groupCommands([cmd('zzz_nieznana'), cmd('ping')]);
    expect(groups.at(-1)?.label).toBe('Inne');
  });

  it('puste grupy pominięte (tylko grupy z komendami; brak „Inne" gdy wszystko znane)', () => {
    const groups = groupCommands([cmd('ping')]);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('Ogólne');
    expect(groups.some((g) => g.label === 'Inne')).toBe(false);
  });

  it('puste wejście → []', () => {
    expect(groupCommands([])).toEqual([]);
  });
});
