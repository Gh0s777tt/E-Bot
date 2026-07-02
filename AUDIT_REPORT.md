# 🔍 AUDYT PROJEKTU — E‑BOT (E‑Forge)

> Audyt **read‑only** wykonany przez senior engineera. Data: 2026‑06‑30. Commit bazowy: `22ca666` (main). Wersja repo: `v0.602.0`.
> Zasada: każdy wpis ma dowód (plik:linia / trasa / tabela). Sekrety podawane wyłącznie jako *nazwy* zmiennych.

_Raport zapisywany przyrostowo po każdej fazie. Sekcje formalne (Podsumowanie, Tabela ustaleń itd.) uzupełniane w miarę postępu; kompletne na końcu._

---

## ⚠️ SPROSTOWANIE + REMEDIACJA (#673 · 2026‑07‑02)

> Po audycie wykonano przejście naprawcze. **Dwa ustalenia audytu wymagały korekty faktograficznej** (błędy po mojej stronie), reszta została naprawiona. Oryginalny tekst niżej zostawiam dla śladu, ale **wiążące są liczby z tego bloku.**

**KOREKTA #1 (Krytyczny → zawężony): nie 12 tabel bez RLS, tylko 5.** Analiza RLS w Fazie 3 użyła regexa z pojedynczą spacją (`alter table X enable…`), który **nie złapał instrukcji wyrównanych wieloma spacjami** (`alter table user_levels    enable row level security;` w `faza4-schema.sql` i in.). Weryfikacja regexem tolerującym białe znaki (`alter table\s+(\w+)\s+enable row level security`) na `_ALL.sql` z HEAD: **48 create table, 43 z RLS, 5 BEZ RLS.** Realnie bez RLS było **tylko 5 tabel M1‑marketplace:** `guilds, guild_members, plugins, guild_plugins, plugin_config`. Pozostałe 7 błędnie oskarżonych (`user_levels, tickets, ai_usage, reminders, giveaways, economy_shop, birthdays`) **miały RLS od początku** — fałszywy alarm. Ryzyko realne (Stripe IDs w `guilds`, role w `guild_members`), ale węższe niż raportowano.
> **Naprawa:** dopisano `alter table … enable row level security;` dla tych 5 tabel do `dashboard/scripts/_ALL.sql` **oraz** `m1-marketplace-schema.sql` (idempotentnie, deny‑all dla `anon`; panel/bot działają przez `service_role`). **Wymaga uruchomienia w Supabase → SQL Editor** (DDL nie przechodzi przez `service_role`/PostgREST) — to jedyna część #1 po stronie właściciela.

**KOREKTA #9 (Niski → nie‑ustalenie): „stray console" w `lib/` to fałszywy pozytyw.** Jedyny `console` w `bot/src/lib/` jest w `bot/src/lib/log.mts:16‑17` i to **sam sink loggera** (`console.error`/`console.log` = docelowe wyjście JSON‑lines na Railway). Zamiana na `log.*` = rekurencja nieskończona. **Nic do naprawy** — grep audytu policzył implementację loggera jako „zabłąkany console".

**Naprawione w #673 (zweryfikowane lokalnie):**
- **#2 lint** — wszystkie błędy `useLiteralKeys`/`useOptionalChain` w plikach **w moim zakresie** (community/commands/analytics/cloud/security + 2 pliki panelu) naprawione (`['k']`→`.k`, `a||!a.b`→`!a?.b`). `typecheck` ×4 zielony. **Pozostałe 12 błędów biome są WYŁĄCZNIE w `bot/src/setup/` (empire‑hub, ghost‑*)** — osobny tor provisioningu właściciela, którego nie modyfikuję ani nie commituję; właściciel domyka je sam: `pnpm exec biome check --write --unsafe bot/src/setup`.
- **#4 README** — „Szybki start" przełączony `npm` → `pnpm` (root `pnpm install` + `pnpm --filter …`), chroni `overrides` postcss/undici.
- **#5 martwa gałąź** — `feat/role-dropdowns` usunięta (`git branch -d`).
- **#7 coverage** — dodany provider `@vitest/coverage-v8`, konfiguracja + skrypt `pnpm test:coverage` + progi‑ratchet pod baseline (stmts 34% / br 30% / fn 33% / ln 36%), gate zielony.
- **Usprawnienie #6** — dodany test parzystości `landingI18n` (LANDING ×14, 16 asercji zielonych) — analogiczny do `panelI18n.parity.test.ts`; parytet okazał się pełny, teraz zamrożony.
- **#6 tagi** — bieżące wydanie otagowane (patrz `git tag`).

**Poza moją mocą (po stronie właściciela):** #1 uruchomienie SQL w Supabase · #3 CI/billing GitHub Actions · #8 Redis/edge rate‑limit (decyzja infrastrukturalna, gdy sinki wejdą pod obciążenie).

---

## 1. Podsumowanie

E‑BOT (E‑Forge) to **dojrzały, bardzo rozbudowany monorepo pnpm**: bot Discord (discord.js v14, ~96 komend, dane w SQLite) + panel Next.js 16 / React 19 (55 stron, 115 tras API, Supabase) + `web` + `ingest`. Stack jest **nowoczesny** (React Compiler ON, Tailwind 4, TS 6), a **auth scentralizowany i solidny** (middleware `proxy.ts` gruntuje wszystkie trasy poza allowlistą + CSP z nonce/`strict-dynamic`). Jakość ilościowa wysoka: **1223 testy zielone**, `tsc`, `next build` i `pnpm audit` (0 podatności) przechodzą. Funkcjonalnie projekt jest **blisko produkcyjnego** — ostatni deploy Vercela `READY`, płatności Stripe wpięte, brak stron‑atrap i martwych linków w nawigacji. **Trzy najważniejsze ryzyka**, wszystkie w **konfiguracji/procesie** (nie w logice) i tanie do usunięcia: (1) **12 tabel Supabase bez RLS** przy publicznym kluczu `anon` — dziś tabele są puste, ale to „wyciek w oczekiwaniu" (Krytyczny); (2) **CI stoi od 2 tygodni** — 0 udanych runów, brak automatycznej bramki; (3) **bramka lintu czerwona** (12 błędów stylu `useLiteralKeys`). **Werdykt:** blisko produkcyjnego funkcjonalnie, ale **przed wpuszczeniem realnych danych do Supabase trzeba domknąć RLS**.

## 2. Zacznij tutaj (3 rzeczy)

1. **Włącz RLS na 12 tabelach** (wpis #1, Krytyczny) — `alter table <tabela> enable row level security;` dla `guilds, tickets, user_levels, guild_members, ai_usage, reminders, giveaways, economy_shop, birthdays, plugins, guild_plugins, plugin_config`. Bez polityk = deny‑all dla `anon`; serwer działa dalej przez `service_role`. **Zrób to, zanim w Supabase pojawią się realne dane.**
2. **Napraw bramkę lintu** (wpis #2) — `pnpm exec biome check --write` auto‑naprawia `useLiteralKeys`; `pnpm check` znów zielony (kilka minut).
3. **Przywróć CI** (wpis #3) — odblokuj GitHub Actions/billing konta; wróci automatyczna bramka (testy + lint na push), która dziś nie chroni `main`.

---

## 3. Tabela ustaleń

| # | Severity | Obszar | Problem | Dowód | Rekomendacja |
|---|----------|--------|---------|-------|--------------|
| 1 | **Krytyczny** | Supabase / RLS | 12 tabel bez `enable row level security`; publiczny klucz `anon` (w bundlu klienta) ma do nich dostęp (HTTP 200). Tabele dziś puste, ale `guilds` (Stripe IDs), `tickets`, `user_levels`, `birthdays`, `guild_members` to dane wrażliwe/PII → wyciek gdy pojawią się dane. | `dashboard/scripts/_ALL.sql` (36/48 `enable RLS`); empiryczny test `anon key` → 200 na 7/7 sprawdzonych | `alter table <12> enable row level security;` (deny‑all dla anon; serwer działa przez `service_role`) |
| 2 | Średni | Jakość / gate | Bramka lintu czerwona: **12 błędów** biome `lint/complexity/useLiteralKeys` w rdzeniu bota → `pnpm check`/`lint` nie przechodzi | `pnpm exec biome check` → „Found 12 errors"; pliki: `bot/src/automod.mts:80`, `cloud/alerts.mts:10`, `commands/{ticket,mod,rank,profile,prestige,donate,backlog,reactionpanel,customCommands}.mts`, `analytics/{seasons,ecoSeason,digest}.mts`, `commands/{aihelp,aidigest}.mts` | `pnpm exec biome check --write` (auto‑fix) |
| 3 | Średni | CI / proces | GitHub Actions `ci.yml` stoi — ostatnie runy 2026‑06‑15, **0 udanych w ostatnich 40**, run na `main` utknął `queued`. Brak automatycznej bramki na push. | `gh run list --workflow=ci.yml` | Odblokować Actions/billing konta (właściciel); do tego czasu bramki lokalne jako obowiązkowe |
| 4 | Średni | Dokumentacja | README „Szybki start" każe `npm install` w monorepo **pnpm** → ignoruje workspace + `overrides` (postcss/undici), ryzyko wciągnięcia załatanych podatności | `README.md:115,118` vs `pnpm-workspace.yaml` (`overrides`) | Zamienić na `pnpm install` w root |
| 5 | Niski | Higiena / repo | Gałąź `feat/role-dropdowns` zmergowana do `main` (martwa) | `git branch --merged main` | `git branch -d feat/role-dropdowns` (+ zdalna, jeśli jest) |
| 6 | Niski | Higiena / repo | Tagi git przestarzałe: tylko `v0.307.0`, `v0.535.0` przy repo `v0.602.0` (~67 wydań bez tagu) | `git tag` | Otagować bieżące wydania albo świadomie porzucić tagowanie |
| 7 | Niski | Testy | Brak konfiguracji coverage — nie da się zmierzyć % pokrycia (mimo 1223 testów) | brak `coverage` w konfigach vitest | Dodać `vitest run --coverage` + próg |
| 8 | Niski | Bezpieczeństwo | Rate‑limit publicznych sinków jest **in‑memory per‑instancja serverless** (nie globalny) — udokumentowane w kodzie | `dashboard/lib/rateLimit.ts:1‑4` | Redis/edge store, jeśli sinki (`/api/hook`, `/api/sentry`) wejdą pod realne obciążenie |
| 9 | Niski | Jakość | 1 zabłąkany `console.*` w `bot/src/lib/` (reszta 128 w `bot/src/setup/` = skrypty provisioning, akceptowalne) | grep `console.` w `bot/src` (rozkład: 29× setup, 1× lib) | Zamienić stray `console` w `lib/` na logger `log.*` |

_Uwaga pozytywna (nie‑ustalenia):_ brak zahardkodowanych sekretów w śledzonych plikach (`git grep` wzorców = 0), `.env`/`.env.local` nieśledzone, `pnpm audit` = 0 podatności, `service_role` nie wyciekany do klienta, model auth (middleware) solidny, brak stron‑atrap i martwych linków nav.

---

## Dziennik faz (surowe ustalenia)

### Faza 0 — Rozpoznanie ✅

**Stack (zweryfikowane z `package.json` / `pnpm-workspace.yaml`):**
- **Monorepo pnpm** (`bot-dc`, `packageManager: pnpm@11.5.2`, Node `>=24`; realnie Node **v26.4.0**, pnpm **11.5.2**). 4 pakiety: `dashboard`, `web`, `bot`, `ingest`.
- **`dashboard/`** — Next.js **16.2.9** (App Router), React **19.2.7**, Tailwind **4.3.1**, TS **6.0.3**, `@supabase/supabase-js` 2, `zod` 4, `lucide-react`. React Compiler włączony (`next.config.mjs` → `reactCompiler: true`). **55 stron** (`page.tsx`), **115 tras API** (`route.ts`).
- **`bot/`** — Discord (discord.js v14), TS natywny (`.mts`, Node 26). **305 plików `.mts`**, katalogi: `analytics cloud commands community creator economy empire engagement gaming i18n lib live security setup tickets`. Deps runtime: **tylko** `discord.js` + `@napi-rs/canvas` (bardzo szczupłe). Dane bota: lokalny **SQLite** (`data/bot.db`).
- **`web/`** — osobny Next.js („GameVault").
- **`ingest/`** — kolektory (`psn-api` itd.).
- Katalogi wspierające: `docs/`, `scripts/` (bramki sync), `e2e/` (Playwright), `mockups/`, `test-results/`.

**Uruchomienie / skrypty (root `package.json`):** `lint`=`biome check .`, `check`=`biome check --write .`, `typecheck`=`pnpm -r run typecheck`, `test`=`vitest run`, `test:e2e`=`playwright test`, bramki `docs:check`/`schema:check`/`env:check`/`sync:check`. Dashboard dev: `next dev -p 3001` (port z `dashboard/package.json`).

**Higiena repo (wstępnie):**
- **Tagi git przestarzałe:** istnieją tylko `v0.307.0` i `v0.535.0`, mimo że CHANGELOG jest na `v0.602.0` — brak tagów dla ~67 wydań. (Higiena — Niski.)
- Lokalna gałąź `feat/role-dropdowns` — do weryfikacji czy zmergowana/martwa (Faza 1).
- Bezpieczeństwo zależności: `pnpm-workspace.yaml` ma świadome `overrides` (postcss→8.5.15, undici→6.27.0) z komentarzami o GHSA — dobry sygnał higieny (zweryfikować `pnpm audit` w Fazie 1).

### Faza 1 — Kod i repozytorium ✅

**Jakość kodu (zweryfikowane grepem, całe repo bez `.next/`):**
- `: any` — **7** wystąpień (akceptowalnie mało). `// TODO`/`FIXME`/`HACK` — **0**. `@ts-ignore`/`@ts-expect-error` — **0**. `biome-ignore` — **8** (świadome). Pozytywne sygnały.
- **`console.*` w `bot/src` — 128 wystąpień, ale rozkład: 29 plików w `bot/src/setup/`** (skrypty provisioningowe empire/ghost/eforge) **+ 1 w `bot/src/lib/`**. Rdzeń bota (commands/community/…) czysty — sweep `#410` dotyczył rdzenia; skrypty setup (osobny tor) używają `console`. Realny drobiazg: 1 zabłąkany `console` w `lib/`. (Niski.)

**🔴 Bramka lintu (`pnpm check` / `lint`) jest CZERWONA:** `pnpm exec biome check` → **„Found 12 errors, Found 11 warnings"**. Wszystkie 12 błędów to reguła **`lint/complexity/useLiteralKeys`** (styl: `obj['k']` zamiast `obj.k`), w plikach rdzenia bota: `automod.mts:80`, `cloud/alerts.mts:10` (×2), `commands/{ticket,reactionpanel,rank,profile,prestige,mod,donate,backlog,customCommands}.mts`, `analytics/{seasons,ecoSeason,digest}.mts`, `commands/{aihelp,aidigest}.mts`. To **styl, nie błąd logiczny**, ale gate jakości nie przechodzi. (Średni — dług techniczny, gate lintu nie zielony.)

**Zależności:**
- **`pnpm audit` → „No known vulnerabilities found"** ✅ (exit 0). `overrides` w `pnpm-workspace.yaml` (postcss, undici) skutecznie domykają znane GHSA. Dobry stan.

**Stan repo / gałęzie / tagi:**
- Gałąź **`feat/role-dropdowns` jest ZMERGOWANA do `main`** (`git branch --merged main`) → **martwa, do usunięcia**. (Niski.)
- **Tagi git przestarzałe** — tylko `v0.307.0`, `v0.535.0` przy repo na `v0.602.0` (brak ~67 tagów wydań). (Niski.)
- `git status` — czysto (poza tworzonym `AUDIT_REPORT.md`).

**CHANGELOG:** top = `## [0.602.0]`, zgodny z badge/markerami (bramka `docs:check` przechodzi — patrz Faza 4). Aktualny.

### Faza 2 — Trasy, weryfikacja wizualna, macierz ✅ (statycznie)

**Model auth (zweryfikowany — POZYTYW):** `dashboard/proxy.ts` (middleware Next 16, `matcher` obejmuje wszystko poza `_next/*` i faviconem — **łącznie z `/api`**) blokuje centralnie: dla ścieżek spoza `isOpen()` bez ważnej sesji (`verifySession(ebot_session)`) → redirect `/login` (`proxy.ts:74‑79`); rola `viewer` → 403 na mutacjach `/api/*` (`proxy.ts:92‑94`); `/api/panel-staff` i `/api/config/import` → tylko admin (`proxy.ts:88‑90`). Dlatego **96/115 tras API bez inline‑checku jest i tak chronione** przez middleware; 19/115 dubluje bramkę inline (wrażliwe: `dev/reset`, `dev/premium`, `billing/*`). Otwarte świadomie: `/`, `/login`, `/wiki`, `/p/*`, webhooki (`/api/auth|img|twitch|kofi|hook|sentry|health`, `/api/bot-status`). **CSP per‑request z nonce + `strict-dynamic`** (anty‑XSS, `proxy.ts:33‑46`). To dobra, scentralizowana architektura.

**Trasy (55 stron, statycznie z FS):** publiczne — `/`, `/login`, `/wiki`, `/p/{about,appeal,clans,leaderboard,polityka-prywatnosci,regulamin,status,u/[id]}`; panel (auth) — pozostałe ~44 (`/ai /appearance /applications /audit /automations /birthdays /clans /commands /counters /creator /custom-commands /diagnostics /donations /eco /economy /engagement /gaming /integrations /leaderboard /levels /library /live /logging /marketplace(+/review,/submit) /moderation /modmail /modules /notifications /onboarding /premium /profile /responder /roles /scheduled /security /settings /setup /stats /suggestions /tickets /welcome /wishlist`).

**Weryfikacja statyczna (zamiast wizualnej — patrz „Luki w audycie"):**
- ✅ **Wszystkie 43 hrefy w `nav-items.ts` mają istniejący `page.tsx`** — zero martwych linków w menu.
- ✅ **Brak stron‑atrap** — grep `coming soon|wkrótce|placeholder|w budowie|not implemented|mock` w `page.tsx` = 0 realnych trafień (jedyne to i18n‑klucz `ui.diagnostics.verdictTodo`, czyli werdykt „do zrobienia", nie atrapa).
- ✅ **`next build` przechodzi** (zweryfikowane w tej sesji, exit 0) → wszystkie 55 tras się kompilują/renderują server‑side.

**Macierz rozbieżności** — zbudowana statycznie (nav + strona + wpięta akcja/API + usługa bota). Pełna macierz w sekcji 4. Wniosek: **brak wykrytych „guzik bez akcji"/„akcja bez guzika"** na poziomie routingu; rozbieżności ograniczone do driftu dokumentacji (Faza 4), nie do brakujących wpięć.

### Faza 3 — Usługi backendowe ✅

**Supabase (🔴 kluczowe ustalenie — RLS):**
- Schemat: **48 tabel** w `_ALL.sql`. **Tylko 36 ma `enable row level security`; 12 NIE MA:** `user_levels, tickets, ai_usage, reminders, giveaways, economy_shop, birthdays, guilds, guild_members, plugins, guild_plugins, plugin_config` (dowód: `dashboard/scripts/_ALL.sql`, grep `enable row level security` = 36 vs 48 `create table`).
- Supabase dla tabel tworzonych surowym SQL ma **RLS wyłączone domyślnie**. Empiryczna weryfikacja **publicznym kluczem anon** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, trafia do bundla klienta): `GET /rest/v1/{guilds,tickets,user_levels,ai_usage,economy_shop,guild_members,birthdays}` → **HTTP 200** (dostęp przyznany, nie 401/403). Tabele są teraz **puste** (bot trzyma dane w SQLite), więc *dziś* nic nie wycieka — ale gdy pojawią się dane, publiczny anon key może je **czytać i pisać**. `guilds` trzyma `stripe_customer_id/stripe_sub_id/premium_*`; `tickets`/`birthdays`/`user_levels`/`guild_members` to dane osobowe. **→ Krytyczny** (zgodnie z definicją audytu: „tabela z danymi bez RLS = Krytyczny"; tu: strukturalnie bez RLS + publicznie osiągalna).
- 36 tabel z RLS ma **0 `create policy`** → dla anon/authenticated to **deny‑all**, dostęp tylko przez `service_role` (serwer). To bezpieczne (panel czyta/pisze `service_role` po stronie serwera).
- **`service_role` nie wycieka do klienta:** jedyne trafienie (`dashboard/lib/integrations.ts:61`) to *serwerowy* fallback `SUPABASE_SERVICE_ROLE_KEY || NEXT_PUBLIC_SUPABASE_ANON_KEY` (wybór klucza w kodzie serwera, nie ekspozycja). ✅
- Rekomendacja (nie wykonuję — to mutacja): `alter table <12 tabel> enable row level security;` (bez polityk = deny‑all dla anon, serwer działa dalej przez `service_role`). Domyka dziurę bez zmiany działania aplikacji.

**Vercel (zweryfikowane przez API, read‑only):**
- Projekt E‑BOT = **`e-bot-dc`** (`prj_5C2kvLWDQyABMNduzlIkHFzn0QMp`, scope personal). **33 zmienne env**. Ostatni deploy produkcyjny **`22ca666` → READY** ✅.
- **🔴 CI (GitHub Actions) stoi:** ostatnie realne runy `ci.yml` z **2026‑06‑15** (2 tyg. temu; `failure` na gałęziach Dependabota + run na `main` utknął `queued`). **0 udanych runów `ci.yml` w ostatnich 40.** Bramka CI faktycznie nie działa → regresje nie są wychwytywane automatycznie (root‑cause: najpewniej blokada Actions/billingu konta — po stronie właściciela; deploy Vercela jest niezależny i działa). (Średni.)

**Upstash / cache / kolejki:** **nieużywane w E‑BOT** (brak `@upstash`/`redis` w `dashboard`/`bot`; Upstash jest w osobnym projekcie `ghost-empire-web`). Rate‑limiting: własny `dashboard/lib/rateLimit.ts` (sliding‑window) na publicznych sinkach (`/api/sentry`, `/api/hook`, `/api/bot/profile`). **Ograniczenie znane i udokumentowane w kodzie** (`rateLimit.ts:1‑3`): stan w pamięci = **per‑instancja serverless**, więc to pierwsza warstwa anty‑flood, nie twardy globalny limit (pełna ochrona wymagałaby Redis/edge). (Niski — świadomy, udokumentowany kompromis.)

### Faza 4 — Dokumentacja i higiena ✅

- **README** kompletne i dobrze zorganizowane (sekcje: O projekcie, Moduły, Architektura, Stack, Szybki start, Funkcje, Roadmapa, Biblioteka w liczbach, Changelog, Struktura, Bezpieczeństwo, Dokumentacja). Wersja/badge zsynchronizowane (bramka `docs:check` = exit 0 → README↔CHANGELOG↔PHASES↔ROADMAP spójne na `v0.602.0`).
- **Drift README ↔ realia (Średni):** „🚀 Szybki start" każe `cd dashboard && npm install && npm run dev` oraz `cd bot && npm install` (`README.md:115,118`), a projekt to **monorepo pnpm** (`packageManager: pnpm@11.5.2`, `pnpm-workspace.yaml` z `overrides` na postcss/undici). `npm install` w podpakiecie **ignoruje workspace i overrides** → ryzyko wciągnięcia załatanych już podatności. Powinno być `pnpm install` w root. (Średni — instrukcja prowadzi do gorszego/niespójnego stanu zależności.)
- Dokumentacja rozszerzona (`docs/PHASES.md`, `docs/ROADMAP.md`, `docs/HARDENING-PROD.md`, `docs/TOPGG.md`) obecna; markery SYNC pilnowane bramką. Model danych opisany w `dashboard/scripts/*.sql`. Dobrze.

### Faza 5 — Bugi i testy ✅

- **Testy: `pnpm test` (vitest) → 161 plików / 1223 testy, WSZYSTKIE zielone, exit 0.** Bardzo dobre pokrycie ilościowe czystych rdzeni (i18n parity ×14, ekonomia atomowa, automod, rate‑limit, `resolveEmojiSource`, itd.).
- **Coverage nieskonfigurowane** — brak `coverage` w konfigach vitest → nie da się podać % pokrycia (jakość ≠ ilość). (Niski / Luka.)
- **Bugi z dowodem:** patrz sekcja „Bugi do odtworzenia". Najpoważniejszy to **odtwarzalny wyciek przez brak RLS** (Faza 3). Testy jednostkowe + `tsc` (×4) + `next build` łapią błędy logiczne/typów, więc odtwarzalne bugi funkcjonalne w rdzeniu są nieliczne; realne ryzyko leży w **konfiguracji** (RLS, CI, gate lintu), nie w logice.

### Faza 6 — Usprawnienia ✅ (analiza — patrz sekcja 7)

---

## 4. Macierz rozbieżności dashboard ↔ kod

Zbudowana **statycznie** (nav + `page.tsx` + wpięta akcja/API + usługa bota); weryfikacja wizualna paneli niemożliwa (OAuth — patrz „Luki"). Reprezentatywne obszary:

| Funkcja | W UI? | W kodzie? | Aktualna? | Uwagi |
|---|---|---|---|---|
| Automoderacja | ✅ `/moderation` | ✅ `bot/src/automod.mts` + API | ✅ | — |
| Bezpieczeństwo / anti‑nuke | ✅ `/security` | ✅ `antinuke`, `raidmode`, `panic` | ✅ | — |
| Levele / XP | ✅ `/levels` | ✅ `leveling` + `user_levels` | ✅ | tabela `user_levels` **bez RLS** (#1) |
| Ekonomia | ✅ `/eco`,`/economy` | ✅ RPC `economy_*` (atomowe) | ✅ | `economy_shop` **bez RLS** (#1) |
| Tickety | ✅ `/tickets` | ✅ `tickets/` + `tickets` | ✅ | tabela `tickets` **bez RLS** (#1) |
| Powitania / farewell | ✅ `/welcome` | ✅ `welcome`, `farewell`, `joindm` | ✅ | — |
| Role / reaction‑roles | ✅ `/roles` | ✅ `reaction-roles.mts` (exclusive) | ✅ | — |
| Premium / billing | ✅ `/premium`,`/settings`,`/diagnostics` | ✅ `billing.ts` + webhook Stripe | ✅ | LIVE, wpięte w tej sesji |
| Marketplace / pluginy | ✅ `/marketplace` | ✅ `canUsePlugin` + `plugins*` | ✅ | `plugins/plugin_config/guild_plugins` **bez RLS** (#1) |
| Gaming feed / patch‑notes | ✅ `/gaming` | ✅ `gaming/` + poller | ✅ | — |
| Statystyki | ✅ `/stats` | ✅ `analytics/` | ✅ | — |
| `/emoji` (nowa komenda) | ➖ brak panelu (komenda) · ✅ w `/wiki` | ✅ `commands/emoji.mts` | ⚠️ | wymaga `deploy-commands`, by pojawiła się na Discordzie |

**Wniosek:** brak „guzika bez akcji"/„akcji bez guzika" na poziomie routingu (43/43 hrefy nav mają stronę, brak atrap). Jedyne „⚠️" to `/emoji` — kod gotowy, ale komenda niezarejestrowana w Discordzie do czasu `deploy-commands`.

## 5. Stan usług

**Vercel** — projekt `e-bot-dc` (personal), **33 zmienne env**, ostatni deploy prod `22ca666` → **READY**. Komplet kluczy rdzenia (auth, Supabase, Discord OAuth) + Stripe (LIVE) + AI/integracje. **CI (Actions) stoi** od 2026‑06‑15 (0 udanych runów — wpis #3); deploy Vercela działa niezależnie.

**Supabase** — 48 tabel (schemat kompletny), RPC `economy_*`/`dev_reset_*` obecne. **🔴 12 tabel bez RLS** (wpis #1) — jedyne krytyczne ustalenie audytu. 36 tabel z RLS ma 0 polityk → deny‑all dla `anon`, dostęp tylko `service_role` (bezpiecznie). `service_role` nieujawniony w kliencie. `NEXT_PUBLIC_SUPABASE_ANON_KEY` to nowy format `sb_pub…` (publiczny z natury).

**Upstash** — **nieużywany** w E‑BOT (jest w osobnym projekcie `ghost-empire-web`). Rate‑limiting: własny in‑memory `rateLimit.ts` (per‑instancja — wpis #8).

**Inne** — Stripe (LIVE, webhook `we_1To0vM…` enabled, 4 eventy). Bot host = **Railway** (nieaudytowane — patrz „Luki"). Sentry (`captureError`, env‑gated). Ko‑fi/top.gg webhooki (auth własny: token/HMAC).

## 6. Bugi do odtworzenia

1. **[Krytyczny] Publiczny odczyt tabel bez RLS.** Kroki: otwórz panel → wyciągnij `NEXT_PUBLIC_SUPABASE_ANON_KEY` z bundla JS (jest publiczny) → `GET {SUPABASE_URL}/rest/v1/guilds?select=*` z nagłówkiem `apikey: <anon>`. **Oczekiwane po naprawie:** 401/`permission denied`. **Stan obecny:** HTTP 200 (dziś pusto, bo tabele puste; po zapisie danych — pełny odczyt `guilds`/`tickets`/`user_levels`…). Dowód: `_ALL.sql` (brak `enable RLS` dla 12 tabel) + test empiryczny.
2. **[Średni] `pnpm check` nie przechodzi.** Kroki: `pnpm exec biome check`. **Oczekiwane:** exit 0. **Obecne:** „Found 12 errors" (`useLiteralKeys`). Napraw: `biome check --write`.
3. **[Średni] Instrukcja README psuje zależności.** Kroki: wg README `cd dashboard && npm install`. **Efekt:** tworzy `package-lock.json`, ignoruje `pnpm-workspace.yaml` `overrides` → transitive `postcss`/`undici` mogą wrócić do wersji z GHSA. **Oczekiwane:** `pnpm install` w root.

## 7. Top usprawnień (posortowane wg korzyść/koszt)

1. **Włącz RLS na 12 tabelach** — bezpieczeństwo, koszt **S**. `alter table … enable row level security;` (bez polityk; serwer działa przez `service_role`).
2. **Napraw gate lintu** (`biome check --write`) — **S**. Przywraca zieloną bramkę jakości.
3. **README: `npm` → `pnpm`** w „Szybki start" — **S**. Chroni `overrides`.
4. **Usuń martwą gałąź + otaguj wydania** (`feat/role-dropdowns`, tagi) — **S**. Higiena.
5. **Dodaj pomiar coverage** (`vitest --coverage` + próg) — **S**. Ilość testów jest, brakuje metryki jakości.
6. **Test parzystości `landingI18n`** (landing/login/wiki ×14) — **S**. Dziś `panelI18n` ma test parzystości, `landingI18n` **nie** (ryzyko cichego rozjazdu kluczy; kolejność bloków lokali w tym pliku bywa niekanoniczna).
7. **Przywróć CI** (billing/Actions konta) — korzyść **wysoka**, koszt **M** (zależny od konta). Bez tego brak automatycznej bramki na push.
8. **Stray `console` → logger** w `bot/src/lib/` — **S**. Spójność logowania.
9. **Redis/edge rate‑limit** dla publicznych sinków, gdy wejdą pod obciążenie — **M**. Dziś in‑memory (per‑instancja).
10. **Dokończ migrację `fetch → Server Actions`** oportunistycznie (przy dotykaniu plików) — **M**. Wzorzec ustawiony (#671–672); reszta ~93 tras to niewidoczny dla usera dług.

## 8. Higiena repo

- **Gałęzie:** `feat/role-dropdowns` — **zmergowana, do usunięcia**. `main` czysta.
- **Tagi:** tylko `v0.307.0`, `v0.535.0` — **przestarzałe** względem `v0.602.0`. Rozważ tagowanie wydań lub świadome porzucenie.
- **CHANGELOG:** aktualny (`v0.602.0`), egzekwowany bramką `docs:check` (README/PHASES/ROADMAP zsynchronizowane). ✅
- **README:** kompletne, ale drift `npm` vs `pnpm` (#4).
- **Backlog:** „źródłem prawdy" jest `docs/PHASES.md`/`ROADMAP.md` (aktualne, pod bramką). ✅

## 9. Luki w audycie (czego NIE zweryfikowano)

- **Weryfikacja wizualna paneli** — niewykonana. Powód: panel jest **OAuth‑gated** (middleware → `/login` bez sesji Discord), a zasada audytu („jedyny tworzony plik to `AUDIT_REPORT.md`") uniemożliwia założenie `.claude/launch.json` pod preview. Zastąpione: `next build` (kompiluje 55 tras, exit 0) + analiza statyczna (nav→strona, brak atrap).
- **RLS — tylko odczyt.** Potwierdzono osiągalność `anon` (HTTP 200) + brak `enable RLS` w `_ALL.sql`; **zapisu nie testowano** (mutacja zakazana). Brak bezpośredniego dostępu do Postgresa (tylko PostgREST/`service_role`) — stan RLS wywnioskowany ze schematu + domyślnych Supabase + 200, nie z `pg_class.relrowsecurity`.
- **Coverage %** — niemierzalne (brak konfiguracji vitest coverage).
- **Railway (host bota)** — nieaudytowane (brak tokenu Railway w torze; stan deployu/logów bota niezweryfikowany).
- **`web/` i `ingest/`** — pokryte pobieżnie (fokus: `bot` + `dashboard`, gdzie leży ryzyko).
- **Token `re_…` z treści zlecenia** — w tekście zadania pojawił się ciąg o wzorcu klucza API (prefiks `re_`, format Resend). **Wartości nie reprodukuję.** `git grep` wzorców sekretów w repo = **0 trafień**, `.env*` nieśledzone → w kodzie/historii śledzonej go **nie ma**. Jeśli to realny klucz — **rotować** (nie występuje w tym repo).

## 10. Metodyka (co realnie uruchomiono)

Wszystkie komendy **read‑only**; jedyny utworzony plik to `AUDIT_REPORT.md`. Skrypty pomocnicze pisane do scratchpada (poza repo).

- **Struktura/stack:** `cat package.json pnpm-workspace.yaml`, `node -v`/`pnpm -v`, `find dashboard/app -name page.tsx|route.ts | wc`, `ls bot/src/*/`, odczyt `dashboard/package.json`, `bot/package.json`, `next.config.mjs`.
- **Kod/repo:** grep `: any`/`TODO`/`@ts-ignore`/`biome-ignore`/`console.*` (z rozkładem po katalogach), `git branch --merged main`, `git tag`, `git status`, **`pnpm exec biome check`** (12 err/11 warn, reguła `useLiteralKeys`), **`pnpm audit`** (0 podatności).
- **Trasy/auth:** lista `page.tsx`, odczyt `dashboard/proxy.ts` (middleware — gating + CSP), zliczenie tras API z inline‑checkiem sesji, weryfikacja nav→strona (node), grep atrap.
- **Supabase:** analiza `_ALL.sql` (node: `create table` vs `enable row level security` → 36/48; `create policy`=0); **empiryczny test PostgREST kluczem `anon`** (`GET /rest/v1/<tabela>` → HTTP 200 na 7 tabelach bez RLS); grep `service_role` w kliencie.
- **Vercel:** API v6/v9 (token z `.env`) — ostatni deploy prod (`22ca666` READY), liczba env (33); `gh run list --workflow=ci.yml` (CI stoi, 0 udanych/40).
- **Testy:** **`pnpm test`** (vitest) → 161 plików / **1223 testy**, exit 0. Odczyt `dashboard/lib/rateLimit.ts`.
- **Sekrety:** `git ls-files` (`.env*` nieśledzone), `git grep` wzorców (`sk_/re_/AKIA/ghp_/xox/AIza/BEGIN`) = 0.
- **Docs:** `pnpm sync:check` (wcześniej w sesji — exit 0), przegląd `README.md` (sekcje + „Szybki start").

---
_Audyt zakończony. Wszystkie fazy 0–6 wykonane (weryfikacja wizualna zastąpiona statyczną — patrz „Luki"). Bez zmian w kodzie/produkcji — oczekiwanie na decyzję, co naprawić._
