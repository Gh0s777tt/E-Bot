#!/usr/bin/env node
// scripts/bump-sync-markers.mjs <wersja>
// Podbija marker `<!-- SYNC: vX.Y.Z · … -->` w README/PHASES/ROADMAP oraz badge wersji
// w README do podanej wersji — żeby `pnpm docs:check` był zielony PO release'ie semantic-release.
// Wołany przez @semantic-release/exec (prepareCmd) tuż przed commitem release'a.
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

  // Badge wersji w README (shields.io: wersja-X.Y.Z).
  if (rel === 'README.md') {
    text = text.replace(/(badge\/wersja-)\d+\.\d+\.\d+/g, `$1${version}`);
  }

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
