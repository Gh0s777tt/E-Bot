#!/usr/bin/env node
// scripts/check-docs-sync.mjs
// Strażnik synchronizacji dokumentacji: pilnuje, by README.md, docs/PHASES.md i docs/ROADMAP.md
// niosły wersję zgodną z najnowszym wpisem w CHANGELOG.md. Zero zależności.
//
// Użycie:  pnpm docs:check        (lub: node scripts/check-docs-sync.mjs)
// Wyjście: 0 = OK · 1 = rozjazd (komunikat mówi dokładnie, co poprawić).
//
// Idea: CHANGELOG jest źródłem prawdy (najnowsza wersja u góry). Skrypt sprawdza TRZY rzeczy:
//   1. marker `<!-- SYNC: vX.Y.Z · #NNN · YYYY-MM-DD -->` u góry każdego pliku,
//   2. badge wersji `shields.io/badge/wersja-X.Y.Z` w każdym pliku,
//   3. blurb „📜 Najnowsze" w README — pierwsza wypunktowana wersja `**vX.Y.Z**`.
// Nowy plik do pilnowania? Dopisz go do TARGETS.
//
// DLACZEGO punkt 3 (audyt medium — „docs:check to pieczątka"): punkty 1 i 2 są przepisywane
// automatycznie przez `scripts/bump-sync-markers.mjs` (prepareCmd semantic-release), więc SAME
// z siebie nie dowodzą niczego — po każdym release'ie byłyby zielone niezależnie od tego, czy
// ktokolwiek tknął TREŚĆ dokumentacji. Blurb „Najnowsze" to zdanie pisane przez człowieka —
// żaden skrypt go nie wygeneruje. To jest jedyne miejsce, w którym ta bramka faktycznie gryzie:
// czerwona, dopóki README nie opisze tego, co realnie wyszło w najnowszej wersji.
// CLAUDE.md i README od dawna deklarowały, że bramka pilnuje badge'a i blurbu — teraz to prawda.

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
// Badge shields.io: "…img.shields.io/badge/wersja-0.222.0-E50914?…" (styl badge'a bywa różny —
// dlatego łapiemy tylko fragment `badge/wersja-X.Y.Z`, wspólny dla README/PHASES/ROADMAP).
const BADGE = /badge\/wersja-(\d+\.\d+\.\d+)/;
// Sekcja „## 📜 Najnowsze" w README, do następnego nagłówka `## ` (bez flagi `m`, żeby `$`
// znaczyło koniec pliku, a nie koniec linii — sekcja może być ostatnia).
const BLURB_SECTION = /\n##[^\n]*Najnowsze[^\n]*\n([\s\S]*?)(?=\n##\s|$)/;
// Pierwsza wersja wypunktowana w blurbie: "**v0.222.0** — …".
const BLURB_VERSION = /\*\*v(\d+\.\d+\.\d+)\*\*/;

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

  const b = text.match(BADGE);
  if (!b) problems.push(`${rel}: brak badge'a wersji "…/badge/wersja-X.Y.Z-…"`);
  else if (b[1] !== latest) problems.push(`${rel}: badge wersji v${b[1]} ≠ CHANGELOG v${latest}`);

  // Blurb „Najnowsze" istnieje tylko w README — to on jest realną bramką (patrz nagłówek pliku).
  if (rel === 'README.md') {
    const sec = text.match(BLURB_SECTION);
    if (!sec) {
      problems.push(`${rel}: brak sekcji "## 📜 Najnowsze"`);
    } else {
      const v = sec[1].match(BLURB_VERSION);
      if (!v) problems.push(`${rel}: blurb „Najnowsze" nie zaczyna się od "**vX.Y.Z** — …"`);
      else if (v[1] !== latest) {
        problems.push(
          `${rel}: blurb „Najnowsze" prowadzi v${v[1]} ≠ CHANGELOG v${latest}` +
            ' — dopisz jednozdaniowy opis najnowszej wersji na początku akapitu',
        );
      }
    }
  }
}

if (problems.length > 0) {
  console.error(`✗ Dokumentacja NIEzsynchronizowana z CHANGELOG (najnowsza: v${latest}):`);
  for (const p of problems) console.error(`   • ${p}`);
  console.error(`\n→ Zaktualizuj status w tych plikach i podbij marker SYNC do v${latest}.`);
  process.exit(1);
}

console.log(
  `✓ Dokumentacja zsynchronizowana z CHANGELOG v${latest} (marker + badge + blurb „Najnowsze"): ${TARGETS.join(', ')}.`,
);
