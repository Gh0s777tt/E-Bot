# 🤝 Współtworzenie — E‑Bot

Dzięki za zainteresowanie! Ten dokument opisuje, jak pracować z repozytorium E‑Bot zgodnie z jego standardami.

---

## 🔀 Model repozytorium

- **GitLab** (`gitlab.com/Gh0s777tt/e-bot`) = **źródło prawdy** — tu trafiają commity, tu działa CI/CD.
- **GitHub** = **mirror tylko‑do‑odczytu** (aktualizowany automatycznie). **Nie otwieraj PR‑ów na GitHubie** — nie zostaną wciągnięte.
- Wdrożenia: **Vercel** (`dashboard/`) i **Railway** (`bot/`) wyzwalane z mirrora GitHub.

Rozwój prowadź na GitLabie: gałąź → **Merge Request** do `main`.

---

## 🛠️ Środowisko

| Narzędzie | Wersja |
|:--|:--|
| Node | ≥ 24 (`.nvmrc` → `nvm use`) |
| pnpm | `pnpm@11.5.2` (pinowany w `package.json`) |

```bash
pnpm install                     # RAZ w rootcie — używaj wyłącznie pnpm (overrides bezpieczeństwa)
git config core.hooksPath scripts/hooks   # aktywuj hooki (pre-commit)
```

> Szczegóły uruchomienia pakietów → [README](README.md#-szybki-start).

---

## ✍️ Konwencja commitów (Conventional Commits)

Format: `typ(zakres): opis` — np. `feat(bot): komenda /emoji`, `fix(dashboard): wyścig w /market buy`.

Typy: `feat` · `fix` · `docs` · `refactor` · `test` · `chore` · `perf` · `ci` · `build`.

- Commity **małe i tematyczne** (osobno funkcja, osobno docs, osobno CI).
- Opis po **polsku** (jak cała dokumentacja i CHANGELOG).

---

## ✅ Bramki jakości (muszą przejść przed „gotowe")

Zbiorczo: **`pnpm sync:check`** + poniższe:

| Komenda | Pilnuje |
|:--|:--|
| `pnpm check` | Biome — lint + format (2 spacje, lineWidth 100, `'` pojedyncze) |
| `pnpm typecheck` | `tsc --noEmit` w 4 pakietach |
| `pnpm docs:check` | marker `<!-- SYNC: vX.Y.Z -->` w README/PHASES/ROADMAP = najnowsza wersja CHANGELOG |
| `pnpm schema:check` | `_ALL.sql` ↔ pliki SQL per‑feature |
| `pnpm env:check` | `.env.example` ↔ `process.env` |
| `pnpm test` | Vitest + próg pokrycia |

Hook **pre‑commit** (`scripts/hooks/`) uruchamia strażników synchronizacji i `biome --staged`; awaryjnie: `git commit --no-verify`.
Te same bramki działają w **GitLab CI** (`.gitlab-ci.yml`) na każdym MR.

---

## 📜 CHANGELOG i dokumentacja

Zmiana z nowym wpisem `## [x.y.z]` w [`CHANGELOG.md`](CHANGELOG.md) **w tym samym podejściu** aktualizuje markery `<!-- SYNC -->` w `README.md`, `docs/PHASES.md`, `docs/ROADMAP.md` (pilnuje `pnpm docs:check`). Najnowsze na górze, SemVer, punkty `[#NNN]`.

---

## 🌍 i18n

14 języków (`pl en de es it fr pt zh ko ru uk ja ar id`, PL = baza/fallback). Zachowuj **parzystość kluczy × 14 języków**; marki, `/komendy` i `{placeholdery}` pozostają nietłumaczone.

---

## 🔐 Bezpieczeństwo

Podatności zgłaszaj prywatnie wg [`.github/SECURITY.md`](.github/SECURITY.md) — **nie** przez publiczne issue. Sekrety trzymaj wyłącznie w `.env*` (gitignored).
