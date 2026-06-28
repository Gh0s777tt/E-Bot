#!/usr/bin/env node
// Generator listy komend do wpisu top.gg z JEDNEGO źródła prawdy:
//   • opisy (EN/PL, ten sam tekst co w Discordzie) — bot/src/i18n/commandDescriptions.mts
//   • grupowanie po kategoriach + subkomendy — dashboard/lib/wikiData.ts
// Nadpisuje docs/topgg/commands.md (pogrupowane, EN+PL) i commands.json (flat, name→description EN).
// Uruchom: node scripts/gen-topgg-commands.mjs   (Node 26 czyta .ts natywnie)
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMMAND_DESC } from '../bot/src/i18n/commandDescriptions.mts';
import { COMMAND_GROUPS } from '../dashboard/lib/wikiData.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const en = COMMAND_DESC.en;
const pl = COMMAND_DESC.pl;
const norm = (n) => String(n).replace(/^\//, '').trim();
const esc = (s) => (s || '').replace(/\|/g, '\\|');

// name -> subkomendy (z wikiData) + budowa grup w kolejności katalogu
const sub = {};
const wd = {}; // wikiData opis (PL) — fallback dla komend spoza commandDescriptions (np. /tutorial)
const seen = new Set();
const groups = [];
for (const g of COMMAND_GROUPS) {
  const names = [];
  for (const c of g.cmds) {
    const key = norm(c.n);
    sub[key] = c.s || '';
    wd[key] = c.d || '';
    names.push(key);
    seen.add(key);
  }
  groups.push({ title: g.title, names });
}
// komendy z opisów, których nie ma w żadnej grupie (np. /vote, nowe) → „Pozostałe"
const leftovers = Object.keys(en).filter((n) => !seen.has(n));
if (leftovers.length) groups.push({ title: 'Pozostałe', names: leftovers });

// ── commands.json (flat, EN) — pełny zarejestrowany zestaw z opisów ──
const flat = Object.keys(en).map((n) => ({ name: n, description: en[n] }));
writeFileSync(`${ROOT}/docs/topgg/commands.json`, `${JSON.stringify(flat, null, 2)}\n`);

// ── commands.md (pogrupowane, EN + PL + subkomendy) ──
let md =
  '<!-- Wygenerowane: node scripts/gen-topgg-commands.mjs (źródło: commandDescriptions.mts + wikiData.ts). Nie edytuj ręcznie. -->\n';
md += `# 🤖 Komendy E‑Bot — do wpisu top.gg (${flat.length})\n\n`;
md +=
  '> EN = opis pokazywany na top.gg. Pogrupowane jak w [/wiki]. Import na top.gg ciągnie je z Discorda automatycznie — to lista referencyjna / do ręcznego wklejenia.\n';
for (const g of groups) {
  if (!g.names.length) continue;
  md += `\n## ${g.title}\n\n| Komenda | Description (EN) | Opis (PL) | Subkomendy |\n|:--|:--|:--|:--|\n`;
  for (const key of g.names) {
    md += `| \`/${key}\` | ${esc(en[key] || wd[key])} | ${esc(pl[key] || wd[key])} | ${esc(sub[key]) || '—'} |\n`;
  }
}
writeFileSync(`${ROOT}/docs/topgg/commands.md`, md);

console.log(
  `✓ top.gg commands: ${flat.length} komend → docs/topgg/commands.json + commands.md (${groups.length} grup)`,
);
