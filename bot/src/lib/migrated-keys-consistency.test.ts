// Test SPÓJNOŚCI cross-package zbiorów MIGRATED_GUILD_KEYS (bot/src/lib/db.mts ↔ dashboard/lib/data.ts).
// Round-trip multi-tenant: panel ZAPISUJE config per-serwer gdy klucz ∈ zbiór panelu; bot ZAPISUJE
// config per-serwer (configWriteKey, np. setup/provision, /antinuke) gdy klucz ∈ zbiór bota. Odczyt bota
// (getGuildSettings) NIE konsultuje żadnego zbioru — czyta każdy override `g:<id>:`. Stąd niezmiennik:
//   zbiór bota ⊆ zbiór panelu
// Gdyby ktoś dodał klucz do zbioru bota (nowa komenda zapisująca config per-serwer) i zapomniał o panelu,
// panel pisałby ten config GLOBALNIE, a bot czytał/pisał per-serwer → rozjazd cross-tenant. Ten test to łapie.
// Czytamy oba pliki jako tekst (bez importu — data.ts ciągnie moduły server-only Next, których vitest nie ładuje).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function extractKeys(file: string): Set<string> {
  const src = readFileSync(file, 'utf8');
  const block = /MIGRATED_GUILD_KEYS\s*=\s*new Set<string>\(\[([\s\S]*?)\]\)/.exec(src);
  if (!block) throw new Error(`Nie znaleziono MIGRATED_GUILD_KEYS w ${file}`);
  return new Set([...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]));
}

const here = import.meta.dirname;
const botKeys = extractKeys(join(here, 'db.mts'));
const panelKeys = extractKeys(join(here, '..', '..', '..', 'dashboard', 'lib', 'data.ts'));

describe('Spójność MIGRATED_GUILD_KEYS: bot ⊆ panel (round-trip multi-tenant)', () => {
  it('oba zbiory są niepuste i zawierają rdzeń (sanity)', () => {
    expect(botKeys.size).toBeGreaterThan(0);
    expect(panelKeys.size).toBeGreaterThan(0);
    expect(botKeys.has('welcome_config')).toBe(true);
    expect(panelKeys.has('welcome_config')).toBe(true);
  });

  it('RYGIEL: każdy klucz zapisywany per-serwer przez bota jest też per-serwer w panelu', () => {
    const missingInPanel = [...botKeys].filter((k) => !panelKeys.has(k));
    expect(missingInPanel).toEqual([]); // inaczej: panel pisze globalnie config, który bot trzyma per-serwer
  });

  it('panel jest nadzbiorem bota — extra klucze to configi panel-only (pollery/AI), których bot nie zapisuje', () => {
    const panelOnly = [...panelKeys].filter((k) => !botKeys.has(k));
    // Dokładnie configi czytane przez bota, ale zapisywane WYŁĄCZNIE z panelu (bot ich nie pisze przez configWriteKey).
    expect(new Set(panelOnly)).toEqual(
      new Set([
        'aimod_config',
        'aihelp_config',
        'aidigest_config',
        'freegames_config',
        'patchnotes_config',
        'pricetracker_config',
        'social_feeds_config',
        'scheduled_posts',
        'creator_config',
      ]),
    );
  });
});
