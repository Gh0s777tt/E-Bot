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
![Ulepszenia](https://img.shields.io/badge/Ulepszenia_5×-✅-E50914?labelColor=0a0a0a)
![Rozbudowa](https://img.shields.io/badge/Rozbudowa_A–F-✅-E50914?labelColor=0a0a0a)

</div>

> Status zadań — **aktualizowany na bieżąco** (`[x]` zrobione, `[ ]` w planie). Wersjonowanie: `CHANGELOG.md`.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ✅ Po Fazie 7 — 5 torów ulepszeń (analiza popularnych botów)
- [x] Tor 1 — bezpieczeństwo: fail‑closed auth (`AUTH_SECRET`/właściciel) + `timingSafeEqual` Ko‑fi + audit log (`/audit`)
- [x] Tor 2 — captcha obrazkowa + min. wiek konta + alt‑detection w anti‑raid
- [x] Tor 3 — gra w liczenie + `/fun` + Invite Tracker (`/invites`)
- [x] Tor 4 — ekonomia++: interaktywny blackjack + ekwipunek/itemy
- [x] Tor 5 — infra: cache sweepers + zero‑dep logger strukturalny + detekcja zmian w sync
- [ ] (opcjonalnie, odłożone) Realtime push (supabase‑js) · pino · i18n PL/EN · Playwright E2E

## ✅ Rozbudowa „każda funkcja" — 7 torów (A–F)
- [x] A1 — profil `/profile` (karta canvas) + silnik 13 odznak
- [x] A2 — questy dzienne/tygodniowe (`/quests`) + punkty sezonu
- [x] B — ekonomia++: itemy z efektem + marketplace (`/market`) + ruletka
- [x] C — AI asystent: persona + vision (`/describe`) + RAG-lite pomoc
- [x] D — tickety: przejmowanie (claim) + auto-close SLA
- [x] E — analityka: minuty voice + tygodniowy digest
- [x] F — menu ról dropdown (`/rolemenu`) + zaplanowane ogłoszenia (`/schedule`)
- [x] G giveaway++ · H loteria · I skórki kart · J dzienny AI-digest · K aplikacje/Appy · L analityka per-user (top+heatmapa) · M publiczny web · N Twitch sub→rola (kod; aktywacja = OAuth twórcy) · O automatyzacje IFTTT

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

## 🔄 Faza 3 — Integracja bot↔chmura *(rdzeń gotowy)*
- [x] Bot pisze heartbeat `bot_status` do Supabase (panel czyta status na żywo; offline przy zamknięciu)
- [x] Bot stosuje `bot_presence` (`setPresence`) — synchronizacja z panelu co 60 s
- [x] Bot czyta whitelistę anti‑nuke + ustawienia powiadomień z Supabase (`settings-sync` → lokalny SQLite; zmiany z bota wracają mirror‑upem)
- [x] Endpoint GH0ST `link-status` → realny status powiązania w Profilu (endpoint w ghost-empire + panel `/profile`)
- [x] Endpoint zdrowia bota → `/api/health` (+ alert „bot down" przez Vercel Cron) *(Faza 6/B7)*

## ✅ Faza 4 — Wzrost
> 📋 Szczegółowy plan (architektura, model danych, podział bot↔panel): [`FAZA-4-PLAN.md`](FAZA-4-PLAN.md)
- [x] Tickety — panel (config + lista) **+ bot** (`/ticket otwórz/zamknij`, prywatne wątki → Supabase)
- [x] Leveling / XP — panel (config + ranking) **+ bot** (XP czat/voice, awanse, role‑nagrody → Supabase)
- [x] Reaction roles — panel `/roles` + bot (role za reakcje, `GuildMessageReactions`)
- [x] Komendy AI — `/ai` (DeepSeek/OpenAI) z twardym dziennym limitem (panel `/ai` + `ai_usage`)
- [x] Webhooki EventSub (zamiast pollingu) — webhook na Vercel + subskrypcja `stream.online` *(Faza 5)*
- [x] Statystyki — strona `/stats` (XP/AI/tickety/biblioteka) *(Faza 5)*

## ✅ Faza 5 — Statystyki + EventSub
- [x] Strona `/stats` — wykresy zużycia AI (14 dni), top XP, tickety, biblioteka (CSS/SVG)
- [x] Twitch EventSub — webhook `/api/twitch/eventsub` (HMAC + challenge), subskrypcja `stream.online` → natychmiastowe ogłoszenie live
- [x] Hosting bota 24/7 — Railway (Dockerfile, heartbeat zweryfikowany)

## ✅ Faza 6 — „Zrób wszystko" (rozbudowa partiami B1–B7)
- [x] **B1** — Powitania + autorole (`/welcome`) + Automod (`/moderation`)
- [x] **B2** — Komendy moderacji `/mod warn|timeout|clear|warnings` + historia (`mod_cases`)
- [x] **B3** — Pickery ról/kanałów w panelu (dropdowny zamiast ID)
- [x] **B4** — Narzędzia twórcy (`/creator`): auto‑wydarzenie na live + relay klipów
- [x] **B5** — Engagement: button‑role, `/remind`, `/giveaway`, starboard, temp‑voice
- [x] **B6** — Biblioteka 2.0: lista życzeń (`/wishlist`) + ręczne dodawanie gier z IGDB
- [x] **B7** — Infra/jakość: Vitest+CI, alert „bot down" (health+cron), handlery błędów, cache TTL
- [x] **Playwright E2E** (0.45.2: proxy/login/`/p/*`/health) · [ ] (przyszłość) pełny Sentry (DSN), Redis (instancja), Supabase Realtime

## 🔄 Faza 7 — „Wszystko + pełna personalizacja" (partiami F1–F10)
- [x] **F1** — Centrum sterowania (`/modules` on/off) + MessageEditor (markdown/emoji/czcionki Unicode/zmienne/live‑preview) + ColorField/GradientField + własny HEX akcentu
- [x] **F2** — Karty rang `/rank` (canvas: gradient + czcionka) + baner powitalny + panel `/appearance`
- [x] **F3** — Ekonomia serwera `/eco` (daily/work/rob/pay/bank/gamble/slots/shop/buy/top) + panel + sklep ról
- [x] **F4** — Leveling++ (mnożniki XP, no‑XP, anti‑AFK voice, custom level‑up, stack ról, `/prestige`)
- [x] **F5** — Tickety++ (`/ticketpanel` przycisk→modal, transkrypty HTML→log+DM, oceny ⭐)
- [x] **F6** — Bezpieczeństwo++
  - [x] **F6.1** — Kary + sprawy: `/mod kick|ban|tempban|unban|note`, `/case`, auto‑unban (`temp_bans`)
  - [x] **F6.2** — Logi serwera: zdarzenia (wiadomości/członkowie/bany/role/kanały/voice) → kanał, panel `/logging`
  - [x] **F6.3** — Weryfikacja (gate‑przycisk `/verifypanel` → rola) + anti‑raid (fala wejść → akcja, bramka wieku konta)
  - [x] **F6.4** — Modmail (DM ↔ wątek na serwerze; relay obustronny, `!close`)
- [x] **F7** — Społeczność
  - [x] **F7.1** — Sugestie (`/suggest` + głosowanie + decyzje moderacji) + ankiety (`/poll`)
  - [x] **F7.2** — Komendy własne (prefiks → odpowiedź) + autoresponder (słowa-klucze)
  - [x] **F7.3** — Urodziny (`/birthday`) + AFK (`/afk`) + highlighty (`/highlight`)
  - [x] **F7.4** — Liczniki kanałów (`/counters`: członkowie/boosty/kanały/role w nazwach)
- [x] **F8** — AI++
  - [x] **F8.1** — `/tldr` (podsumowanie kanału) + `/translate` (tłumaczenie) + wspólny `lib/ai.mts`
  - [x] **F8.2** — Czat z pamięcią (`/ai` + `nowa`) + `/imagine` (OpenAI dall-e-3)
  - [x] **F8.3** — AI‑moderacja (OpenAI moderation → usuń/ostrzeż/loguj)
- [x] **F9** — Gaming unikat
  - [x] **F9.1** — Free‑games feed (Epic) + patch‑notes (Steam news)
  - [x] **F9.2** — Backlog gier (`/backlog add|list|set|remove`)
  - [x] **F9.3** — Donejty Ko-fi (webhook → kanał) + price‑tracking ITAD (lista życzeń → alerty promocji). ℹ️ Twitch sub→rola odłożone (OAuth twórcy)
- [x] **F10** — Analityka + Infra
  - [x] **F10.1** — Wykresy aktywności serwera (`activity_daily` → `/stats`)
  - [x] **F10.2** — Sezonowe rankingi levelingu (`/hof` + miesięczny hall of fame + opcjonalny reset)
  - [x] **F10.3** — Sentry (zero‑dep, DSN‑gated) w bocie + panelu. ✅ Playwright E2E dodane (0.45.2). ℹ️ i18n pominięte (opcjonalne na przyszłość)

## 🔜 Faza 8 — Fundament customizacji + pogłębienie (partiami)
> Cel: maks. customizacja każdej funkcji, zaawansowany edytor wszędzie, lepszy UX + jakość.
- [x] **Inline toggle modułów** — włącz/wyłącz na stronie funkcji (auto-pasek `ModuleBar`; źródło prawdy = Centrum sterowania) *(0.46.0, [#098])*
- [x] **Message Studio** — uniwersalny edytor embed+tekst (live-preview 1:1, licznik znaków, smallcaps/fonty, emoji+custom emoji, szablony) *(0.47.0, [#100]; 1. odbiorca: Powitania)*
- [ ] **Pickery/emoji wszędzie** — emoji (std + serwerowe) w Studio + `getGuildMeta.emojis` ✅ (0.47.0); rozszerzanie na pozostałe formularze w toku
- [x] **Smallcaps** (+ czcionki Unicode) w edytorze *(0.47.0)* · [ ] fonty w całym UI · [ ] **Compact UI** (mniej scrollowania)
- [ ] Epiki: ✅ **Tickets 2.0** (0.48.0, [#101]) · ✅ **Applications 2.0** (0.49.0, [#102]) · ✅ **Reaction roles 2.0** (0.50.0, [#103]) · Automod/Security 2.0 · Creator+Social · Notifications 2.0 · Donate 2.0 · Levels 2.0 · AI 2.0 · Game Library 2.0 · Integracje

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
<div align="center"><sub>Ostatnia aktualizacja: 2026‑06‑07 · powiązane: <a href="ROADMAP.md">ROADMAP</a> · <a href="../CHANGELOG.md">CHANGELOG</a></sub></div>
