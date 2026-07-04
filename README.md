<!-- SYNC: v0.615.0 · #685 · 2026-07-04 — utrzymywane przez `pnpm docs:check` (badge wersji + blurb „Najnowsze") -->
<!-- ╔══════════════════════════════════════════════════════════════════╗ -->
<!-- ║                            E - B O T                              ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->

<div align="center">

<img src="dashboard/public/ghost-skull.png" width="120" alt="E-Forge" />

# 🎬 E‑BOT &nbsp;·&nbsp; E-Forge

### ⟣ Discordowe ramię E-Forge · biblioteka gier „Netflix" · live · bezpieczeństwo ⟣

<br/>

![Wersja](https://img.shields.io/badge/wersja-0.615.0-E50914?style=for-the-badge&labelColor=0a0a0a)
![Status](https://img.shields.io/badge/status-aktywny-E50914?style=for-the-badge&labelColor=0a0a0a)
![Licencja](https://img.shields.io/badge/licencja-PROPRIETARY-E50914?style=for-the-badge&labelColor=0a0a0a)
![Repo](https://img.shields.io/badge/repo-prywatne-E50914?style=for-the-badge&labelColor=0a0a0a)

![Dashboard](https://img.shields.io/badge/⬤_DASHBOARD_LIVE-e--bot--dc.vercel.app-E50914?style=for-the-badge&labelColor=0a0a0a)

<br/>

**[ 🖥️ Dashboard »](https://e-bot-dc.vercel.app)** &nbsp;·&nbsp;
**[ 📖 Wiki »](../../wiki)** &nbsp;·&nbsp;
**[ 🗺️ Roadmapa »](docs/ROADMAP.md)** &nbsp;·&nbsp;
**[ 📜 Changelog »](CHANGELOG.md)** &nbsp;·&nbsp;
**[ 🧠 Architektura »](docs/ARCHITECTURE.md)** &nbsp;·&nbsp;
**[ 🔐 Bezpieczeństwo »](.github/SECURITY.md)**

<br/>

[![E-Bot na top.gg](https://top.gg/api/widget/1512758748761030677.svg)](https://top.gg/bot/1512758748761030677)

</div>

<br/>

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ✨ O projekcie

**E‑Bot** to wielomodułowy ekosystem twórcy: bot Discord (discord.js v14), agregator
biblioteki gier w stylu **Netflix** (Steam · PlayStation · GOG → IGDB) oraz **panel
sterowania** (Next.js, hostowany na Vercel, dane w Supabase). E‑Bot jest **Discordowym
ramieniem E-Forge** — nalicza **Ghost Tokens (GT)** za aktywność i łączy konta z portalem.

> Right‑sized z planu SaaS (`docs/ANALIZA.md`) → wąski, działający produkt zamiast 75 modułów.

<br/>

## 🧩 Moduły

| Moduł | Opis | Status |
|:--|:--|:--:|
| 🎮 **Biblioteka gier** | Steam (58) + PlayStation (121) = **179**, okładki/metadane z IGDB → SQLite/Supabase | ![](https://img.shields.io/badge/-stabilny-E50914?labelColor=0a0a0a) |
| 🖥️ **Dashboard** | Panel E-Forge (Przegląd, Biblioteka, Live, Bezpieczeństwo, Integracje, Komendy, Ekonomia, Profil, Ustawienia) | ![](https://img.shields.io/badge/-live-E50914?labelColor=0a0a0a) |
| 🤖 **Bot Discord** | 92 slash‑komendy (moderacja, ekonomia, leveling, tickety, AI, gry…), ~59 usług w tle, **i18n 14 języków** | ![](https://img.shields.io/badge/-stabilny-E50914?labelColor=0a0a0a) |
| 🛡️ **Anti‑Nuke** | Detekcja audit‑log, progi, kary, whitelist | ![](https://img.shields.io/badge/-stabilny-E50914?labelColor=0a0a0a) |
| 📡 **Powiadomienia live** | Twitch · Kick · YouTube · Rumble (polling) | ![](https://img.shields.io/badge/-stabilny-E50914?labelColor=0a0a0a) |
| 💰 **Ekonomia E-Forge** | GT za czat/voice, `/link`, stawki z portalu | ![](https://img.shields.io/badge/-aktywny-E50914?labelColor=0a0a0a) |

<br/>

## 🗺️ Architektura

```mermaid
flowchart LR
  U([👥 Użytkownicy Discord]) --> EB
  EB["🤖 E-Bot<br/>discord.js v14"] -->|komendy · anti-nuke · powiadomienia| U
  EB -->|GT award · link kont| GE[("🟥 E-Forge<br/>Portal · Postgres")]
  EB -->|heartbeat · presence · config| SB[("🟢 Supabase")]
  ING["📥 ingest/<br/>kolektory"] -->|Steam · PSN · IGDB| ING2{{normalizacja}}
  ING2 --> SB
  ING2 --> SQ[("💾 SQLite bot.db")]
  DASH["🖥️ Dashboard<br/>Next.js · Vercel"] -->|odczyt/zapis| SB
  DASH -->|OAuth identify| U
  DASH -->|invite · personalizacja| EB
  EB & DASH -->|status live| TW{{📡 Twitch · Kick · YT · Rumble}}
```

<br/>

## 🧱 Stack technologiczny

![Node](https://img.shields.io/badge/Node_26-0a0a0a?style=for-the-badge&logo=nodedotjs&logoColor=E50914)
![TypeScript](https://img.shields.io/badge/TypeScript_6-0a0a0a?style=for-the-badge&logo=typescript&logoColor=E50914)
![React](https://img.shields.io/badge/React_19-0a0a0a?style=for-the-badge&logo=react&logoColor=E50914)
![Next.js](https://img.shields.io/badge/Next.js_16-0a0a0a?style=for-the-badge&logo=nextdotjs&logoColor=E50914)
![Tailwind](https://img.shields.io/badge/Tailwind_4-0a0a0a?style=for-the-badge&logo=tailwindcss&logoColor=E50914)
![discord.js](https://img.shields.io/badge/discord.js_v14-0a0a0a?style=for-the-badge&logo=discord&logoColor=E50914)
![Supabase](https://img.shields.io/badge/Supabase-0a0a0a?style=for-the-badge&logo=supabase&logoColor=E50914)
![Vercel](https://img.shields.io/badge/Vercel-0a0a0a?style=for-the-badge&logo=vercel&logoColor=E50914)
![SQLite](https://img.shields.io/badge/node:sqlite-0a0a0a?style=for-the-badge&logo=sqlite&logoColor=E50914)
![IGDB](https://img.shields.io/badge/IGDB-0a0a0a?style=for-the-badge&logo=igdb&logoColor=E50914)
<br/>
![pnpm](https://img.shields.io/badge/pnpm_workspaces-0a0a0a?style=for-the-badge&logo=pnpm&logoColor=E50914)
![Biome](https://img.shields.io/badge/Biome-0a0a0a?style=for-the-badge&logo=biome&logoColor=E50914)
![Zod](https://img.shields.io/badge/Zod-0a0a0a?style=for-the-badge&logo=zod&logoColor=E50914)
![React Compiler](https://img.shields.io/badge/React_Compiler-0a0a0a?style=for-the-badge&logo=react&logoColor=E50914)

<br/>

## 🚀 Szybki start

```bash
# 0) Zależności — RAZ w rootcie (monorepo pnpm: workspace + overrides bezpieczeństwa
#    postcss/undici; `npm install` w podpakiecie je ignoruje → używaj pnpm)
pnpm install

# 1) Biblioteka gier → SQLite (Steam + PSN + GOG)
node ingest/sync.mts
pnpm sync:cloud             # ingest + wysyłka do Supabase

# 2) Dashboard (panel E-Forge) — http://localhost:3001
pnpm --filter dashboard dev

# 3) Bot Discord
pnpm --filter bot deploy    # rejestracja slash-komend
pnpm --filter bot start     # bot online + powiadomienia
```

> 🔑 Sekrety w `.env` / `dashboard/.env.local` (oba **gitignored**). Szablon: [`.env.example`](.env.example).

<br/>

## 🛰️ Funkcje

<details>
<summary><b>🎮 Biblioteka gier „Netflix"</b></summary>

- Kolektory: **Steam** (Web API), **PlayStation** (psn‑api / NPSSO), **GOG** (lokalna baza Galaxy)
- Normalizacja + okładki/gatunki/rok przez **IGDB** (OAuth Twitcha), dedup po `igdb_id`
- Dashboard: hero, filtry (platforma/gatunek/szukajka), gęste okładki, proxy obrazów `/api/img`
</details>

<details>
<summary><b>🛡️ Anti‑Nuke</b></summary>

- Detekcja przez `GuildAuditLogEntryCreate` + liczniki w pamięci (X akcji / Y s)
- 9 ochron: kanały/role create+delete, bany, kicki, webhooki, dodawanie botów
- Kary: ban · kick · timeout · strip ról · kwarantanna; whitelist (użytkownicy + role)
- Sterowanie: `/antinuke` oraz panel **Bezpieczeństwo**
</details>

<details>
<summary><b>📡 Powiadomienia live + 💰 Ekonomia E-Forge</b></summary>

- Live: Twitch · Kick · Rumble (polling 60 s), YouTube (opcjonalnie); embedy w kolorach platform
- Ekonomia: GT za wiadomości i voice (stawki z `/api/bot/config`), `/link` łączy konto z portalem
- Panel **Ekonomia** pokazuje stawki na żywo; **Live** auto‑odświeża się co 30 s
</details>

<details>
<summary><b>🖥️ Dashboard (E-Forge look)</b></summary>

- Logowanie **Discord OAuth** (tylko właściciel), responsywny (mobilne menu)
- **Personalizacja bota** (nazwa, avatar), **status/aktywność**, **motyw/kolor akcentu**
- **Zaproś bota** jednym kliknięciem, statystyki, wykresy, profil
</details>

<br/>

## 🗓️ Roadmapa

```mermaid
timeline
  title Roadmapa E-Bot
  Fazy 0–3 — Fundament + chmura (✅) : Ingest · web · bot · panel : OAuth · Anti-Nuke : Supabase + Vercel : Heartbeat/Presence/Sync
  Fazy 4–8 — Funkcje + „2.0" (✅) : Leveling · tickety · AI : EventSub · staty · bot 24/7 : Message Studio + 14 epików
  Etapy A–K — Rozbudowa (✅) : Architekt serwera : i18n bota (14 jęz.) : Config per-serwer
  i18n treści + UI (🔄) : Pomoc 37/37 : Web GameVault : UI panelu 12/~40
  Wzrost (🧭) : Marketplace : Multi-guild : Retencja
```

Pełna roadmapa i fazy → [`docs/ROADMAP.md`](docs/ROADMAP.md) · [`docs/PHASES.md`](docs/PHASES.md)

<br/>

## 📊 Biblioteka w liczbach

```mermaid
pie showData title Biblioteka gier (179)
  "PlayStation" : 121
  "Steam" : 58
```

<br/>

## 📜 Changelog

Najnowsze: **v0.615.0** — 🔄 Discovery B5: **„Zsynchronizuj komendy" z panelu** — karta na `/diagnostics` (owner) + serwis bota `cloud/command-sync.mts` (poll 30 s, identyczny deploy co `deploy-commands.mts`, wynik ✅/❌ w panelu, idempotencja po restarcie, shard-safe), bez terminala i zero nowych env, +3 testy; **v0.614.0** — 📈 Discovery B4: **metryki subskrypcji** w panelu właściciela (`PremiumAdmin`) — kafelki Aktywne / Wygasają ≤7 dni / Nowe (30 dni) / Wygasłe (30 dni) + alert „⚠ wygasa za {n} dni" w wierszu (czysta logika `lib/premiumMetrics.ts`, +4 testy); **v0.613.0** — 🔗 Discovery A6: **deep-linki bot→panel** — 8 komend-bramek (AI ×6, `/modai`, `/backlog`) dostało przycisk „Otwórz w panelu" do konkretnej strony (`lib/panelLink.mts`, gated na `DASHBOARD_URL`); przy okazji komunikaty bramek zlokalizowane ×14 (były zaszyte po polsku — `strings.panel.mts`), +2 testy; **v0.612.0** — 🛡️ Discovery C1 fala 2 (**KOMPLET**): baner „Wymaga uwagi" sprawdza też **uprawnienia bota** (`getBotPermissions` — bitmapa z ról; ostrzeżenie tylko, gdy uprawnienia potrzebuje włączony moduł: role/kanały/wiadomości/ban/timeout) + fix martwego checku auto-czyszczenia z fali 1 (`autodelete` bez wpisu w `MODULES` — aktywność = obecność reguł), i18n ×14, +2 testy; **v0.611.0** — 🩺 Discovery C1 (fala 1): baner **„Wymaga uwagi"** na Pulpicie — proaktywna diagnoza serwera (bot offline / chmura niepodłączona / moduł wskazuje na skasowany kanał lub rolę / {n} modułów bez dokończonej konfiguracji), każda pozycja z akcją „Napraw →"; zdrowy serwer = baner niewidoczny; rdzeń testowalny (`lib/healthIssues.ts`, +10 testów), i18n ×14, zero fałszywych alarmów; **v0.610.0** — 🩹 Discovery A1 fala 3 (**KOMPLET 54/54**): pozostałe 41 formularzy panelu zmigrowane na `saveConfig` — **każdy** formularz pokazuje teraz prawdziwy powód nieudanego zapisu (limit planu / „kanał nie istnieje" / brak uprawnień) zamiast generycznego „Błąd zapisu"; **propozycja A1 z discovery DOMKNIĘTA** (zero nowych kluczy i18n); **v0.609.0** — 💳 Discovery A2 fala 3 (**KOMPLET 7/7**): licznik „X / N · Free" + klikalny upsell wpięty w pozostałe 5 zasobów limitowanych — `/responder` (autorespondery), `/roles` (reaction roles + menu ról, dwa mierniki), `/scheduled` (zaplanowane posty), `/eco` (sklep); wszystkie zasoby z `PLAN_LIMITS` mają upsell w miejscu tarcia, **propozycja A2 z discovery DOMKNIĘTA** (zero nowych kluczy i18n); **v0.608.0** — 💳 Discovery A2 fala 2: licznik „X/N · Free" + klikalny upsell też na `/counters` (Free=3, najmniejszy limit) — reużyty `UsageMeter`, 2/7 zasobów limitowanych; + B1 (prowadzona aktywacja) wstrzymane do decyzji właściciela (jej core tworzy kanały/role — nakłada się na osobny tor provisioningu `empire-hub`/`ghost-*`); **v0.607.0** — 🩹 Discovery A1 fala 2: prawdziwe błędy zapisu na kolejnych 7 formularzach (AntiRaid/Suggestions/Modmail/Birthday/Starboard/TempVoice/PriceTracker — łącznie 13/54, helper `saveConfig`) + ⚠️ sprostowanie A3: „niedokończony rebrand" to **fałszywy alarm** (rebrand już w kodzie; „GH0ST EMPIRE" = świadoma nazwa ekosystemu #572/LICENSE) — brak zmiany w kodzie; **v0.606.0** — 🗂️ Discovery B2: kokpit statusu funkcji w Centrum sterowania (`/modules`) — kafelki-liczniki Wszystkie/Aktywne/**Wymaga konfiguracji**/Wyłączone z filtrem + kropka statusu per moduł; „wymaga konfiguracji" = włączone, ale niedokończone (pain P3), i18n ×14; **v0.605.0** — 💳 Discovery A2 (fala 1): licznik „X / N · Free" + **klikalny** upsell w miejscu limitu (zamiast tekstu znikającego po 4 s) — komponent `UsageMeter` reużywa `PremiumDialog` + `PLAN_LIMITS`, wpięty w `/custom-commands` (reszta limitowanych falami), i18n ×14; **v0.604.0** — 🩹 Discovery A1 (fala 1): panel pokazuje **prawdziwy powód** nieudanego zapisu (limit planu / „kanał nie istnieje" / brak uprawnień) zamiast generycznego „Błąd zapisu" — wspólny helper `saveConfig` + 6 flagowych formularzy (reszta falami); wynika z audytu produktowego `DISCOVERY_REPORT.md` (P1/A1); **v0.603.0** — 🧹 remediacja audytu #673: sprostowanie RLS 12→5 (5 tabel M1 — `guilds`/`guild_members`/`plugins`/`guild_plugins`/`plugin_config` — dostaje `enable row level security`, do puszczenia w Supabase SQL Editor), bramka lintu zielona w rdzeniu (błędy zostały wyłącznie w torze provisioningu `bot/src/setup/`), README „Szybki start" `npm`→`pnpm` (chroni `overrides`), pomiar pokrycia `pnpm test:coverage` + progi-ratchet, test parytetu `landingI18n` ×14; **v0.602.0** — 🙂 komenda `/emoji`: dodaj/„ukradnij" custom emoji na serwer (z wklejonego emoji, URL-a obrazka lub pliku; własna nazwa) — luka vs Carl-bot domknięta, i18n ×14, testowalny rdzeń; **v0.601.0** — 🚀 modernizacja fala 1: React 19 Server Actions + `useOptimistic` na `PremiumAdmin` (nadaj/odbierz Premium działa natychmiast, bez ręcznego fetch; martwa trasa `/api/dev/premium` usunięta) — wzorzec dla kolejnych ~95 miejsc; **v0.600.0** — ⭐ widoczny wpis „Premium" w bocznym menu (ikona 💎, każdy tryb) → strona `/premium` z planem, cechami i CTA „Przejdź na Premium" (koniec „nie widać przycisku"); **v0.599.0** — 🩹 fix `42703` w `_ALL.sql` (stare bazy: `ai_usage` bez `guild_id` ubijał skrypt — kolumna dodawana teraz przed indeksem; wykryte audytem Supabase/Vercel przez API); **v0.598.0** — 💳 Premium widoczne w panelu: zakładka „Premium" w `/settings` (plan + data końca + cechy + CTA, działa też bez Stripe) i panel właściciela „Subskrypcje" w `/diagnostics` (globalna lista kto/od kiedy/do kiedy + ręczne nadania/odebranie); **v0.597.0** — 📑 mobilny spis treści w `/wiki` (zwijany ToC tylko na telefonie — desktop ma sidebar; świadomie bez zakładek „Komendy/Moduły", żeby nie psuć kotwic ToC ani SEO publicznej strony); **v0.596.0** — 🗂️ pod-zakładki też na `/stats` (Aktywność · Społeczność · Tickety) i `/settings` (Bot · Panel i system · Dostęp) — etap 2 porządkowania panelu (`/gaming`, `/security` pominięte jako rzadkie); **v0.595.0** — 🗂️ pod-zakładki na `/moderation` (Automod & AI · Narzędzia · Rejestr) i `/engagement` (Społeczność · Automatyzacje · Cele) — porządek po 13 nowych modułach (`PanelTabs`, stan formularzy zachowany); **v0.594.0** — 📖 wiki + PDF znów kompletne: uzupełnienie `/wiki` i „pełnego PDF A→Z" o 13 nowych modułów (#651–#663) z opisem i konfiguracją krok po kroku; **v0.593.0** — 🌙 harmonogram blokad kanałów (ciche godziny): bot blokuje/odblokowuje pisanie na kanałach wg zegara (okno może iść przez północ; strefa = offset UTC); **v0.592.0** — 🎙️ rola głosowa: bot przydziela wybraną rolę osobom na kanale głosowym i zdejmuje ją po wyjściu (ping aktywnych / dostęp do kanału-tekstowego głosu); **v0.591.0** — 🚩 zgłaszanie wiadomości: context-menu „Zgłoś wiadomość" → kanał recenzji moderacji z przyciskami „Usuń" / „Oddal" (uprawnienie ManageMessages); **v0.590.0** — 📌 przypinanie reakcją: reakcja 📌 od uprawnionej roli przypina wiadomość (delegacja przypinania bez nadawania „Zarządzania wiadomościami"); **v0.589.0** — 🌐 tłumaczenie flagą: reakcja z flagą kraju na wiadomości → bot tłumaczy jej treść na język tej flagi (przez AI, wspólne limity); **v0.588.0** — ✉️ powitalny DM: przy dołączeniu bot wysyła nowemu członkowi prywatną wiadomość z konfigurowalną treścią (regulamin, pierwsze kroki; placeholdery {user}/{server}); **v0.587.0** — 🔗 podgląd linków do wiadomości: wklejony link do wiadomości z serwera bot rozwija w embed (autor, treść, obrazek) + przycisk „Skocz" (anty-wyciek: ten sam serwer + dostęp wklejającego); **v0.586.0** — 🧹 auto-czyszczenie kanałów: na wybranych kanałach bot kasuje wiadomości starsze niż ustawiony czas (kanały-komendy, spam, tymczasowe; pomija przypięte); **v0.585.0** — 🔤 dehoisting: bot usuwa wiodące znaki interpunkcyjne z pseudonimów, którymi trolle windują się na górę listy członków (na wejściu i przy zmianie nicku); **v0.584.0** — 👍 auto-reakcje: na wybranych kanałach bot sam dodaje skonfigurowane reakcje do każdej wiadomości (prezentacje 👍/❤️, propozycje ⬆️/⬇️, przedstawienia 👋); **v0.583.0** — 🔒 trwałe role (sticky roles): bot zapamiętuje role wychodzącego członka i przywraca je przy powrocie — anty-ucieczka od wyciszenia (leave→rejoin) + zachowanie zdobytych ról; **v0.582.0** — ⏱️ adaptacyjny slowmode: bot mierzy tempo wiadomości na wybranych kanałach i sam podnosi/zdejmuje slowmode (bez kar, bez moderatora — kanał zwalnia w szczycie, wraca do normy po wyciszeniu); **v0.581.0** — ⚖️ system odwołań od bana: publiczny formularz `/p/appeal` (tożsamość przez logowanie Discordem — osobne ciasteczko bez dostępu do panelu) → kolejka → moderator cofa ban / odrzuca przyciskiem (unban + DM); **v0.580.0** — 🤝 fala 2: cele społeczności (zbiorowy target wiadomości/miesiąc → świętowanie) + auto-publikacja ogłoszeń (crosspost na kanałach „Announcement"); **v0.579.0** — 🧰 fala funkcji: `/snipe` (podgląd usuniętej/edytowanej), auto-wątki na kanałach, kamienie milowe serwera (Nty członek) + AI-recap w tygodniowym digescie; **v0.578.0** — 🧰 patch-notes 2.0: anty-spam przy 1. włączeniu, „Testuj feed" (SSRF-safe), własny RSS, wykrywanie martwych feedów, cache AI, Claude jako dostawca AI, „Gaming feed" zawsze widoczny + publiczny `/p/status`; **v0.577.0** — 🎮 tryb PatchBot: patch-notes z katalogu po nazwie (gry Steam + RSS, GPU/sprzęt, newsy) + routing per-wpis (kanał/ping/pin, forum/voice) + digest + AI-streszczenia; **v0.576.0** — 📕 pełny PDF z wszystkimi funkcjami (A→Z: komendy + moduły, generowany z wikiData); **v0.575.0** — 🧨 reset bazy dla developera (cała / per-serwer; tylko właściciel, RPC + potwierdzenie); **v0.574.0** — 🔐 top.gg webhook zgodny z v1 (podpis HMAC `x-topgg-signature` + payload `vote.create`, plus legacy); **v0.573.0** — 🗳️ top.gg: webhook nagród za głos (zapis głosu + GT przez portal, fail-closed auth); **v0.572.0** — ⭐ przygotowanie pod top.gg (auto-raport liczby serwerów + komenda /vote + przewodnik [`docs/TOPGG.md`](docs/TOPGG.md)); **v0.571.0** — 🔓 panel otwarty dla adminów serwerów (self-serve domyślnie, izolacja per-serwer) + komunikaty logowania ×14; **v0.570.0** — 🎨 redesign panelu „Crimson Aurora" (szkło, gradienty, spójne nagłówki/tabele/puste stany) + rebranding „GH0ST EMPIRE" → „E‑Forge"; **v0.569.0** — 🌍 wiki (interfejs) w 14 językach; **v0.568.0** — 🌍 ekran logowania w 14 językach; **v0.567.0** — 🌍 landing w 14 językach (z RTL dla arabskiego); **v0.566.0** — 📄 PDF-y dla streamerów i developerów (ze zrzutami); **v0.565.0** — 📖 zaawansowane Wiki (`/wiki` + eksport Markdown: 95+ komend, moduły krok po kroku, zrzuty); **v0.564.0** — 🔐 nowy ekran logowania „Split" (czerń/czerwień); **v0.563.0** — 🚀 publiczny landing (root dla gości) w stylu mee6 — czerń/czerwień, realne zrzuty; **v0.562.0** — 🔔 czytelny komunikat limitu w panelu (zamiast „Błąd zapisu"); **v0.561.0** — 🔒 limity Free/Premium (egzekwowanie server-side w 7 modułach, konfigurowalne w `PLAN_LIMITS` + env, grandfathering); **v0.560.0** — 📄 treść regulaminu i polityki prywatności + linki na /login; **v0.559.0** — 💳 plan Premium miesięczny i roczny (przełącznik, 19,99 zł/mc · 199 zł/rok); **v0.558.0** — 🦶 stopka panelu + strony /p/about · /p/regulamin · /p/polityka-prywatnosci; **v0.557.0** — 💳 panel: okno porównania planów Free vs Premium (cena z env, Stripe Checkout); **v0.548–0.556** — 🔒 przegląd QA + 11 fixów (`scanScam` phishing przy `HTTP://` · `percentileRank` poprawny percentyl · `buildEmbed` limit 6000 · `duration` ujemne · ReDoS-guard automoda · `levelInfo` pasek na kapie · anti-raid homoglify · automod anty-bypass „rozstrzelony" · redukcja FP findPII/isSuspiciousName); **v0.547.0** — 🔒 atomowa wypłata podium sezonu (`ecoSeason` — domyka atomowość WSZYSTKICH ścieżek salda); **v0.545–0.546** — 🐛 drobiazgi z audytu (pasek XP peta na max-levelu, walidacja przydzielności ról battle-passa); **v0.539–0.544** — 🔒 **pełna atomowość ekonomii** (audyt współbieżności: `pay`/`rob` cross-user + RPC `economy_ensure`, atomowe saldo we wszystkich ścieżkach — level-up · giveaway · market · lottery · cards · skins · stocks · gry/sklep/blackjack `/eco`); **v0.537–0.538** — 🔒 atomowość salda (RPC Postgres + per-user `withLock`) i ♻️ `mergeConfig`; **v0.529–0.534** — 🛡️ **klany kompletne** + 📊 **benchmarking cross-server**; **v0.518–0.528** — ⚔️ **pety PvP** i 🎭 **role battle-passa**. Suite **165 plików / 1260 testów** (0 xfail), bramki zielone (Node 26.4.0).
Pełna, numerowana historia → [`CHANGELOG.md`](CHANGELOG.md).

<br/>

## 📁 Struktura repo

```
E-Bot/
├─ ingest/        📥 kolektory: steam · psn · gog · igdb → data/bot.db (+ Supabase)
├─ bot/           🤖 discord.js v14 — komendy, powiadomienia, anti-nuke, ekonomia
├─ dashboard/     🖥️ Next.js (panel E-Forge) → Vercel + Supabase
├─ web/           🎞️ pierwsza wersja UI „Netflix dla gier" (lokalnie)
├─ docs/          📚 ANALIZA · DESIGN · ARCHITECTURE · ROADMAP · PHASES · SECRETS
├─ .github/       ⚙️ CI · CodeQL · Dependabot · CODEOWNERS · SECURITY
├─ CHANGELOG.md   📜 numerowana historia
└─ README.md      🎬 ten plik
```

<br/>

## 🔐 Bezpieczeństwo

Repo **prywatne**, chronione: branch protection, CodeQL, Dependabot, secret‑scanning,
proprietarna licencja, CODEOWNERS. Sekrety wyłącznie w `.env*` (gitignored).
Szczegóły i zgłaszanie → [`.github/SECURITY.md`](.github/SECURITY.md).

<br/>

## 📚 Dokumentacja

| Dokument | Treść |
|:--|:--|
| [Wiki](../../wiki) | Pełna baza wiedzy projektu |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Diagramy, przepływy, decyzje |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Roadmapa + Gantt |
| [docs/PHASES.md](docs/PHASES.md) | Fazy i status (na bieżąco) |
| [docs/ANALIZA.md](docs/ANALIZA.md) | Analiza i right‑sizing |
| [docs/DESIGN.md](docs/DESIGN.md) | System wizualny (E-Forge/Netflix) |
| [docs/SECRETS.md](docs/SECRETS.md) | Triage kluczy + rotacja |

<br/>

<div align="center">

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**© 2026 E-Forge — wszelkie prawa zastrzeżone.**
Made with 🩸 & ☕ · `E-BOT`

</div>
