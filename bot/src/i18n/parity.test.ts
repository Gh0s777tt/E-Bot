// Rygiel PARZYSTOŚCI i18n bota — każdy klucz bazy (pl) musi istnieć we wszystkich 14 językach, inaczej
// user danego języka zobaczy fallbackowy pl/en (zła flaga). Wyjątek UDOKUMENTOWANY (strings.profile.mts):
// klucze card.* (etykiety rysowane na obrazku rank-karty) są celowo TYLKO dla języków łacińskich — czcionka
// karty nie ma glifów CJK/cyrylicy/arabskiego, renderer wymusza 'en'. Test to respektuje, ale dalej pilnuje:
// komplet pozostałych kluczy w 14 jęz., komplet card.* w 8 językach łacińskich, brak kluczy-sierot.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { COMMAND_DESC } from './commandDescriptions.mts';
import { BASE_LOCALE, LOCALES } from './locales.mts';
import { DICTS } from './strings.mts';

const LATIN = new Set<string>(['pl', 'en', 'de', 'es', 'it', 'fr', 'pt', 'id']);
const isCardKey = (k: string) => k.startsWith('card.');
const baseKeys = Object.keys(DICTS[BASE_LOCALE]);
const baseSet = new Set(baseKeys);

describe('Parytet i18n bota — 14 języków vs baza (pl)', () => {
  it('baza (pl) ma sensowną liczbę kluczy (sanity)', () => {
    expect(baseKeys.length).toBeGreaterThan(400);
  });

  for (const loc of LOCALES) {
    it(`${loc}: brak braków vs baza (card.* dozwolone do pominięcia tylko w nie-łacińskich)`, () => {
      const has = new Set(Object.keys(DICTS[loc]));
      const missing = baseKeys.filter((k) => !has.has(k));
      const blocking = missing.filter((k) => !(isCardKey(k) && !LATIN.has(loc)));
      expect(blocking).toEqual([]);
    });

    it(`${loc}: brak kluczy-sierot (nieobecnych w bazie)`, () => {
      const extra = Object.keys(DICTS[loc]).filter((k) => !baseSet.has(k));
      expect(extra).toEqual([]);
    });
  }

  it('języki łacińskie mają KOMPLET kluczy card.* (renderowane etykiety)', () => {
    const cardKeys = baseKeys.filter(isCardKey);
    expect(cardKeys.length).toBeGreaterThan(0);
    for (const loc of LATIN) {
      const has = new Set(Object.keys(DICTS[loc]));
      expect(cardKeys.filter((k) => !has.has(k))).toEqual([]);
    }
  });
});

// ── Audyt 2026-08 (#2): parytet rejestr komend ↔ COMMAND_DESC ─────────────────────────────────
// /clan /help /tutorial nie miały wpisów w COMMAND_DESC — applyCommandLocalizations() po cichu
// pomijał brakujące i 13 nie-polskich locale widziało polski opis buildera. Nazwy komend
// wyciągamy STATYCZNIE ze źródeł (regex, jak nazwy w deploy-commands), a nie importem rejestru:
// import bot/src/commands/index.mts wciągałby ~100 modułów discord.js do procesu testowego
// i sztucznie rozdmuchał mianownik pokrycia (v8 all:false liczy pliki dotknięte testami).
const commandsDir = fileURLToPath(new URL('../commands/', import.meta.url));

function registryCommandNames(): string[] {
  const names: string[] = [];
  for (const f of readdirSync(commandsDir)) {
    if (!f.endsWith('.mts') || f === 'index.mts' || f === 'contextmenu.mts') continue;
    const src = readFileSync(path.join(commandsDir, f), 'utf8');
    // Top-level slash-komendy: builder tworzony bezpośrednio…
    for (const m of src.matchAll(/new SlashCommandBuilder\(\)\s*\.setName\('([^']+)'\)/g))
      names.push(m[1]);
    // …albo przez fabrykę (actions.mts: /hug /kiss /slap /pat).
    for (const m of src.matchAll(/^export const \w+ = make\('([^']+)'/gm)) names.push(m[1]);
  }
  return names;
}

describe('Parytet opisów komend — COMMAND_DESC × 14 języków vs rejestr', () => {
  const names = registryCommandNames();

  it('ekstrakcja nazw komend ze źródeł działa (sanity, rejestr ma >100 komend)', () => {
    expect(names.length).toBeGreaterThan(100);
    expect(new Set(names).size).toBe(names.length); // brak duplikatów nazw
  });

  for (const loc of LOCALES) {
    it(`${loc}: każda komenda rejestru ma opis (inaczej locale widzi polski opis buildera)`, () => {
      const has = new Set(Object.keys(COMMAND_DESC[loc]));
      expect(names.filter((n) => !has.has(n))).toEqual([]);
    });

    it(`${loc}: brak opisów-sierot (wpisów bez komendy w rejestrze)`, () => {
      const nameSet = new Set(names);
      expect(Object.keys(COMMAND_DESC[loc]).filter((k) => !nameSet.has(k))).toEqual([]);
    });
  }
});
