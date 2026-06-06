<div align="center">

# 📜 CHANGELOG &nbsp;·&nbsp; E‑BOT

![Updaty](https://img.shields.io/badge/updaty-41-E50914?style=for-the-badge&labelColor=0a0a0a)
![Wersja](https://img.shields.io/badge/wersja-0.11.1-E50914?style=for-the-badge&labelColor=0a0a0a)

</div>

Format wg [Keep a Changelog](https://keepachangelog.com) + **numeracja updatów** `[#NNN]`.
Wersjonowanie: [SemVer](https://semver.org). Najnowsze na górze.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## [0.11.1] — Faza 6 / B2: komendy moderacji + historia spraw

- `[#041]` 🔨 **Komendy moderacji** `/mod warn` · `/mod timeout` · `/mod clear` · `/mod warnings` (widoczne tylko dla moderatorów — `setDefaultMemberPermissions`). Każda akcja: zapis do Supabase `mod_cases` + wpis na mod‑log (kanał z `automod_config`) + DM do ukaranego (warn). **Historia spraw** w panelu `/moderation` (czyta `mod_cases`). Nowa tabela: `dashboard/scripts/mod-cases-schema.sql` (uruchom raz w Supabase).

## [0.11.0] — Faza 6 / B1: powitania + automod

- `[#040]` 🚪🛡️ **Powitania + autorole** (panel `/welcome`) oraz **Automod** (panel `/moderation`: anti‑invite / anti‑link / limit wzmianek / anty‑spam + mod‑log) — bot listenery (`guildMemberAdd`, `messageCreate`), config z panelu (settings, bez nowej tabeli). Intencje `MessageContent` + `GuildMembers` przeniesione do bazowych (automod/powitania niezależne od ekonomii).

## [0.10.0] — Faza 5: statystyki + Twitch EventSub

- `[#039]` 🔔 **Twitch EventSub** — webhook `/api/twitch/eventsub` (challenge + weryfikacja HMAC) → **natychmiastowe** ogłoszenie live na Discordzie (zamiast pollingu 60 s, bot token + notify channel, dedup w settings); skrypt `scripts/eventsub-setup.mts` rejestruje subskrypcję `stream.online`; `proxy.ts` przepuszcza `/api/twitch`. Aby uniknąć dubli — polling Twitch wyłączony (`notify_enabled_twitch=false`).
- `[#038]` 📊 **Statystyki** — strona `/stats`: zużycie AI (14 dni, wykres), top XP, tickety wg statusu, biblioteka wg platformy (wykresy CSS/SVG, bez ciężkiej zależności).

## [0.9.1] — Reaction roles 🧩

- `[#037]` 🧩 **Reaction roles**: panel `/roles` (mapowania wiadomość→emoji→rola, zapis do `settings`) + bot (listener `MessageReactionAdd/Remove`, intencja `GuildMessageReactions` + partials) nadaje rolę po reakcji i odbiera po jej usunięciu. Bez nowej tabeli — config sterowany z panelu.

## [0.9.0] — Faza 4 komplet: AI + tickety dwukierunkowo

- `[#036]` 🔁 **Tickety dwukierunkowo**: zamykanie z panelu (`/tickets` → przycisk *Zamknij* → `/api/tickets/close`); bot (`ticket-sync`, co 60 s) archiwizuje + blokuje wątek zamknięty z panelu. Pełna pętla Discord ↔ panel.
- `[#035]` 🤖 **Komendy AI**: `/ai <prompt>` (DeepSeek `deepseek-chat` / OpenAI `gpt-4o-mini`) z **twardym dziennym limitem kosztów** per użytkownik (sprawdzany w `ai_usage` PRZED wywołaniem); panel `/ai` (model, limity zapytań/tokenów + statystyki zużycia dziś). Klucze w `.env` bota.

## [0.8.0] — Faza 4 działa end-to-end + link-status

> Bot ↔ panel ↔ Supabase ↔ GH0ST spięte. **⚠️ Wymaga jednorazowo**: uruchom `dashboard/scripts/faza4-schema.sql` w Supabase → SQL Editor (tabele `user_levels`/`tickets` — service key nie tworzy tabel; do tego czasu kod działa, ale bez zapisu/odczytu danych).

- `[#034]` 🔗 **link-status**: endpoint `/api/internal/link-status` w repo `ghost-empire` (Bearer BOT_SECRET → `{linked, username, tokens}`); panel `/profile` pokazuje realny status powiązania (fallback do instrukcji `/link`).
- `[#033]` 🏆🎟️ **Faza 4 — bot**: leveling (XP za czat/voice, awanse, role‑nagrody → `user_levels`), `/ticket otwórz/zamknij` (prywatne wątki → `tickets`); generyczny CRUD Supabase w bocie; intencje `GuildMessages`+`GuildVoiceStates`; `/ticket` zarejestrowany. Config sterowany z panelu (przez settings‑sync).

## [0.7.3] — Next 16: `proxy` + fix gatingu assetów

- `[#032]` 🔁 **`middleware.ts` → `proxy.ts`** (konwencja Next 16 — koniec ostrzeżenia deprecacji; gating zweryfikowany lokalnie: `/login` 200, chronione trasy 307, statyki 200). Zawiera fix: proxy/middleware przepuszcza pliki statyczne (logo/baner/favicon działają dla niezalogowanych).

## [0.7.2] — Branding GH0ST wszędzie 💀

- `[#031]` 💀 **Branding rozszerzony**: avatar bota Discord ustawiony na **GHOST77** (Discord API); logo czaszki + **favicon** w aplikacji **web** (GameVault — TopNav); logo na górze **README**; **baner** jako tło hero na stronie **Przegląd**. Przy okazji: usunięto przestarzały klucz `eslint` z `next.config.mjs` (Next 16 usunął `next lint` — lintujemy Biome).

## [0.7.1] — Rebrand: logo GH0ST 💀

- `[#030]` 💀 **Branding GH0ST**: logotyp (czaszka, czerwone oczy) jako znak marki w **logowaniu** (+ baner jako tło) i **sidebarze**; **favicon** (`app/icon.png`). Assety marki w `dashboard/public/` (ghost-skull.png, ghost-banner.jpg). Spójne z motywem (#E50914 + czerń).

## [0.7.0] — Faza 4 (panel): leveling + tickety

> Panel‑side Fazy 4 — konfiguracja i podgląd. Logika bota (naliczanie XP, obsługa ticketów) = strona bota / sesja 2.

- `[#029]` 🏆🎟️ **Faza 4 — panel**: strony `/levels` (config XP + role‑nagrody + ranking top 50) i `/tickets` (config + lista zgłoszeń + statystyki); API `/api/leveling` + `/api/tickets` z walidacją **Zod**; warstwa `lib/faza4.ts` (config w tabeli `settings`, dane z nowych tabel z fallbackiem do pustych); migracja `scripts/faza4-schema.sql` (`user_levels`/`tickets`/`ticket_messages`/`ai_usage` + RLS) do uruchomienia w Supabase; pozycje menu **Levele**/**Tickety**. Bez ruszania `bot/`.

## [0.6.1] — Hosting bota + plan Fazy 4

- `[#028]` 🛰️ **Hosting 24/7** (`bot/Dockerfile` + `docs/HOSTING.md`: Railway / Fly.io / pm2) oraz 🧭 **plan Fazy 4** (`docs/FAZA-4-PLAN.md`: tickety / leveling / AI — architektura, model danych Supabase, podział bot↔panel, kolejność).

## [0.6.0] — Modernizacja stacku (najnowsze wersje + DX)

> Cały frontend na najnowszych wersjach; nowe narzędzia DX. Robione fazami A–F, build zielony po każdej.

- `[#027]` 🚀 **Modernizacja stacku**: Next 14→**16** (Turbopack) + React 18→**19** + **React Compiler 1.0**; Tailwind 3→**4** (CSS-first `@theme`, koniec autoprefixer); TypeScript 5→**6**; framer-motion→**motion 12**; lucide **1.x**, @types/node **25**, supabase-js **2.107**, discord.js **14.26**, psn-api **2.18**. Monorepo na **pnpm workspaces**; **Biome** (lint+format); **Zod** (walidacja wejść API: presence/profile/antinuke). CI: Node **26** + pnpm + Biome + typecheck + build.

## [0.5.0] — Faza 3: integracja bot↔chmura

> Bot i panel mówią jednym głosem — przez Supabase. Koniec „config sync gap".

- `[#026]` 🔌 **Bot ↔ chmura (Faza 3)**: bot pisze puls `bot_status` do Supabase (panel pokazuje status na żywo + offline przy zamknięciu), stosuje `bot_presence` z panelu przez `setPresence`, oraz synchronizuje `settings` Supabase → lokalny SQLite (anti‑nuke whitelist + powiadomienia sterowane z panelu działają na bocie). Zmiany z bota (`/antinuke`) wracają do panelu (mirror‑up). Klient Supabase REST przez natywny `fetch` — zero nowych zależności.

## [0.4.1] — Wiki projektu + utwardzenie repo (hardening)

> Pełna Wiki na GitHubie oraz realne zabezpieczenia repozytorium włączone przez API.

- `[#025]` 🛡️ **Hardening repo (zastosowany)**: tagi/topics (16), opis + homepage, alerty Dependabot + auto‑fix bezpieczeństwa, **branch protection** na `main` (blokada force‑push i usunięcia), szablony **PR/Issue** + `config.yml`. *(secret‑scanning wymaga GitHub Advanced Security — niedostępne w planie; zastępczo `git grep` + `.gitignore` + GitGuardian.)*
- `[#024]` 📖 **Wiki projektu (live)** — strony Home, Getting Started, Dashboard, Commands, Security, FAQ + własny pasek boczny i stopka; wersjonowana kopia w `docs/wiki/`.

## [0.4.0] — Pełny panel GH0ST + przeprojektowane repo

> Dashboard rozbudowany do kompletnego panelu w stylu GH0ST EMPIRE; repo udokumentowane „od zera".

- `[#023]` 📚 **Repo od zera (dokumentacja)**: README Netflix (mermaid/grafy), CHANGELOG numerowany, ROADMAP, ARCHITECTURE, PHASES, LICENSE (proprietary), `.gitattributes`, CI (Actions), CodeQL, Dependabot (config), CODEOWNERS, SECURITY.md.
- `[#022]` 🎨 Status/aktywność bota (presence config) + **motyw/kolor akcentu** (themeable `--accent-rgb` + przełącznik).
- `[#021]` 🪪 **Personalizacja bota** — zmiana nazwy i avatara (Discord `PATCH /users/@me`) w Ustawieniach.
- `[#020]` ➕ Przycisk **„Zaproś bota"** (pasek + hero) → OAuth invite z env `client_id` + uprawnienia.
- `[#019]` 🟢 Status bota czyta **heartbeat z Supabase** (`bot_status`) + helper `getRawSetting`.
- `[#018]` 💰 Strona **Ekonomia GH0ST** — stawki GT z publicznego `/api/bot/config`.
- `[#017]` 🔴 Auto‑odświeżanie **/live** (30 s) + sygnał (dźwięk/tytuł) gdy ktoś wejdzie live; strony `loading`/`error`/`404` w stylu GH0ST.
- `[#016]` 📡 Strona **/live** — status streamów Twitch/Kick/YT/Rumble + dynamiczny status bota w pasku.
- `[#015]` 📱 **Responsywność** (mobilne menu hamburger, scroll tabel) + strona **/profile** (Discord + link GH0ST).
- `[#014]` 🔎 **Filtry biblioteki** (platforma/gatunek/szukajka) + panele GH0ST wokół Powiadomień/Anti‑Nuke.
- `[#013]` 🧱 Spójny look GH0ST na wszystkich stronach (UPPERCASE nagłówki z ikoną, panele z poświatą).

## [0.3.0] — Look GH0ST + chmura live

- `[#012]` 🤝 **(bot) Ekonomia GH0ST EMPIRE** na Discordzie — GT za czat/voice + `/portal` *(sesja bota)*.
- `[#011]` 🦸 Hero profilu (avatar E‑BOT + staty + pasek), sekcje GH0ST, gęstsza siatka.
- `[#010]` 🗜️ Gęstsza siatka gier (mniejsze okładki, do 10/rząd).
- `[#009]` 🤏 Minimalistyczny restyl (mniejsze ikony/liczby, niższy pasek, subtelniejsze poświaty).
- `[#008]` 🔗 Komenda **/link** (integracja GH0ST) + przeprojektowana strona logowania (look GH0ST).
- `[#005]` 🎨 Restyl pod **GH0ST EMPIRE** (czcionki Oswald/Montserrat, czerwone poświaty, logo E‑BOT).

## [0.2.0] — Bezpieczeństwo, OAuth, fundament chmury

- `[#007]` 🔓 Rozszerzone uprawnienia w linku zaproszenia (anti‑nuke: audit‑log/ban/kick/timeout/role).
- `[#006]` 🔁 Migracja na nową aplikację Discord (`1512758748761030677`).
- `[#004]` 🛡️ **Moduł Anti‑Nuke** (detekcja audit‑log + progi + kary + `/antinuke`; panel Bezpieczeństwo).
- `[#003]` 🔐 **Discord OAuth** do panelu (sesja HMAC, middleware, `/login`, wylogowanie) + `sync:cloud`.

## [0.1.0] — Inicjał

- `[#002]` ▲ Preset Next.js dla Vercel (`vercel.json`).
- `[#001]` 🌱 **Initial** — ingest (Steam/PSN/IGDB), web „Netflix dla gier", bot discord.js v14, szkielet dashboardu (Vercel + Supabase).

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

<div align="center"><sub>Każdy update = jeden numer <code>[#NNN]</code>. Dokumentacja aktualizowana na bieżąco.</sub></div>
