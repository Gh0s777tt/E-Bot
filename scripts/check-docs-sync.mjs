#!/usr/bin/env node
// scripts/check-docs-sync.mjs
// Strażnik synchronizacji dokumentacji: pilnuje, by README.md, docs/PHASES.md i docs/ROADMAP.md
// niosły marker wersji zgodny z najnowszym wpisem w CHANGELOG.md. Zero zależności.
//
// Użycie:  pnpm docs:check        (lub: node scripts/check-docs-sync.mjs)
// Wyjście: 0 = OK · 1 = rozjazd (komunikat mówi dokładnie, co poprawić).
//
// Idea: CHANGELOG jest źródłem prawdy (najnowsza wersja u góry). Każdy plik docs ma
// na górze marker `<!-- SYNC: vX.Y.Z · #NNN · YYYY-MM-DD -->`. Skrypt sprawdza parzystość
// wersji marker ↔ CHANGELOG. Nowy plik do pilnowania? Dopisz go do TARGETS.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

// Pliki, które mają być zsynchronizowane z CHANGELOG (rozszerzaj wedle potrzeb).
const TARGETS = ['README.md', 'docs/PHASES.md', 'docs/ROADMAP.md'];

// Źródło prawdy = pierwszy (najnowszy) nagłówek wersji w CHANGELOG: "## [0.222.0] — …".
let changelog;
try {
  changelog = read('CHANGELOG.md');
} catch {
  console.error('✗ Nie mogę odczytać CHANGELOG.md w katalogu repo.');
  process.exit(1);
}
const verMatch = changelog.match(/^##\s*\[(\d+\.\d+\.\d+)\]/m);
if (!verMatch) {
  console.error('✗ Nie znalazłem nagłówka wersji `## [x.y.z]` w CHANGELOG.md.');
  process.exit(1);
}
const latest = verMatch[1];

// Marker w docs: "<!-- SYNC: v0.222.0 ... -->"
const MARKER = /<!--\s*SYNC:\s*v(\d+\.\d+\.\d+)/;
const problems = [];
for (const rel of TARGETS) {
  let text;
  try {
    text = read(rel);
  } catch {
    problems.push(`${rel}: brak pliku`);
    continue;
  }
  const m = text.match(MARKER);
  if (!m) problems.push(`${rel}: brak markera "<!-- SYNC: vX.Y.Z -->" (dodaj na górze pliku)`);
  else if (m[1] !== latest) problems.push(`${rel}: marker v${m[1]} ≠ CHANGELOG v${latest}`);
}

if (problems.length > 0) {
  console.error(`✗ Dokumentacja NIEzsynchronizowana z CHANGELOG (najnowsza: v${latest}):`);
  for (const p of problems) console.error('   • ' + p);
  console.error(`\n→ Zaktualizuj status w tych plikach i podbij marker SYNC do v${latest}.`);
  process.exit(1);
}

console.log(`✓ Dokumentacja zsynchronizowana z CHANGELOG v${latest}: ${TARGETS.join(', ')}.`);
