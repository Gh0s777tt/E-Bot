<!-- SYNC: v0.299.0 · #369 · 2026-06-20 — utrzymywane przez `pnpm docs:check` (NIE edytuj ręcznie wersji bez aktualizacji statusu) -->
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
![i18n panelu](https://img.shields.io/badge/i18n_panelu_39%2F39-✅-E50914?labelColor=0a0a0a)
![Wersja](https://img.shields.io/badge/wersja-0.222.0-E50914?labelColor=0a0a0a)

</div>

> Status zadań — **aktualizowany na bieżąco** (`[x]` zrobione, `[ ]` w planie). Źródło prawdy dla numeracji/wersji: [`CHANGELOG.md`](../CHANGELOG.md).
> 🔄 **Ten plik + [`ROADMAP.md`](ROADMAP.md) są synchronizowane z CHANGELOG przy każdym update** — weryfikacja: `pnpm docs:check`. Zasada utrzymania: [`CLAUDE.md`](../CLAUDE.md).

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔭 Bieżący tor (v0.299.0)

**🌍🏁 i18n UI panelu — UKOŃCZONE** — etykiety i formularze **wszystkich** stron panelu przetłumaczone na **14 języków** (PL, EN, DE, ES, IT, FR, PT, ZH, KO, RU, UK, JA, AR + RTL, ID). Powłoka panelu, pomoc „Jak to działa?" (37/37), web GameVault oraz wszystkie strony ustawień — komplet.

- [x] **Zrobione 39/39 stron (komplet)**: `/` (Pulpit) `/welcome` `/modules` `/leaderboard` `/logging` `/audit` `/modmail` `/birthdays` `/suggestions` `/appearance` `/wishlist` `/notifications` `/live` `/tickets` `/security` `/levels` `/counters` `/responder` `/automations` `/scheduled` `/diagnostics` `/stats` `/profile` `/donations` `/economy` `/eco` `/library` `/integrations` `/gaming` `/creator` `/roles` `/commands` `/applications` `/ai` `/engagement` `/custom-commands` `/moderation` `/settings` `/setup`
- [x] Osobna, opcjonalna fala: wewnętrzne etykiety współdzielonego `CardStyleEditor` + `GradientField` (15 kluczy × 14 jęz.) ✅ **v0.249.0**
- [x] Strona główna (Pulpit `/`) + widgety + checklista modułów + `relTime` (Intl) — 53 klucze `ui.home.*` + 16 `ui.checklist.*` × 14 jęz. ✅ **v0.250.0**
- [x] Powierzchnia publiczna / pre-auth (osobno od 39/39): logowanie + publiczny ranking `/p/leaderboard` + publiczny profil `/p/u/[id]` (chrome + `generateMetadata`) — 17 kluczy `ui.pub.*` × 14 jęz. ✅ **v0.251.0**
- [x] Boilerplate frameworka: `error.tsx` + `not-found.tsx` (404) + `loading.tsx` (Suspense) + metadane `layout.tsx` — 8 kluczy `ui.sys.*` × 14 jęz. ✅ **v0.252.0**
- [x] Obraz OG profilu (`opengraph-image.tsx`): dynamiczne fonty Google per-skrypt (fail-safe, subset TTF) + etykiety — 5 kluczy `ui.og.*` × 14 jęz. ✅ **v0.253.0**. **KONIEC i18n CAŁEJ powierzchni web** — nie zostaje żaden niezlokalizowany element UI.
- [x] **Audyt i18n 14 jęz.** — parzystość **1394×14** (0 brakujących), 0 duplikatów, tokeny `{…}` 100% spójne; **naprawiony RTL** (arabski: `dir="rtl"` na `<html>` — SSR z cookie + klient na zmianę języka). ✅ **v0.254.0**
- [x] **RTL — KOMPLETNY** 🏁: chrom nawigacyjny (v0.255–256) + Pulpit/widgety (v0.257.0) + 14 stron `app/*` (v0.258.0) + 22 komponenty (v0.259.0) + knoby przełączników (v0.260.0). Cała powierzchnia na logicznych klasach Tailwind v4; finalny grep — zero fizycznych klas kierunkowych poza 2 wyśrodkowaniami. ✅

### 🧭 Otwarte / strategiczne (poza torem i18n)
- [ ] **Marketplace pluginów / multi-guild — 🚧 M1 ✓ · M2 ✓ · M3 ✓ · M4 ✓ · M5 ✓ · M6 ✓ (sandbox + auto-trigger)** — decyzje: ✅ **płatne** (tiery) + ✅ **community** (3rd-party) → pełny zakres **M1–M6**. **Zrobione:** schemat + multi-tenant + chokepoint izolacji (v0.267–269) + katalog + strona `/marketplace` + toggle (v0.270–272) + self-serve login [`lib/enroll.ts`](../dashboard/lib/enroll.ts) + **onboarding `/onboarding`** (dodaj bota + Twoje serwery, v0.273+279) + **billing Stripe** (v0.274–275; [`AKTYWACJA-STRIPE.md`](AKTYWACJA-STRIPE.md)) + community pipeline `/marketplace/submit`+`/review` (zgłoszenie→moderacja→katalog, v0.276–278) + **i18n WSZYSTKICH powierzchni ×14** (onboarding/review/submit, 25 kluczy, v0.280–281) + **M3 config pluginów** ([`lib/pluginConfig.ts`](../dashboard/lib/pluginConfig.ts): `plugin_config`=community; first-party bez migracji, v0.282.0) + **self-review bezpieczeństwa** (4 luki cross-tenant naprawione — export/staff/import/global-write, v0.283.0; [`SECURITY-REVIEW-MARKETPLACE.md`](SECURITY-REVIEW-MARKETPLACE.md)). **Sandbox wykonania obcego kodu — design gotowy** ([`PLAN-M6-SANDBOX.md`](PLAN-M6-SANDBOX.md): webhook-first + capability, fazy M6a–M6d; v0.284.0) → **M6a runner webhook** ([`lib/pluginRunner.ts`](../dashboard/lib/pluginRunner.ts): kontrakt + HMAC + SSRF-guard, v0.285.0) → **M6b wykonanie akcji** ([`lib/pluginExecutor.ts`](../dashboard/lib/pluginExecutor.ts) + [`lib/discordActions.ts`](../dashboard/lib/discordActions.ts): `setConfig` + `sendMessage`/`addRole` z per-akcja authz/anty-eskalacja — kanał/rola ∈ gildia, rola bez groźnych uprawnień, v0.286–287) + **M6c dry-run** ([`/api/community/dryrun`](../dashboard/app/api/community/dryrun/route.ts): owner-only test endpointu przez runner, **bez wykonania**, v0.288.0) + **trigger produkcyjny** ([`lib/pluginInvoke.ts`](../dashboard/lib/pluginInvoke.ts) + [`/api/community/run`](../dashboard/app/api/community/run/route.ts): orchestrator z 6 warstwami strażników + owner-triggered **realne wykonanie**, v0.289.0; auto-trigger na zdarzenia → most bota niżej) + formularz endpoint/secret (v0.290.0) + **toggle community per-serwer** ([`/api/community/toggle`](../dashboard/app/api/community/toggle/route.ts) → `guild_plugins`; **PEŁNA pętla UI ✓**, v0.291.0) + **auto-trigger z bota** (most [`bot/src/cloud/plugin-bridge.mts`](../bot/src/cloud/plugin-bridge.mts) → [`/api/internal/plugin-event`](../dashboard/app/api/internal/plugin-event/route.ts) → fan-out [`invokeGuildEvent`](../dashboard/lib/pluginInvoke.ts); `guildMemberAdd`/`Remove`/`Boost` + `messageCreate` (filtr słów-kluczy, manifest `keywords[]` + [`/api/internal/plugin-subscriptions`](../dashboard/app/api/internal/plugin-subscriptions/route.ts)) odpalają włączone+zatwierdzone pluginy przez audytowany sandbox; reakcje/voice świadomie pominięte (ochrona przed zalaniem); autor wybiera `event`+`keywords` w formularzu zgłoszeń (i18n ×14) — **„żywa" pętla ✓**, v0.292–295) + **przewodnik aktywacji** ([`AKTYWACJA-COMMUNITY.md`](AKTYWACJA-COMMUNITY.md): env + kontrakt webhooka + przykładowy plugin, v0.296.0). Plan: [`PLAN-MARKETPLACE.md`](PLAN-MARKETPLACE.md)
- [ ] **Retencja + więcej wykresów w czasie** (panel `/stats`) — przyrosty 1–3 ✅ **v0.261–263** (wzrost członków + komplet trendów + **konfigurowalny zakres 7/14/30/90d** + **eksport CSV**); **kohortowa retencja ✓** — fundament danych (tabela `member_cohorts` + tracking join/leave w bocie [`analytics/cohorts.mts`](../bot/src/analytics/cohorts.mts) z bounded backfillem 90 dni, v0.297.0) + **wykres D1/D7/D30 na `/stats`** ([`lib/retention.ts`](../dashboard/lib/retention.ts) eligible-based + sekcja UI + i18n ×14, v0.298.0) + **Audyt #2 bezpieczeństwa** — naprawa F5 (scoping analityki `/stats` przez `getPrimaryGuildId`, anty-przeciek cross-tenant; [`SECURITY-REVIEW-MARKETPLACE.md`](SECURITY-REVIEW-MARKETPLACE.md), v0.299.0)
- [ ] **Produkcyjne wpięcie infry** — szkielety **kompletne i gated** (audyt v0.265.0, przewodnik [`AKTYWACJA-INFRA.md`](AKTYWACJA-INFRA.md)): Sentry no-op bez `SENTRY_DSN`; Realtime z fallbackiem poll 60 s (aktywacja = `ALTER PUBLICATION … ADD TABLE settings`); Redis niewpięty (opcja na skalę). Aktywacja Sentry/Realtime wymaga **Twoich** zasobów
- [ ] **Twitch sub → rola** — kod **kompletny + gotowy do aktywacji** (v0.264.0): runtime obsługuje `channel.subscribe`→rola, `eventsub-setup.mts` rejestruje obie subskrypcje, przewodnik [`AKTYWACJA-TWITCH-SUB.md`](AKTYWACJA-TWITCH-SUB.md). Aktywacja czeka na **Twoje** zasoby: aplikacja Twitch + OAuth broadcastera (scope `channel:read:subscriptions`)

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
| **i18n treści + UI** | `0.202`–`0.243` | Samouczek, asystent, „Jak to działa?" 37/37, web GameVault (+RTL), **UI panelu (w toku, 33/~40)** | 🔄 |

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
- [x] **i18n UI panelu** — 39/39 stron ✅ *(patrz „Bieżący tor" u góry)*

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
<div align="center"><sub>Ostatnia aktualizacja: 2026‑06‑20 · v0.299.0 (#369) · powiązane: <a href="ROADMAP.md">ROADMAP</a> · <a href="../CHANGELOG.md">CHANGELOG</a> · weryfikacja sync: <code>pnpm docs:check</code></sub></div>
