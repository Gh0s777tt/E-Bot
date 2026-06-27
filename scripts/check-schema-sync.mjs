#!/usr/bin/env node
// scripts/check-schema-sync.mjs
// Strażnik KOMPLETNOŚCI schematu: pilnuje, by KAŻDA tabela zdefiniowana w plikach per-feature
// (dashboard/scripts/*.sql) była też w zbiorczym dashboard/scripts/_ALL.sql. Dokumentacja każe
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

const tableRe = /create\s+table\s+(?:if\s+not\s+exists\s+)?([a-z0-9_]+)/gi;
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

const files = readdirSync(SQL_DIR).filter((f) => f.endsWith('.sql') && f !== ALL);
const missing = new Map(); // tabela -> pierwszy plik źródłowy
for (const f of files) {
  for (const t of tablesIn(readFileSync(join(SQL_DIR, f), 'utf8'))) {
    if (!inAll.has(t) && !missing.has(t)) missing.set(t, f);
  }
}

if (missing.size > 0) {
  console.error(
    `✗ _ALL.sql NIE zawiera ${missing.size} tabel zdefiniowanych w plikach per-feature:`,
  );
  for (const [t, f] of missing) console.error(`   • ${t}  (źródło: dashboard/scripts/${f})`);
  console.error(
    '\n→ Scal te tabele do dashboard/scripts/_ALL.sql (operator uruchamia tylko ten plik).',
  );
  process.exit(1);
}
console.log(
  `✓ Schemat zsynchronizowany: wszystkie tabele per-feature są w _ALL.sql (${inAll.size} tabel).`,
);
