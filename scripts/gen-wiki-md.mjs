#!/usr/bin/env node
// Generator Wiki (GitHub-wiki) z jednego źródła: dashboard/lib/wikiData.ts.
// Nadpisuje docs/wiki/Commands.md i Modules.md (zgodnie z istniejącą konwencją [[Strona]]).
// Zrzuty przez raw-URL GitHub — działają i w repo, i w GitHub Wiki. Node 26 czyta .ts natywnie.
// Uruchom: node scripts/gen-wiki-md.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COMMAND_COUNT,
  COMMAND_GROUPS,
  MODULE_COUNT,
  MODULE_GROUPS,
} from '../dashboard/lib/wikiData.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'wiki');
mkdirSync(OUT, { recursive: true });
const RAW = 'https://raw.githubusercontent.com/Gh0s777tt/E-Bot/main/dashboard/public';
const shot = (p) => `${RAW}${p}`;
const DIV = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

// ── Commands.md ──
let commands = `# 🤖 Komendy E‑BOT

Ponad **${COMMAND_COUNT}** komend slash pogrupowanych tematycznie. Subkomendy podane po kropce.
W Discordzie wpisz \`/help\`, aby przeszukać je na żywo. Konfiguracja modułów: [[Modules]].

> Generowane z \`dashboard/lib/wikiData.ts\` — nie edytuj ręcznie (\`node scripts/gen-wiki-md.mjs\`).
`;
for (const g of COMMAND_GROUPS) {
  commands += `\n## ${g.title}\n\n| Komenda | Opis | Subkomendy |\n|:--|:--|:--|\n`;
  for (const c of g.cmds) {
    commands += `| \`${c.n}\` | ${c.d} | ${c.s ? c.s.replace(/\|/g, '\\|') : '—'} |\n`;
  }
}
commands += `\n${DIV}\n<div align="center"><sub>[[Home]] · [[Modules]] · ${COMMAND_COUNT}+ komend · E-Forge</sub></div>\n`;

// ── Modules.md ──
let modules = `# 🧩 Moduły — konfiguracja krok po kroku

**${MODULE_COUNT}+** modułów panelu. Każdy włączysz i skonfigurujesz bez kodu. Pełna lista komend: [[Commands]].

> Generowane z \`dashboard/lib/wikiData.ts\` — nie edytuj ręcznie (\`node scripts/gen-wiki-md.mjs\`).
`;
for (const g of MODULE_GROUPS) {
  modules += `\n${DIV}\n## ${g.title}\n`;
  for (const m of g.items) {
    modules += `\n### ${m.t} — \`${m.p}\`\n\n${m.d}\n\n`;
    if (m.shot) modules += `![${m.t}](${shot(m.shot)})\n\n`;
    modules += '**Konfiguracja krok po kroku:**\n\n';
    m.steps.forEach((s, i) => {
      modules += `${i + 1}. ${s}\n`;
    });
    if (m.c) modules += `\n**Powiązane komendy:** \`${m.c}\`\n`;
  }
}
modules += `\n${DIV}\n<div align="center"><sub>[[Home]] · [[Commands]] · ${MODULE_COUNT}+ modułów · E-Forge</sub></div>\n`;

writeFileSync(join(OUT, 'Commands.md'), commands);
writeFileSync(join(OUT, 'Modules.md'), modules);
console.log(
  `✓ Wiki MD: Commands.md (${COMMAND_COUNT} komend) + Modules.md (${MODULE_COUNT} modułów)`,
);
