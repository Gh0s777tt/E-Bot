<div align="center">

# 🧩 FAZY PROJEKTU &nbsp;·&nbsp; E‑BOT

![Faza 0](https://img.shields.io/badge/Faza_0-✅-E50914?labelColor=0a0a0a)
![Faza 1](https://img.shields.io/badge/Faza_1-✅-E50914?labelColor=0a0a0a)
![Faza 2](https://img.shields.io/badge/Faza_2-✅-E50914?labelColor=0a0a0a)
![Faza 3](https://img.shields.io/badge/Faza_3-✅-E50914?labelColor=0a0a0a)
![Faza 4](https://img.shields.io/badge/Faza_4-✅-E50914?labelColor=0a0a0a)
![Faza 5](https://img.shields.io/badge/Faza_5-✅-E50914?labelColor=0a0a0a)
![Faza 6](https://img.shields.io/badge/Faza_6-✅-E50914?labelColor=0a0a0a)
![Faza 7](https://img.shields.io/badge/Faza_7-🔄-E50914?labelColor=0a0a0a)

</div>

> Status zadań — **aktualizowany na bieżąco** (`[x]` zrobione, `[ ]` w planie). Wersjonowanie: `CHANGELOG.md`.

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
- [ ] (przyszłość) pełny Sentry (DSN), Redis (instancja), Supabase Realtime, Playwright E2E

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
- [ ] **F8** — AI++ *(w toku)*
  - [x] **F8.1** — `/tldr` (podsumowanie kanału) + `/translate` (tłumaczenie) + wspólny `lib/ai.mts`
  - [x] **F8.2** — Czat z pamięcią (`/ai` + `nowa`) + `/imagine` (OpenAI dall-e-3)
  - [ ] F8.3 — AI‑moderacja (wykrywanie toksyczności → akcja)
- [ ] **F9** — Gaming unikat (price‑tracking ITAD, free‑games feed, patch‑notes, backlog, Twitch sub→rola, donejty)
- [ ] **F10** — Analityka + Infra (wykresy aktywności, sezonowe rankingi levelingu, Realtime, Sentry z DSN, Playwright, i18n)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
<div align="center"><sub>Ostatnia aktualizacja: 2026‑06‑06 · powiązane: <a href="ROADMAP.md">ROADMAP</a> · <a href="../CHANGELOG.md">CHANGELOG</a></sub></div>
