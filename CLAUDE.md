# CLAUDE.md — E‑BOT (E-Forge)

Monorepo **pnpm**. Pakiety:
- `bot/` — Discord (discord.js v14), 102 slash‑komendy, 76 usług w tle, **i18n 14 języków**, SQLite.
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

Egzekwowane automatycznie w **3 warstwach**: **CI** (`.gitlab-ci.yml`, job `sync:check` w stage `sync` — na Merge Request i na `main`; GitLab = źródło prawdy, GitHub to mirror tylko‑do‑odczytu bez workflowów) · **git pre‑commit** (`scripts/hooks/`, aktywacja na klon: `git config core.hooksPath scripts/hooks`) · **hook Claude Code (Stop)** w `.claude/settings.json`.

Konwencja CHANGELOG: najnowsze na górze · `## [wersja] — tytuł` · punkty `[#NNN]` · SemVer · badge `updaty`/`wersja` u góry pliku.

---

## 🔄 ZASADA #2 — zawsze wypchnięte, zero backlogów

Właściciel nie chce backlogów ani braków. Praca jest „gotowa" dopiero, gdy **kod + testy + docs są
zielone, zacommitowane I wypchnięte**:

1. **Nic niezacommitowanego** na koniec sesji; celowo odłożone rzeczy są śledzone (`docs/ROADMAP.md`
   / `docs/PHASES.md`), nie porzucone po cichu.
2. **Docs na bieżąco** (ZASADA #1): CHANGELOG + `docs/PHASES.md` + `docs/ROADMAP.md` + README +
   dotknięte `docs/*.md`, w tym samym podejściu co zmiana. Otwórz MR dla wypchniętej gałęzi.
3. **Wypchnięte na źródło prawdy.** GitLab = źródło prawdy (CI, `sync:check`, `pages`); GitHub =
   mirror tylko-do-odczytu (Vercel/Railway deployują z niego). Push idzie na GitLab; mirror
   podchwytuje. Na koniec zweryfikuj `HEAD == <remote>/<branch>`; zero commitów ponad remote. Jeśli
   remote nie da się zautoryzować, powiedz to WPROST i zostaw komendę do pushu.
4. **Bez martwych gałęzi** — po mergu skasuj gałąź.

Zasada nadrzędna: **jeśli po pracy zostaje brak — niezacommitowany plik, niewypchnięty commit,
nieaktualny doc, nieotwarty MR, martwa gałąź — praca NIE jest skończona.**

---

## ✅ Bramki jakości (zanim powiesz „gotowe")

- `pnpm check` (Biome) · `pnpm typecheck` · **`pnpm docs:check`** · **`pnpm schema:check`** (`_ALL.sql` ↔ pliki per‑feature) · **`pnpm env:check`** (`.env.example` ↔ `process.env`) — zbiorczo: **`pnpm sync:check`**
- Panel: `dashboard` `tsc` exit 0.
- i18n: zachowuj **parzystość kluczy × 14 języków** (PL bazowo, fallback → EN → PL); marki i tokeny (`/komendy`, `{placeholdery}`, nazwy usług) nietłumaczone.

## 🌍 Języki (14)
`pl en de es it fr pt zh ko ru uk ja ar id` — arabski wymaga RTL. PL = baza i fallback.

## 🗣️ Język / styl
- Dokumentacja, komunikaty i CHANGELOG **po polsku**.
- Styl docs: badge'e shields.io, emoji, diagramy mermaid, dywizory `━━━` — zachowuj.
