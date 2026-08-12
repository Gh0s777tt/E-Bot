#!/usr/bin/env node
// scripts/bump-sync-markers.mjs <wersja>
// Podbija marker `<!-- SYNC: vX.Y.Z · … -->` ORAZ badge wersji (`badge/wersja-X.Y.Z`) we WSZYSTKICH
// trzech plikach docs (README/PHASES/ROADMAP). Wołany przez @semantic-release/exec (prepareCmd)
// tuż przed commitem release'a.
//
// PODZIAŁ ODPOWIEDZIALNOŚCI (audyt medium — „docs:check to pieczątka"):
//   • MECHANICZNE (tu, automat): marker + badge — to są gołe stringi wersji, człowiek nic tu nie wnosi.
//     Wcześniej badge podbijany był TYLKO w README, przez co PHASES/ROADMAP zostały na 0.626.0
//     mimo markera 0.627.0 — dokładnie ten rozjazd, którego wzmocniony docs:check teraz pilnuje.
//   • TREŚĆ (świadomie NIE tutaj): blurb „📜 Najnowsze" w README pisze człowiek. Żaden automat nie
//     streści release'u sensownie, a gdyby to robił, bramka `pnpm docs:check` znów byłaby pieczątką
//     zieloną z definicji. Po release'ie docs:check jest czerwony do czasu dopisania blurbu — i to
//     jest cel, nie usterka.
//
// Użycie ręczne (np. dry-run): node scripts/bump-sync-markers.mjs 0.627.0

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const version = (process.argv[2] || '').trim().replace(/^v/, '');
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(
    `✗ bump-sync-markers: podaj poprawną wersję (x.y.z), otrzymano: "${process.argv[2]}"`,
  );
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const MARKER_RE = /(<!--\s*SYNC:\s*v)\d+\.\d+\.\d+(\s*·\s*#[\w-]+\s*·\s*)\d{4}-\d{2}-\d{2}/;

const targets = ['README.md', 'docs/PHASES.md', 'docs/ROADMAP.md'];
const changed = [];

for (const rel of targets) {
  const path = join(ROOT, rel);
  let text = readFileSync(path, 'utf8');
  const before = text;

  // Marker SYNC (wersja + data). Numer #NNN zostawiamy — pochodzi z ręcznego wpisu.
  text = text.replace(MARKER_RE, (_m, p1, p2) => `${p1}${version}${p2}${today}`);

  // Badge wersji (shields.io: wersja-X.Y.Z) — we wszystkich trzech plikach, nie tylko w README:
  // check-docs-sync.mjs egzekwuje badge w każdym TARGET-cie.
  text = text.replace(/(badge\/wersja-)\d+\.\d+\.\d+/g, `$1${version}`);

  if (text !== before) {
    writeFileSync(path, text);
    changed.push(rel);
  } else {
    console.warn(`⚠ ${rel}: nie znaleziono markera/badge do podbicia (sprawdź format).`);
  }
}

console.log(
  `✓ bump-sync-markers: podbito do v${version} (${today}) w: ${changed.join(', ') || 'brak zmian'}`,
);
