#!/usr/bin/env node
// Generator pełnej dokumentacji A→Z (HTML źródłowy pod PDF) z jednego źródła: dashboard/lib/wikiData.ts.
// Nadpisuje scripts/pdf/full.html (motyw marki, A4). Render do PDF: patrz scripts/pdf/README.md.
// Uruchom: node scripts/pdf/gen-full-pdf.mjs   (Node 26 czyta .ts natywnie)
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COMMAND_COUNT,
  COMMAND_GROUPS,
  MODULE_COUNT,
  MODULE_GROUPS,
} from '../../dashboard/lib/wikiData.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const cmdRows = COMMAND_GROUPS.map((g) => {
  const rows = g.cmds
    .map(
      (c) =>
        `<div class="cmd"><code class="cn">/${esc(String(c.n).replace(/^\//, ''))}</code><div><div class="cd">${esc(c.d)}</div>${
          c.s ? `<div class="cs">↳ ${esc(c.s)}</div>` : ''
        }</div></div>`,
    )
    .join('\n');
  return `<h2>${esc(g.title)} <span class="cnt">${g.cmds.length}</span></h2>\n<div class="cmds">${rows}</div>`;
}).join('\n');

const modBlocks = MODULE_GROUPS.map((g) => {
  const items = g.items
    .map((m) => {
      const steps = (m.steps || []).map((s) => `<li>${esc(s)}</li>`).join('');
      return `<div class="mod"><h3>${esc(m.t)}${m.p ? ` <span class="mc">${esc(m.p)}</span>` : ''}</h3><p class="md">${esc(m.d)}</p>${
        steps ? `<ol class="steps">${steps}</ol>` : ''
      }${m.c ? `<p class="rel">Powiązane komendy: <code>${esc(m.c)}</code></p>` : ''}</div>`;
    })
    .join('\n');
  return `<h2>${esc(g.title)}</h2>\n${items}`;
}).join('\n');

const toc = [
  '<div class="toc"><div class="toc-col"><div class="toc-h">Komendy</div>',
  ...COMMAND_GROUPS.map(
    (g) => `<div class="toc-i">${esc(g.title)} <span>${g.cmds.length}</span></div>`,
  ),
  '</div><div class="toc-col"><div class="toc-h">Moduły</div>',
  ...MODULE_GROUPS.map((g) => `<div class="toc-i">${esc(g.title)}</div>`),
  '</div></div>',
].join('\n');

const html = `<!doctype html>
<html lang="pl"><head><meta charset="utf-8" /><title>E-Bot — pełna dokumentacja funkcji (A→Z)</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4; margin: 0; }
  html, body { background: #0e0e12; color: #d3d3da; font-family: 'Segoe UI', system-ui, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .doc { padding: 14mm 14mm 16mm; }
  .accent { color: #e50914; }
  .muted { color: #9a9aa6; }
  h1 { font-size: 30pt; color: #fff; line-height: 1.1; letter-spacing: .01em; }
  .secTitle { font-size: 21pt; color: #fff; margin: 6mm 0 4mm; padding-bottom: 5pt; border-bottom: 2px solid #e50914; break-after: avoid; }
  h2 { font-size: 13.5pt; color: #fff; margin: 7mm 0 2.5mm; padding-bottom: 4pt; border-bottom: 1px solid #232329; break-after: avoid; display: flex; align-items: baseline; gap: 8pt; }
  .cnt { font-size: 8.5pt; color: #e50914; font-weight: 700; }
  .cmds { display: block; }
  .cmd { display: grid; grid-template-columns: 36mm 1fr; gap: 8pt; padding: 3.2pt 0; border-bottom: 1px solid #191920; break-inside: avoid; }
  .cn { color: #ff5860; font-family: 'Consolas', monospace; font-size: 9.5pt; font-weight: 700; }
  .cd { font-size: 9.5pt; color: #cfcfd6; line-height: 1.4; }
  .cs { font-size: 8pt; color: #7a7a85; margin-top: 1pt; }
  .mod { break-inside: avoid; border: 1px solid #232329; border-radius: 8pt; background: #121217; padding: 9pt 11pt; margin: 6pt 0; }
  .mod h3 { font-size: 12pt; color: #fff; margin-bottom: 3pt; }
  .mc { font-family: 'Consolas', monospace; font-size: 9pt; color: #e50914; font-weight: 600; }
  .md { font-size: 9.5pt; color: #c2c2cb; line-height: 1.5; }
  .steps { margin: 5pt 0 0 0; padding-left: 16pt; }
  .steps li { font-size: 9pt; color: #cfcfd6; line-height: 1.5; margin: 1.5pt 0; }
  .rel { font-size: 8.5pt; color: #9a9aa6; margin-top: 5pt; }
  .rel code, .md code { font-family: 'Consolas', monospace; color: #e50914; }
  .cover { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20mm; position: relative; page-break-after: always; }
  .glow { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 150mm; height: 150mm; border-radius: 50%; background: radial-gradient(circle, rgba(229,9,20,.22), transparent 70%); }
  .logo { width: 32mm; height: 32mm; border-radius: 10pt; object-fit: cover; border: 1px solid rgba(229,9,20,.4); margin-bottom: 12pt; position: relative; }
  .tag { display: inline-block; font-size: 8.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: .14em; color: #e50914; border: 1px solid rgba(229,9,20,.4); background: rgba(229,9,20,.1); padding: 4pt 10pt; border-radius: 99pt; position: relative; }
  .lead { font-size: 11.5pt; color: #c7c7d1; max-width: 150mm; margin: 12pt auto 0; line-height: 1.6; position: relative; }
  .pill-row { display: flex; gap: 8pt; justify-content: center; margin-top: 16pt; flex-wrap: wrap; position: relative; }
  .pill { border: 1px solid #232329; border-radius: 8pt; padding: 7pt 13pt; font-size: 9.5pt; background: #121217; }
  .pill b { color: #e50914; font-size: 13pt; }
  .toc { display: grid; grid-template-columns: 1fr 1fr; gap: 14pt; margin: 4mm 0 2mm; }
  .toc-h { font-size: 11pt; color: #e50914; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 4pt; }
  .toc-i { font-size: 9pt; color: #c2c2cb; padding: 1.5pt 0; display: flex; justify-content: space-between; border-bottom: 1px solid #191920; }
  .toc-i span { color: #7a7a85; }
</style></head>
<body>
  <section class="cover">
    <div class="glow"></div>
    <img class="logo" src="../../dashboard/public/ghost-skull.png" alt="E-Bot" />
    <span class="tag">Pełna dokumentacja · A → Z</span>
    <h1 style="margin-top: 14pt">E-<span class="accent">BOT</span> — wszystkie funkcje</h1>
    <p class="lead">Kompletny przewodnik po wszystkich komendach i modułach E-Bota: ${COMMAND_COUNT}+ komend slash w ${COMMAND_GROUPS.length} kategoriach oraz ${MODULE_COUNT}+ modułów panelu z konfiguracją krok po kroku. Wszystko sterowane z panelu web w 14 językach.</p>
    <div class="pill-row">
      <div class="pill"><b>${COMMAND_COUNT}+</b> komend</div>
      <div class="pill"><b>${MODULE_COUNT}+</b> modułów</div>
      <div class="pill"><b>14</b> języków</div>
    </div>
    <p class="muted" style="margin-top: 22pt; font-size: 9pt; position: relative">E-Forge · e-bot-dc.vercel.app</p>
  </section>

  <div class="doc">
    <div class="secTitle">Spis treści</div>
    ${toc}

    <div class="secTitle">🤖 Komendy (${COMMAND_COUNT}+)</div>
    ${cmdRows}

    <div class="secTitle">🧩 Moduły — konfiguracja krok po kroku (${MODULE_COUNT}+)</div>
    ${modBlocks}

    <p class="muted" style="margin-top: 12mm; text-align: center; font-size: 8.5pt; border-top: 1px solid #232329; padding-top: 6pt;">E-Bot · E-Forge — e-bot-dc.vercel.app · pełna dokumentacja wygenerowana z wikiData.ts</p>
  </div>
</body></html>
`;

writeFileSync(join(ROOT, 'scripts', 'pdf', 'full.html'), html);
console.log(
  `✓ full.html — ${COMMAND_COUNT} komend / ${MODULE_COUNT} modułów (render PDF: patrz scripts/pdf/README.md)`,
);
