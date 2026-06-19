<!-- SYNC: v0.239.0 · #309 · 2026-06-19 — utrzymywane przez `pnpm docs:check` (NIE edytuj ręcznie wersji bez aktualizacji statusu) -->
<div align="center">

# 🧩 FAZY PROJEKTU &nbsp;·&nbsp; E‑BOT

![Faza 0](https://img.shields.io/badge/Faza_0-✅-E50914?labelColor=0a0a0a)
![Faza 1](https://img.shields.io/badge/Faza_1-✅-E50914?labelColor=0a0a0a)
![Faza 2](https://img.shields.io/badge/Faza_2-✅-E50914?labelColor=0a0a0a)
![Faza 3](https://img.shields.io/badge/Faza_3-✅-E50914?labelColor=0a0a0a)
![Faza 4](https://img.shields.io/badge/Faza_4-✅-E50914?labelColor=0a0a0a)
![Faza 5](https://img.shields.io/badge/Faza_5-✅-E50914?labelColor=0a0a0a)
![Faza 6](https://img.shields.io/badge/Faza_6-✅-E50914?labelColor=0a0a0a)
![Faza 7](https://img.shields.io/badge/Faza_7-✅-E50914?labelColor=0a0a0a)
![Faza 8](https://img.shields.io/badge/Faza_8-✅-E50914?labelColor=0a0a0a)
<br/>
![Etapy A–K](https://img.shields.io/badge/Etapy_A–K-✅-E50914?labelColor=0a0a0a)
![Architekt serwera](https://img.shields.io/badge/Architekt_serwera-✅-E50914?labelColor=0a0a0a)
![Multi-serwer](https://img.shields.io/badge/Config_multi--serwer-✅-E50914?labelColor=0a0a0a)
![i18n bota](https://img.shields.io/badge/i18n_bota_14_jęz.-✅-E50914?labelColor=0a0a0a)
![i18n panelu](https://img.shields.io/badge/i18n_panelu-🔄_29%2F~40-FFB020?labelColor=0a0a0a)
![Wersja](https://img.shields.io/badge/wersja-0.222.0-E50914?labelColor=0a0a0a)

</div>

> Status zadań — **aktualizowany na bieżąco** (`[x]` zrobione, `[ ]` w planie). Źródło prawdy dla numeracji/wersji: [`CHANGELOG.md`](../CHANGELOG.md).
> 🔄 **Ten plik + [`ROADMAP.md`](ROADMAP.md) są synchronizowane z CHANGELOG przy każdym update** — weryfikacja: `pnpm docs:check`. Zasada utrzymania: [`CLAUDE.md`](../CLAUDE.md).

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔭 Bieżący tor (v0.239.0)

**🌍 i18n UI panelu** — tłumaczenie etykiet i formularzy stron ustawień na **14 języków** (PL, EN, DE, ES, IT, FR, PT, ZH, KO, RU, UK, JA, AR + RTL, ID). Powłoka panelu, pomoc „Jak to działa?" (37/37) i strona web GameVault są już wielojęzyczne — teraz idą strony ustawień, falami (`page.tsx` server-side + komponenty‑formularze).

- [x] **Zrobione 29/~40 stron**: `/welcome` `/modules` `/leaderboard` `/logging` `/audit` `/modmail` `/birthdays` `/suggestions` `/appearance` `/wishlist` `/notifications` `/live` `/tickets` `/security` `/levels` `/counters` `/responder` `/automations` `/scheduled` `/diagnostics` `/stats` `/profile` `/donations` `/economy` `/eco` `/library` `/integrations` `/gaming` `/creator`
- [ ] **Pozostało ~9 stron**: `/ai` `/applications` `/commands` `/custom-commands` `/engagement` `/moderation` `/roles` `/settings` `/setup`
- [ ] Osobna, późniejsza fala: wewnętrzne etykiety współdzielonego `CardStyleEditor`

### 🧭 Otwarte / strategiczne (poza torem i18n)
- [ ] **Marketplace pluginów / efekt sieciowy** — *config* multi‑serwer gotowy (Etap K, C‑1…C‑27); brakuje produktyzacji marketplace i modelu multi‑guild jako usługi
- [ ] **Retencja + więcej wykresów w czasie** (panel `/stats`)
- [ ] **Produkcyjne wpięcie infry**: pełny Sentry (realny DSN), Redis (instancja), Supabase Realtime push — szkielety/wersje gated już są
- [ ] **Twitch sub → rola** — kod gotowy; aktywacja wymaga OAuth twórcy (scope `channel:read:subscriptions`)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🗂️ Mapa er → wersje (źródło: CHANGELOG)

| Era | Zakres | Co przyniosła | Status |
|:--|:--|:--|:--:|
| **Fazy 0–5** | `0.1`–`0.10` | Ingest, web, rdzeń bota, panel, chmura, OAuth, anti‑nuke, `/link`, leveling, tickety, AI, EventSub, bot 24/7 | ✅ |
| **Fazy 6–7** | `0.11`–`0.37` | „Zrób wszystko" (B1–B7) + pełna personalizacja (F1–F10): moderacja, logi, weryfikacja, modmail, sugestie, AI++, gaming, analityka, Sentry | ✅ |
| **Faza 8** | `0.46`–`0.59` | Fundament customizacji: Message Studio + 14 epików „2.0" (Tickets/Applications/Reaction‑roles/Automod/Levels/AI/Library/Notifications/Donate/Creator/Integracje) | ✅ |
| **Pozostałości + Ulepszenia** | `0.60`–`0.99` | Profil 2.0, Realtime sync, multi‑user panelu, nowy look „Obsidian/Crimson", staty, interakcje, onboarding | ✅ |
| **Architekt Serwera** | `0.100`–`0.104` | Silnik provisioningu, AI‑kreator struktury, blueprinty, dry‑run, `/undo` | ✅ |
| **i18n bota** | `0.105`–`0.113`, `0.154`–`0.157` | Fundament i18n + opisy komend + runtime‑stringi + przełącznik — **14 języków** | ✅ |
| **Etapy A–K** | `0.114`–`0.194` | Przyjazność (`/help`, `/tutorial`), fun‑pack, info/mod‑utils, Architekt++, social, **safety (Etap G)**, customization 2.0 (Etap H/I), gospodarka‑gry (Etap J: stocks/pets/cards/meme), **config per‑serwer (Etap K, C‑1…C‑27)** | ✅ |
| **i18n treści + UI** | `0.202`–`0.239` | Samouczek, asystent, „Jak to działa?" 37/37, web GameVault (+RTL), **UI panelu (w toku, 29/~40)** | 🔄 |

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ✅ Faza 0 — Fundamenty
- [x] Kolektor Steam (Web API, 58 gier)
- [x] Kolektor PlayStation (psn‑api / NPSSO, 121 tytułów)
- [x] Kolektor GOG (lokalna baza Galaxy — opcjonalny)
- [x] Normalizacja + okładki/metadane IGDB
- [x] Web „Netflix dla gier" (hero, półki, kafelki)
- [x] Rdzeń bota (discord.js v14, `/ping`, `/library`)
- [x] Szkielet dashboardu (Next.js)

## ✅ Faza 1 — Chmura + bezpieczeństwo
- [x] Discord OAuth do panelu (sesja HMAC + middleware)
- [x] Anti‑Nuke (`/antinuke` + panel Bezpieczeństwo)
- [x] Supabase (schema + seed) — biblioteka w chmurze
- [x] Deploy Vercel (`e‑bot‑dc.vercel.app`), branch‑aliasy
- [x] GH0ST `/link` (łączenie kont)
- [x] Utwardzenie repo: branch protection na `main`, Dependabot (alerty+auto‑fix), CodeQL, CODEOWNERS
- [x] Pełna dokumentacja: README/ROADMAP/ARCHITECTURE/PHASES/CHANGELOG + **Wiki** (6 stron)

## ✅ Faza 2 — Pełny panel GH0ST
- [x] Look GH0ST (czerwień/czerń, Oswald, poświaty)
- [x] Responsywność (mobilne menu, scrolle)
- [x] Strona /live (Twitch/Kick/YT/Rumble) + auto‑odświeżanie
- [x] Ekonomia (stawki GT z `/api/bot/config`)
- [x] Profil (Discord) + przycisk „Zaproś bota"
- [x] Personalizacja bota (nazwa, avatar)
- [x] Status/aktywność (presence config) + motyw/kolor akcentu
- [x] Strony loading/error/404 w stylu GH0ST

## ✅ Faza 3 — Integracja bot↔chmura
- [x] Bot pisze heartbeat `bot_status` do Supabase (panel czyta status na żywo; offline przy zamknięciu)
- [x] Bot stosuje `bot_presence` (`setPresence`) — synchronizacja z panelu co 60 s
- [x] Bot czyta whitelistę anti‑nuke + ustawienia powiadomień z Supabase (`settings-sync` → lokalny SQLite; zmiany z bota wracają mirror‑upem)
- [x] Endpoint GH0ST `link-status` → realny status powiązania w Profilu
- [x] Endpoint zdrowia bota → `/api/health` (+ alert „bot down" przez Vercel Cron)
- [x] **Realtime sync** (zero‑dep) — natychmiastowy push panel → bot (`0.65`)

## ✅ Faza 4 — Wzrost (funkcje społeczności)
> 📋 Szczegółowy plan: [`FAZA-4-PLAN.md`](FAZA-4-PLAN.md)
- [x] Tickety — panel + bot (`/ticket`, prywatne wątki → Supabase)
- [x] Leveling / XP — panel + bot (XP czat/voice, awanse, role‑nagrody → Supabase)
- [x] Reaction roles — panel `/roles` + bot
- [x] Komendy AI — `/ai` z twardym dziennym limitem (panel `/ai` + `ai_usage`)
- [x] Webhooki EventSub (zamiast pollingu) — `stream.online`
- [x] Statystyki — strona `/stats`

## ✅ Faza 5 — Statystyki + EventSub
- [x] Strona `/stats` — wykresy zużycia AI (14 dni), top XP, tickety, biblioteka
- [x] Twitch EventSub — webhook `/api/twitch/eventsub` (HMAC + challenge) → natychmiastowe ogłoszenie live
- [x] Hosting bota 24/7 — Railway (Dockerfile, heartbeat zweryfikowany)
- [ ] **Marketplace pluginów / multi‑guild jako usługa** *(otwarte — patrz „Bieżący tor")*

## ✅ Faza 6 — „Zrób wszystko" (B1–B7)
- [x] **B1** — Powitania + autorole (`/welcome`) + Automod (`/moderation`)
- [x] **B2** — Moderacja `/mod warn|timeout|clear|warnings` + historia (`mod_cases`)
- [x] **B3** — Pickery ról/kanałów w panelu (dropdowny zamiast ID)
- [x] **B4** — Narzędzia twórcy (`/creator`): auto‑wydarzenie na live + relay klipów
- [x] **B5** — Engagement: button‑role, `/remind`, `/giveaway`, starboard, temp‑voice
- [x] **B6** — Biblioteka 2.0: lista życzeń (`/wishlist`) + ręczne dodawanie gier z IGDB
- [x] **B7** — Infra/jakość: Vitest+CI, alert „bot down", handlery błędów, cache TTL
- [x] **Playwright E2E** (proxy/login/`/p/*`/health)

## ✅ Faza 7 — „Wszystko + pełna personalizacja" (F1–F10)
- [x] **F1** — Centrum sterowania (`/modules`) + MessageEditor + ColorField/GradientField + własny HEX akcentu
- [x] **F2** — Karty rang `/rank` (canvas) + baner powitalny + panel `/appearance`
- [x] **F3** — Ekonomia serwera `/eco` (daily/work/rob/pay/bank/gamble/slots/shop/buy/top) + sklep ról
- [x] **F4** — Leveling++ (mnożniki XP, no‑XP, anti‑AFK voice, custom level‑up, stack ról, `/prestige`)
- [x] **F5** — Tickety++ (`/ticketpanel`, transkrypty HTML→log+DM, oceny ⭐)
- [x] **F6** — Bezpieczeństwo++: kary+sprawy (`/case`, `temp_bans`), logi serwera (`/logging`), weryfikacja (`/verifypanel`) + anti‑raid, modmail
- [x] **F7** — Społeczność: sugestie (`/suggest`) + ankiety (`/poll`), komendy własne + autoresponder, urodziny/AFK/highlighty, liczniki kanałów
- [x] **F8** — AI++: `/tldr` + `/translate` + `lib/ai.mts`, czat z pamięcią + `/imagine`, AI‑moderacja
- [x] **F9** — Gaming unikat: free‑games feed (Epic), patch‑notes (Steam), backlog (`/backlog`), donejty Ko‑fi + price‑tracking ITAD
- [x] **F10** — Analityka + Infra: wykresy aktywności, sezonowe rankingi (`/hof`), Sentry (zero‑dep, DSN‑gated)

## ✅ Faza 8 — Fundament customizacji + 14 epików „2.0" (`0.46`–`0.59`)
- [x] **Inline toggle modułów** (`ModuleBar`; źródło prawdy = Centrum sterowania)
- [x] **Message Studio** — uniwersalny edytor embed+tekst (live‑preview 1:1, smallcaps/fonty Unicode, emoji + serwerowe, szablony, **Components V2**)
- [x] **Smallcaps** w edytorze i UI · **Compact UI**
- [x] Epiki 2.0: ✅ Tickets · ✅ Applications · ✅ Reaction roles · ✅ Automod/Security · ✅ Creator+Social · ✅ Notifications · ✅ Donate · ✅ Levels · ✅ AI (`/ask`+`/rewrite`) · ✅ Game Library (klikalne gry) · ✅ Integracje (generic incoming webhook)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ✅ Po Fazie 8 — rozbudowa ciągła (`0.60`–`0.222`)

### 🧱 Pozostałości + Ulepszenia (`0.60`–`0.99`)
- [x] Profil 2.0 + Smallcaps w UI · free‑games multi‑store (ITAD) · hartowanie (testy, parser RSS)
- [x] Realtime panel→bot (zero‑dep) · no‑code komendy slash · uprawnienia panelu (admin/editor/viewer, multi‑user)
- [x] Nowy look „Obsidian / Crimson" + mikro‑interakcje + ekran logowania · tryb focus · glass topbar
- [x] Statystyki: trendy 14 dni, wykresy area SVG · automod (eskalacja, anty‑scam/PII) · liczniki Twitch/Kick/YouTube
- [x] Interakcje: `/trivia` `/rep` `/confess` `/xpevent` `/event` (RSVP) · onboarding (Diagnostyka + kreator startowy) · historia ekonomii na profilu

### 🏗️ Architekt Serwera (`0.100`–`0.104`)
- [x] Silnik provisioningu (twórz + auto‑wpinanie) · AI‑kreator (opis → blueprint) · blueprinty + eksport/import · podgląd (dry‑run) · `/undo` (rollback)

### 🌍 i18n bota — 14 języków (`0.105`–`0.113`, `0.154`–`0.157`)
- [x] Fundament i18n + opisy komend (Discord‑localizations) · runtime‑stringi (~40 słowników) · przełącznik języka w panelu · błędy bota i cała ekonomia/moderacja/profil na `t()`

### 🅰️ Etapy A–K (`0.114`–`0.194`)
- [x] **A „Przyjazność"** — `/help` (hub), opisy „co/po co" na stronach, `/tutorial`
- [x] **B** — 3 tryby dashboardu (Prosty/Zaawansowany/Developer)
- [x] **C** — fun‑pack (`/rps /flip /dadjoke /cat /dog`), `/sticky`, Polls v2, `/farewell`, `/search`, `/persona`, pakiet info (`/avatar /userinfo /serverinfo`), mod‑utils (`/slowmode /lock /unlock`)
- [x] **D** — `/healthcheck`, `/roleperms`, `/rolecopy`, `/blueprint`, `/aiserver`, `/undo`
- [x] **E/F** — osiągnięcia‑tiery, reaction‑roles „wybierz jedną", social pack (`/ship /hug /kiss /slap /pat`), `/marry`, gry (`/eco crime/highlow`, `/ttt`), mosty eko + `/math`
- [x] **G (SAFETY)** — `/raidmode`, `/backup` (snapshot+restore), `/heat` (adaptacyjny anty‑spam), bypass‑guard + weryfikacja hasłem, `/panic`
- [x] **H** — TempVoice 2.0, `/imageonly`, context‑menu (PPM), formularz przed ticketem, Custom Commands 2.0 (akcje+warunki)
- [x] **I** — Pulpit 2.0 (health‑score), tooltipsy/pola wg trybu, Twitch Schedule→Events, Discord AutoMod natywny, Components V2, live‑rola/vanity‑rola, **i18n panelu (nawigacja + paleta ⌘K)**
- [x] **J** — `/stocks` (giełda), role czasowe w sklepie, `/pet`, `/cards`, `/meme`
- [x] **K „Przyjazność 2.0" + config per‑serwer** — przełącznik serwerów, „Jak to działa?" na każdej stronie, asystent AI panelu, tryby 2.0, oraz **C‑1…C‑27: każdy moduł konfigurowalny per‑serwer** (powitania, leveling, sugestie, urodziny, liczniki, ekonomia, automod, logi, weryfikacja, modmail, aplikacje, tickety, TempVoice, starboard, autoresponder, liczenie/AFK, highlighty, automatyzacje, role‑menu, invite‑tracker, rankcard, heat, anti‑raid, anti‑nuke, komendy własne, digest, sezony)

### 🎁 Funkcje końcowe + i18n treści (`0.195`–`0.222`)
- [x] Wyszukiwarka komend w `/help` · automod anty‑caps/anty‑spoiler · krzywa XP (presety) · 8 motywów kart · giveaway (kasa+XP) · onboarding DM właściciela · transkrypty ticketów na web
- [x] i18n treści: samouczek, asystent AI, **„Jak to działa?" 37/37 stron × 14 jęz.**, web GameVault (+RTL +przełącznik)
- [🔄] **i18n UI panelu** — 29/~40 stron *(patrz „Bieżący tor" u góry)*

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
<div align="center"><sub>Ostatnia aktualizacja: 2026‑06‑19 · v0.239.0 (#309) · powiązane: <a href="ROADMAP.md">ROADMAP</a> · <a href="../CHANGELOG.md">CHANGELOG</a> · weryfikacja sync: <code>pnpm docs:check</code></sub></div>
