#!/usr/bin/env node
// scripts/check-env-sync.mjs
// Strażnik PARZYSTOŚCI env: pilnuje, by KAŻDA zmienna `process.env.X` czytana w kodzie miała wpis
// w .env.example. Brak = świeży klon nie wie, że zmienna jest potrzebna (panel/bot się nie uruchomi,
// a README kieruje do .env.example). Zero zależności. Lustro idei `check-docs-sync.mjs`.
//
// Użycie:  pnpm env:check   (lub: node scripts/check-env-sync.mjs)
// Wyjście: 0 = OK · 1 = nieudokumentowane zmienne (komunikat je wypisuje).
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIRS = ['bot/src', 'dashboard', 'web', 'ingest', 'scripts'];
const EXT = new Set(['.ts', '.mts', '.tsx', '.js', '.mjs', '.cts']);
const SKIP = /[\\/](node_modules|\.next|dist|out|coverage|\.turbo)[\\/]/;

// Zmienne platformowe/testowe/runtime — nie wymagają wpisu w .env.example.
const ALLOW = new Set([
  'NODE_ENV',
  'CI',
  'VERCEL',
  'VERCEL_URL',
  'VERCEL_ENV',
  'VERCEL_REGION',
  'PORT',
  'E2E_PORT',
  'E2E_PROD',
  'T_INT',
  'T_BOOL',
  'PWD',
  'HOME',
  'TMPDIR',
  'TEMP',
]);

const envRe = /process\.env\.([A-Z][A-Z0-9_]+)|process\.env\[['"]([A-Z][A-Z0-9_]+)['"]\]/g;
const used = new Map(); // nazwa -> pierwszy plik
for (const d of SRC_DIRS) {
  let entries;
  try {
    entries = readdirSync(join(ROOT, d), { recursive: true, withFileTypes: true });
  } catch {
    continue;
  }
  for (const e of entries) {
    if (!e.isFile()) continue;
    const full = join(e.parentPath ?? e.path, e.name);
    if (SKIP.test(full) || !EXT.has(extname(e.name))) continue;
    for (const m of readFileSync(full, 'utf8').matchAll(envRe)) {
      const name = m[1] || m[2];
      if (!used.has(name)) used.set(name, full);
    }
  }
}

const example = readFileSync(join(ROOT, '.env.example'), 'utf8');
const documented = new Set([...example.matchAll(/^\s*([A-Z][A-Z0-9_]+)\s*=/gm)].map((m) => m[1]));

// LIMIT_<FEATURE>_<TIER> — opcjonalne nadpisanie limitów planu (dashboard/lib/premiumPlan.ts);
// fallback do stałej PLAN_LIMITS, więc niewymagane do uruchomienia → bez wpisu w .env.example.
const missing = [...used.keys()]
  .filter((n) => !documented.has(n) && !ALLOW.has(n) && !n.startsWith('LIMIT_'))
  .sort();
if (missing.length > 0) {
  console.error(`✗ ${missing.length} zmiennych process.env BEZ wpisu w .env.example:`);
  for (const n of missing) console.error(`   • ${n}`);
  console.error(
    '\n→ Dodaj je do .env.example (albo do allowlisty platformowej w scripts/check-env-sync.mjs).',
  );
  process.exit(1);
}
console.log(
  `✓ Env zsynchronizowany: wszystkie ${used.size} zmiennych process.env udokumentowane w .env.example.`,
);
