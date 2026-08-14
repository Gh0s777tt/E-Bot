#!/usr/bin/env node
// scripts/check-schema-sync.mjs
// Strażnik KOMPLETNOŚCI schematu: pilnuje, by KAŻDA tabela zdefiniowana w plikach per-feature
// (dashboard/scripts/*.sql + dashboard/supabase/*.sql) była też w zbiorczym _ALL.sql. Dokumentacja każe
// operatorowi uruchomić TYLKO _ALL.sql — brak tabeli tam = ciche 404 z PostgREST (utrata funkcji,
// bez crasha, trudne do zdiagnozowania). Zero zależności. Lustro idei `check-docs-sync.mjs`.
//
// Użycie:  pnpm schema:check   (lub: node scripts/check-schema-sync.mjs)
// Wyjście: 0 = OK · 1 = brakujące tabele (komunikat mówi które + skąd je scalić).
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SQL_DIR = join(ROOT, 'dashboard', 'scripts');
const ALL = '_ALL.sql';
// Skanowane katalogi ze schematami źródłowymi. `dashboard/supabase/` dołożone, bo strażnik go NIE
// widział — a to tam mieszkały `games` i `settings` (jedyne w repo), więc dokładnie ta luka, przed
// którą ten skrypt miał chronić, przeszła niezauważona: operator odpalał _ALL.sql, a obie tabele
// nie powstawały → ciche 404 z PostgREST na całej ścieżce GameVault i configu panel↔bot.
// Etykieta (klucz) trafia do komunikatu błędu, żeby było widać SKĄD scalić definicję.
const SCAN_DIRS = [
  ['dashboard/scripts', SQL_DIR],
  ['dashboard/supabase', join(ROOT, 'dashboard', 'supabase')],
];

// Opcjonalny kwalifikator schematu: `create table if not exists public.games` musi dać `games`,
// nie `public` (dashboard/supabase/schema.sql pisze z prefiksem, pliki per-feature bez).
const tableRe = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:[a-z0-9_]+\s*\.\s*)?([a-z0-9_]+)/gi;
const tablesIn = (text) => {
  const set = new Set();
  for (const m of text.matchAll(tableRe)) set.add(m[1].toLowerCase());
  return set;
};

let allSql;
try {
  allSql = readFileSync(join(SQL_DIR, ALL), 'utf8');
} catch {
  console.error(`✗ Nie mogę odczytać dashboard/scripts/${ALL}.`);
  process.exit(1);
}
const inAll = tablesIn(allSql);

const files = []; // [etykieta do komunikatu, pełna ścieżka]
for (const [label, dir] of SCAN_DIRS) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    continue; // katalog opcjonalny — brak nie może wywalać pre-commita/CI (strażnik ma być tani i cichy)
  }
  for (const f of entries) {
    if (f.endsWith('.sql') && f !== ALL) files.push([`${label}/${f}`, join(dir, f)]);
  }
}

const missing = new Map(); // tabela -> pierwszy plik źródłowy
for (const [label, path] of files) {
  for (const t of tablesIn(readFileSync(path, 'utf8'))) {
    if (!inAll.has(t) && !missing.has(t)) missing.set(t, label);
  }
}

if (missing.size > 0) {
  console.error(
    `✗ _ALL.sql NIE zawiera ${missing.size} tabel zdefiniowanych w plikach per-feature:`,
  );
  for (const [t, f] of missing) console.error(`   • ${t}  (źródło: ${f})`);
  console.error(
    '\n→ Scal te tabele do dashboard/scripts/_ALL.sql (operator uruchamia tylko ten plik).',
  );
  process.exit(1);
}
console.log(
  `✓ Schemat zsynchronizowany: wszystkie tabele per-feature są w _ALL.sql (${inAll.size} tabel).`,
);
