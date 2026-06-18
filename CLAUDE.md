# CLAUDE.md — E‑BOT (GH0ST EMPIRE)

Monorepo **pnpm**. Pakiety:
- `bot/` — Discord (discord.js v14), ~95 slash‑komend, ~40 usług w tle, **i18n 14 języków**, SQLite.
- `dashboard/` — panel Next.js (React 19 / Tailwind 4 / TS 6) → Vercel + Supabase.
- `web/` — „GameVault" (Netflix dla gier), osobny Next.js.
- `ingest/` — kolektory Steam · PSN · GOG · IGDB → SQLite/Supabase.

Pełny status: [`docs/PHASES.md`](docs/PHASES.md) · roadmapa: [`docs/ROADMAP.md`](docs/ROADMAP.md) · historia: [`CHANGELOG.md`](CHANGELOG.md).

---

## 🔄 ZASADA #1 — dokumentacja zawsze zsynchronizowana z CHANGELOG

Każda zmiana, która dopisuje wpis do `CHANGELOG.md` (nowa wersja `## [x.y.z]`), **w tym samym podejściu** MUSI zaktualizować:

1. **`docs/PHASES.md`** — status `[x]`/`[ ]`, sekcję **„🔭 Bieżący tor"**, mapę er (jeśli trzeba), badge wersji, marker `<!-- SYNC: vX.Y.Z · #NNN · YYYY-MM-DD -->` u góry, datę w stopce.
2. **`docs/ROADMAP.md`** — badge wersji, tabelę faz/etapów, Gantt (gdy kamień milowy), marker `<!-- SYNC -->`, datę.

Marker `<!-- SYNC: v… -->` na górze obu plików **musi równać się** najnowszej wersji w CHANGELOG.

**Przed zakończeniem pracy uruchom `pnpm docs:check`** — musi zwrócić exit 0. Skrypt: [`scripts/check-docs-sync.mjs`](scripts/check-docs-sync.mjs) (pilnuje też badge'a wersji + blurbu „Najnowsze" w README).

Egzekwowane automatycznie w **3 warstwach**: **CI** (`.github/workflows/ci.yml`, na push/PR) · **git pre‑commit** (`scripts/hooks/`, aktywacja na klon: `git config core.hooksPath scripts/hooks`) · **hook Claude Code (Stop)** w `.claude/settings.json`.

Konwencja CHANGELOG: najnowsze na górze · `## [wersja] — tytuł` · punkty `[#NNN]` · SemVer · badge `updaty`/`wersja` u góry pliku.

---

## ✅ Bramki jakości (zanim powiesz „gotowe")

- `pnpm check` (Biome) · `pnpm typecheck` · **`pnpm docs:check`**
- Panel: `dashboard` `tsc` exit 0.
- i18n: zachowuj **parzystość kluczy × 14 języków** (PL bazowo, fallback → EN → PL); marki i tokeny (`/komendy`, `{placeholdery}`, nazwy usług) nietłumaczone.

## 🌍 Języki (14)
`pl en de es it fr pt zh ko ru uk ja ar id` — arabski wymaga RTL. PL = baza i fallback.

## 🗣️ Język / styl
- Dokumentacja, komunikaty i CHANGELOG **po polsku**.
- Styl docs: badge'e shields.io, emoji, diagramy mermaid, dywizory `━━━` — zachowuj.
