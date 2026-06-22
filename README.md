<!-- SYNC: v0.381.0 · #451 · 2026-06-22 — utrzymywane przez `pnpm docs:check` (badge wersji + blurb „Najnowsze") -->
<!-- ╔══════════════════════════════════════════════════════════════════╗ -->
<!-- ║                            E - B O T                              ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->

<div align="center">

<img src="dashboard/public/ghost-skull.png" width="120" alt="GH0ST EMPIRE" />

# 🎬 E‑BOT &nbsp;·&nbsp; GH0ST EMPIRE

### ⟣ Discordowe ramię imperium · biblioteka gier „Netflix" · live · bezpieczeństwo ⟣

<br/>

![Wersja](https://img.shields.io/badge/wersja-0.381.0-E50914?style=for-the-badge&labelColor=0a0a0a)
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

</div>

<br/>

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ✨ O projekcie

**E‑Bot** to wielomodułowy ekosystem twórcy: bot Discord (discord.js v14), agregator
biblioteki gier w stylu **Netflix** (Steam · PlayStation · GOG → IGDB) oraz **panel
sterowania** (Next.js, hostowany na Vercel, dane w Supabase). E‑Bot jest **Discordowym
ramieniem GH0ST EMPIRE** — nalicza **Ghost Tokens (GT)** za aktywność i łączy konta z portalem.

> Right‑sized z planu SaaS (`docs/ANALIZA.md`) → wąski, działający produkt zamiast 75 modułów.

<br/>

## 🧩 Moduły

| Moduł | Opis | Status |
|:--|:--|:--:|
| 🎮 **Biblioteka gier** | Steam (58) + PlayStation (121) = **179**, okładki/metadane z IGDB → SQLite/Supabase | ![](https://img.shields.io/badge/-stabilny-E50914?labelColor=0a0a0a) |
| 🖥️ **Dashboard** | Panel GH0ST (Przegląd, Biblioteka, Live, Bezpieczeństwo, Integracje, Komendy, Ekonomia, Profil, Ustawienia) | ![](https://img.shields.io/badge/-live-E50914?labelColor=0a0a0a) |
| 🤖 **Bot Discord** | ~95 slash‑komend (moderacja, ekonomia, leveling, tickety, AI, gry…), 59 usług w tle, **i18n 14 języków** | ![](https://img.shields.io/badge/-stabilny-E50914?labelColor=0a0a0a) |
| 🛡️ **Anti‑Nuke** | Detekcja audit‑log, progi, kary, whitelist | ![](https://img.shields.io/badge/-stabilny-E50914?labelColor=0a0a0a) |
| 📡 **Powiadomienia live** | Twitch · Kick · YouTube · Rumble (polling) | ![](https://img.shields.io/badge/-stabilny-E50914?labelColor=0a0a0a) |
| 💰 **Ekonomia GH0ST** | GT za czat/voice, `/link`, stawki z portalu | ![](https://img.shields.io/badge/-aktywny-E50914?labelColor=0a0a0a) |

<br/>

## 🗺️ Architektura

```mermaid
flowchart LR
  U([👥 Użytkownicy Discord]) --> EB
  EB["🤖 E-Bot<br/>discord.js v14"] -->|komendy · anti-nuke · powiadomienia| U
  EB -->|GT award · link kont| GE[("🟥 GH0ST EMPIRE<br/>Portal · Postgres")]
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
# 1) Biblioteka gier → SQLite (Steam + PSN + GOG)
node ingest/sync.mts
npm run sync:cloud          # ingest + wysyłka do Supabase

# 2) Dashboard (panel GH0ST) — http://localhost:3001
cd dashboard && npm install && npm run dev

# 3) Bot Discord
cd bot && npm install && npm run deploy   # rejestracja slash-komend
cd bot && npm start                       # bot online + powiadomienia
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
<summary><b>📡 Powiadomienia live + 💰 Ekonomia GH0ST</b></summary>

- Live: Twitch · Kick · Rumble (polling 60 s), YouTube (opcjonalnie); embedy w kolorach platform
- Ekonomia: GT za wiadomości i voice (stawki z `/api/bot/config`), `/link` łączy konto z portalem
- Panel **Ekonomia** pokazuje stawki na żywo; **Live** auto‑odświeża się co 30 s
</details>

<details>
<summary><b>🖥️ Dashboard (GH0ST look)</b></summary>

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

Najnowsze: **v0.381.0** — ♻️🧪 **DRY helpera cooldownu**: formuła `minutesSince` (`null→∞` / `/60_000`) była w **3 kopiach** (store/cards/pets) — teraz **1 źródło prawdy** (cards/pets re-eksportują `store.minutesSince`), 2 kopie usunięte (0 zmian zachowania) + rygiel anty-redup (`===` ta sama referencja). Suite 49 plików / 423 testy. Wcześniej: **v0.380.0** — 🧪📈 **rygiel katalogu giełdy** ([`stocks-catalog.test.ts`](bot/src/economy/stocks-catalog.test.ts), 6×): `findStock` (case-insensitive+trim) + **kontrakt uppercase** (symbole `STOCKS` muszą być WIELKĄ literą — inaczej niezznajdowalne) + pasmo cen per-spółka `base × [max(0.15,1−0.38·vol), 1+0.38·vol]`; mutation-proof, 0 zmian produkcyjnych. Suite 48 plików / 421 testów. Wcześniej: **v0.379.0** — 🧪🎨 **rygiel presetów motywu** ([`themes.test.ts`](dashboard/lib/themes.test.ts), 4×): kontrakt CSS `rgb(var(--accent-rgb))` — `rgb`/`hover`/`dark` = triplet `"R G B"` (spacje, 0–255; przecinek/>255 = cicho zepsuty akcent panelu) + unikalne id; mutation-proof, 0 zmian produkcyjnych. Suite 47 plików / 415 testów. Wcześniej: **v0.378.0** — 🧪🌍 **rygiel listy języków bota w panelu** ([`botLocales.test.ts`](dashboard/lib/botLocales.test.ts), 5×): `normalizeBotLocale` (fallback `auto`) + **spójność cross-package** — opcje panelu (mirror) == 14 języków bota + `auto`; rozjazd = panel proponuje język, którego bot nie obsługuje; mutation-proof, 0 zmian produkcyjnych. Suite 46 plików / 411 testów. Wcześniej: **v0.377.0** — 🧪🖼️ **rygiel proxowania okładek** ([`cover.test.ts`](dashboard/lib/cover.test.ts), 8×): `proxied` (data: bez proxy — inline; http(s) → `/api/img` z `encodeURIComponent`) + `coverFallbacks` (łańcuch zapasowy zawsze z placeholderem, dedup); mutation-proof, 0 zmian produkcyjnych. Suite 45 plików / 406 testów. Wcześniej: **v0.376.0** — 🧪🎨 **rygiel spójności stylu kart bot↔panel** ([`cardstyle-consistency.test.ts`](bot/src/lib/cardstyle-consistency.test.ts), 4×): oferta czcionek panelu == możliwości renderu bota (`CARD_FONTS` + domyślny `RANKCARD_DEFAULT`/`CARD_STYLE_DEFAULT`) — rozjazd = panel proponuje font, którego bot nie ma → cichy fallback; mutation-proof, 0 zmian produkcyjnych. Suite 44 pliki / 398 testów. Wcześniej: **v0.375.0** — 🧪🛡️ **rygiel rate-limitu panelu** ([`rateLimit.test.ts`](dashboard/lib/rateLimit.test.ts), 8×): sliding-window anty-flood publicznych sinków `/api/sentry`+`/api/hook` — off-by-one limitu, reset po `windowMs`, ścisła granica okna (`<`), izolacja kluczy + `clientIp` (XFF→x-real-ip→unknown); fałszywy zegar, mutation-proof, 0 zmian produkcyjnych. Suite 43 pliki / 394 testy. Wcześniej: **v0.374.0** — 🧪🎭 **rygiel menu ról** ([`rolemenu.test.ts`](bot/src/engagement/rolemenu.test.ts), 8×): twarde limity Discorda dla select-menu — **kap 25 opcji**, label ≤100 / placeholder ≤150 / description ≤100 (przekroczenie = API odrzuca publikację `/rolemenu`) + filtr opcji bez `roleId` + `buildRoleMenu` null gdy pusto; mutation-proof, 0 zmian produkcyjnych. Suite 42 pliki / 386 testów. Wcześniej: **v0.373.0** — 🧪🛡️ **rygiel diagnozy uprawnień anti-nuke** ([`antinuke-perms.test.ts`](bot/src/security/antinuke-perms.test.ts), 5×): `missingPerms` — `/antinuke status` musi pokazać realne braki (regresja = bot raportuje „OK", a nie może banować = cicha dziura w obronie); zaryglowane mapowanie flaga→etykieta + kolejność, brak `me`→`["nieznane"]`; mutation-proof, 0 zmian produkcyjnych. Suite 41 plików / 378 testów. Wcześniej: **v0.372.0** — 🧪👋 **rygiel renderowania pożegnań/boostu** ([`farewell.test.ts`](bot/src/farewell.test.ts), 11×): `renderVars` (literalne replaceAll — **wszystkie** wystąpienia, odporne na regex) + `memberVars` (`{user}`/`{username}`/`{server}`/`{memberCount}`, fallback) + `farewellEmbed`; mutation-proof, 0 zmian produkcyjnych. Suite 40 plików / 373 testy. Wcześniej: **v0.371.0** — 🧪🐹 **rygiel ekonomii petów** ([`pets-gift.test.ts`](bot/src/economy/pets-gift.test.ts), 9×): `giftValue` (dochód pet = `giftBase × poziom × sytość`; factor 0.2–1.0, fałszywy zegar) + kap `petLevel` 50 + katalog `SPECIES`/`findSpecies`; mutation-proof, 0 zmian produkcyjnych. Suite 39 plików / 362 testy. Wcześniej: **v0.370.0** — 🧪🌐 **rygiel runtime'u i18n** ([`t.test.ts`](bot/src/i18n/t.test.ts), 9×): funkcja `t()` (każdy zlokalizowany string przez nią przechodzi) — interpolacja `{placeholder}` (wszystkie wystąpienia, nieznana zmienna dosłownie, liczby koercjonowane, bez vars surowo) + **łańcuch fallback** `locale→en→pl→sam klucz` (nigdy `undefined`); mutation-proof, 0 zmian produkcyjnych. Suite 38 plików / 353 testy. Wcześniej: **v0.369.0** — 🧪🃏 **rygiel gachy** ([`cards.test.ts`](bot/src/economy/cards.test.ts), 12×): drabina rzadkości (`RARITY` — waga **maleje**, sprzedaż **rośnie**, suma 100) + integralność `CARDS` (każda rzadkość ma kartę) + `findCard`/`rarityRank` (kolejność mythic<…<common) + `drawCard` (zawsze prawidłowa karta, wszystkie 5 rzadkości osiągalnych); mutation-proof, 0 zmian produkcyjnych. Suite 37 plików / 344 testy. Wcześniej: **v0.368.0** — 🧪🌍 **rygiel rejestru języków** ([`locales.test.ts`](bot/src/i18n/locales.test.ts), 11×): **dwukierunkowa spójność map** `LOCALE_TO_DISCORD`↔`DISCORD_TO_LOCALE` (anti-drift — komenda zarejestrowana pod kodem X musi rozwiązać się na właściwy język) + `isRtl` (dokładnie 1 RTL = `ar`) + `fromDiscordLocale` (warianty `en-US`/`pt-BR`/`zh-CN`→baza); mutation-proof, zmiana produkcyjna = 1× `export`. Suite 36 plików / 332 testy. Wcześniej: **v0.367.0** — 🧪💬 **rygiel autorespondera** ([`responder.test.ts`](bot/src/community/responder.test.ts), 6×): wydzielony `matchTrigger` (3 tryby `contains`/`exact`/`starts`, case-insensitive) — **`exact` to ścisła równość, nie podłańcuch** + **pusty trigger nigdy nie pasuje** (anti-spam: reaguje na każdą wiadomość); refactor behavior-preserving, mutation-proof. Suite 35 plików / 321 testów. Wcześniej: **v0.366.0** — ♻️🧪 **DRY krzywej levelingu**: formuła `5L²+50L+100` była w **5 kopiach** (rank/profile/prestige/giveaways/leveling) — teraz **1 źródło prawdy** ([`leveling.mts`](bot/src/leveling.mts) eksportuje `levelInfo`), 4 lokalne kopie usunięte (−34 linie, 0 zmian zachowania) + rygiel `levelInfo` (+4 testy, mutation-proof). Suite 34 plików / 315 testów. Wcześniej: **v0.365.0** — 🧪🚦 **rygiel bram funkcji** ([`feature-toggles.test.ts`](bot/src/community/feature-toggles.test.ts), 14× = 7×2 parsery): `afkEnabled`/`highlightsEnabled` — **fail-safe OFF** (uszkodzony JSON / brak configu → `false`, nigdy wyjątek/przypadkowe włączenie) + override per-serwer + izolacja A↛B; mutation-proof, 0 zmian produkcyjnych (suite 34 plików / 311 testów). Wcześniej: **v0.364.0** — 🧪🎁 **rygiel losowania giveawayów** ([`giveaways.test.ts`](bot/src/engagement/giveaways.test.ts), 7×): `weightedPick` — **bez podwójnych zwycięzców** (dedup), nie więcej niż uczestników, dolny clamp wagi (`Math.max(1,…)` — waga 0/ujemna nadal uprawniona); niezmienniki w pętli 200 przebiegów (dowolne tasowanie); mutation-proof, 0 zmian produkcyjnych (suite 33 plików / 297 testów). Wcześniej: **v0.363.0** — 🧪⏱️ **rygiel warstwy danych eko** ([`store-config.test.ts`](bot/src/economy/store-config.test.ts), 13×): **`minutesSince`** — rdzeń bramek czasowych (`null`→`+Infinity`, dzielnik `60_000`, przyszłość→ujemne; fałszywy zegar `vi`) + **`ecoConfig`** per-serwer override+fallback global (Etap K, merge płytki, uszkodzony JSON→default, izolacja A↛B) + sanity `ECO_DEFAULT` (`workMin≤workMax`, procenty ∈ [0,100]); mutation-proof, 0 zmian produkcyjnych (suite 32 plików / 290 testów). Wcześniej: **v0.362.0** — 🧪🎨 **rygiel katalogu skórek** ([`skins.test.ts`](bot/src/economy/skins.test.ts), 9×): **cross-module spójność fontu** (każda `style.font` ∈ `CARD_FONTS` — inaczej renderer cicho podmienia na Poppins i user nie dostaje opłaconej skórki) + integralność (5 skórek, `classic` darmowa, drabina cen) + walidacja stylu (hex/angle); mutation-proof, 0 zmian produkcyjnych (suite 31 plików / 277 testów). Wcześniej: **v0.361.0** — 🧪🏅 **rygiel progów odznak** ([`badges.test.ts`](bot/src/community/badges.test.ts), 19×): dokładne progi `>=` 13/13 (poziom/prestiż/majątek/streak/zaproszenia/gry — odznaki permanentne, off-by-one = na zawsze) + izolacja wymiaru (każdy predykat patrzy tylko na swoje pole) + anti-rozjazd test↔produkcja; mutation-proof, 0 zmian produkcyjnych (suite 30 plików / 268 testów). Wcześniej: **v0.360.0** — 🧪⏳ **rygiel TTL efektów itemów** ([`effects.test.ts`](bot/src/economy/effects.test.ts), 11×): granica wygaśnięcia `exp < now` (ścisłe `<` — now===exp jeszcze działa, +1 ms gaśnie; fałszywy zegar `vi`) + mnożnik `xp2` + izolacja klucza `guild:user:effect`; mutation-proof, 0 zmian produkcyjnych (suite 29 plików / 249 testów). Wcześniej: **v0.359.0** — 🧪🃏 **rygiel blackjacka** ([`blackjack.test.ts`](bot/src/economy/blackjack.test.ts), 10×): **miękki as** (`val` — as 11→1 przy buscie, pojedynczo i tylko ile trzeba) + integralność talii (`freshDeck` — 52 karty, 0 duplikatów, suma 380); mutation-proof, zmiana produkcyjna = tylko `export` (3 linie). Suite 28 plików / 238 testów. Wcześniej: **v0.358.0** — 🧪💍 **rygiel logiki małżeństw (/marry)** ([`marriage.test.ts`](bot/src/lib/marriage.test.ts), 8×): symetria zapisu (oba kierunki + ten sam `since`) + **strażnik lustra przy rozwodzie** (re-marriage nie kasuje świeżego związku partnera) + izolacja multi-tenant; mutation-proof, 0 zmian produkcyjnych (suite 27 plików / 228 testów). Wcześniej: **v0.357.0** — 🔧🏁 **domknięcie znalezisk audytu:** `ingest` otypowany (`pnpm typecheck` obejmuje **4 pakiety**, type-clean) + `pnpm lint` exit 0 (drift wyczyszczony, `next-env` w ignore biome); `twitch_sub`/`kofi` zweryfikowane jako poprawne (toggle bramkuje webhook panelu). Wszystkie 4 znaleziska zamknięte. Wcześniej: **v0.356.0** — 🔧🔍 **pełny audyt funkcjonalny** (kod kompletny: 95+3 komend · 57/57 usług · 93 trasy API · 0 stub) + naprawa `pnpm typecheck`. Wcześniej: **v0.355.0** — 🧪🌍🏁 **parytet i18n całego projektu** (bot+panel+how-it-works). Wcześniej: **v0.354.0** — 🧪🌍 **rygiel parytetu i18n panelu** (UI 1430×14 + MODES). Wcześniej: **v0.353.0** — 🧪🌍 **rygiel parytetu i18n bota** + fix `error.generic` w 12 jęz. Wcześniej: **v0.352.0** — 🧪 **rygiel matematyki ekonomii** (giełda·pety·format). Wcześniej: **v0.351.0** — 🧪 **rygiel progów odznak-tierów** (`tierAtLevel`/`nextTier`). Wcześniej: **v0.350.0** — 🧪 **rygiel krzywej XP→poziom** (`levelForXp`, `5L²+50L+100`). Wcześniej: **v0.349.0** — 🧪🛡️🏁 **rygiel anti-nuke `mergeConfig` + KONIEC toru bezpieczeństwa** (heat·antiraid·antinuke). Wcześniej: **v0.348.0** — 🧪🛡️ **rygiel detekcji fali anti-raid** (`detectWave`, okno+próg). Wcześniej: **v0.347.0** — 🧪🛡️ **rygiel scoringu anty-spam (heat)** — wagi czynników `messageHeat`. Wcześniej: **v0.346.0** — 🧪 **rygiel spójności `MIGRATED_GUILD_KEYS` (bot ⊆ panel)** — anty-rozjazd round-tripu zapisu multi-tenant. Wcześniej: **v0.345.0** — 🧪 **komplet testów izolacji pollerów (7/7)** + rdzeń + harmonogram (suite 16 plików / 106 testów). Wcześniej: **v0.344.0** — 🧪 **testy scheduledPosts:** logika harmonogramu (tryby/okno/**Europe/Warsaw+DST**) + izolacja state. Wcześniej: **v0.343.0** — 🧪 **rygiel pricetracker:** `guild_id` na wishliście (anty-IDOR, mutacja zwala 3/4). Wcześniej: **v0.342.0** — 🧪 **rygiel runtime freegames:** routing per-serwer + dedup `g:<id>:freegames_seen` (mutacja zwala 2/4). Wcześniej: **v0.341.0** — 🧪 **rygiel izolacji per-serwer (bot):** [`db.isolation.test.ts`](bot/src/lib/db.isolation.test.ts) (8×) — `getGuildSettings`/`configWriteKey`, anty-leak B→A. Wcześniej: **v0.340.0** — 🪵🏁 **loggery — KONIEC sweepu:** reszta bota (62 pliki / 154 wywołania) `console.*` → `log.*` ⇒ **0 `console` w `bot/src`**; po drodze fix cichego zaniku błędu (7× catch-handler interakcji w `index`). Wcześniej: **v0.339.0** — 🪵 **loggery strukturalne:** 7 feedów/pollerów (3 gaming-feedy · `aidigest` · `social` · `clips` · `scheduledPosts`) `console.*` → `log.*` (JSON-lines, gating `LOG_LEVEL`; batch 1 sweepu). Wcześniej: **v0.338.0** — 🔐🏁 **multi-tenant:** ostatnie 3 pollery per-serwer (`social_feeds`/`scheduled_posts`/`creator`) — **KONIEC migracji 9/9** globalnych configów (per-serwer + fallback + izolacja kanałów). Wcześniej: **v0.337.0** — 🔐 3 gaming-feedy per-serwer (`pricetracker` naprawił przeciek wishlisty). Wcześniej: **v0.336.0** — 🔐 `aidigest` per-serwer (wzorzec pollera, przetestowany). Wcześniej: **v0.335.0** — 🔐 `aihelp_config` per-serwer (2/~9, wzorzec aimod). Wcześniej: **v0.334.0** — 🔐 `aimod_config` per-serwer (wzorzec, AI-moderacja czytała config globalnie). Wcześniej: **v0.333.0** — ⚡ parytet hardeningu proxy okładek `/api/img` (edge-cache + timeout 8s). Wcześniej: **v0.332.0** — ♿ klawiatura na overlayach panelu (`GameDetailModal` focus-trap; `Assistant`/`TourGuide` tylko `Escape`). Wcześniej: **v0.331.0** — ♿ `Escape` + restore focusu na dropdownie języka w GameVault. Wcześniej: **v0.330.0** — 🐛♿ modal szczegółów gry **nie dawał się zamknąć** (`AnimatePresence` + React 19) → render warunkowy + a11y dialogu (`useFocusTrap`→web/). Wcześniej: **v0.329.0** — ♿ kontrast WCAG AA na 12 etykietach panelu (np. `/60`=3.2:1 → solidny `text-muted` 7.2:1; logowanie objęte). Wcześniej: **v0.328.0** — 🧹 ujednolicona liczba usług (`~40`→**59** wg audytu) + martwe komentarze i18n + dedup blurba. Wcześniej: **v0.327.0** — ↔️🖼️ embla `direction:'rtl'` w karuzeli GameVault (poprawny RTL) + fundament `images.remotePatterns` (oba `next.config.mjs`) pod `next/image`. Wcześniej: **v0.326.0** — 🧪 testy izolacji multi-tenant (`isolation.test.ts`, mock Supabase) — rygiel anty-IDOR: usunięcie scope `guild_id` = czerwony CI (vitest 36/36). Wcześniej: **v0.325.0** — 🛟 `window.confirm` przed nieodwracalnym usunięciem w panelu (wishlist + sklep), z nazwą pozycji — 0 nowych kluczy i18n. Wcześniej: **v0.324.0** — 🧰 deklaracja `engines` (Node ≥24 · pnpm ≥11) w 5 pakietach — jawny kontrakt toolchainu. Wcześniej: **v0.323.0** — 🛡️ rate-limit publicznego sinku `/api/sentry` (10/min per IP + cap 16 KB) + wspólny helper `lib/rateLimit.ts` (`/api/hook` zdedup.). Wcześniej: **v0.322.0** — 🛡️ **P0 (re-audyt) — KONIEC tieru:** walidacja `zod` (`safeParse`) na globalnym configu `integrations` — koniec ślepego `as IntegrationConfig`. Wcześniej: **v0.321.0** — 🛡️ domknięcie strażników — **SSRF IPv4-mapped IPv6** (`::ffff:127.0.0.1`/metadata omijały guard runnera) + **`CRON_SECRET` timing-safe** (`timingSafeEqual` zamiast `===`). Wcześniej: **v0.320.0** — 🛡️ web/ resilience — `safeGenres` (jeden uszkodzony wiersz nie ubije strony) + granice błędu `error.tsx`/`global-error.tsx` (koniec białego ekranu GameVault). Wcześniej: **v0.319.0** — 🔭 `captureError` w krytycznych `catch` (billing webhook + auth callback) — ciche awarie premium/logowania trafiają do Sentry. Wcześniej: **v0.318.0** — 🔐 IDOR shop/tickets (cross-tenant). Wcześniej: **v0.317.0** — ♿ focus-trap na `CommandPalette`. Wcześniej: **v0.316.0** — ♿ prymityw `useFocusTrap` + dialog `MobileNav`. Wcześniej: **v0.315.0** — ⚡ `GuildSwitcher` `router.refresh` + `loading.tsx` serwerowy. Wcześniej: **v0.314.0** — ⚡ edge-cache `/api/img` (potwierdzony MISS→HIT). Wcześniej: **v0.313.0** — 🔭 hook `onRequestError` → Sentry (błędy serwera widoczne). Wcześniej: **v0.312.0** — 🔐 bramka instance-admin na 4 globalnych configach (`integrations`/`ai`/`locale`/`presence`). Wcześniej: **v0.311.0** — 🧪 testy rdzenia (20 vitest) + **E2E Playwright w CI** + fix SSRF IPv6 `[::1]`. Wcześniej: **v0.310.0** — 🔐 bramka **instance-admin** na sekretach globalnych (Ko-fi/webhook-relay) w self-serve. Wcześniej: **v0.309.0** — 🔐 **cz.2:** ujednolicone uprawnienia bota + sekret admina na `web/ /api/settings`. Wcześniej: **v0.308.0** — 🔐 **nagłówki bezpieczeństwa HTTP** (CSP / HSTS / `X-Frame-Options` / `nosniff` / `Referrer-Policy`) w panelu + GameVault + **anty-eskalacja `/roleperms`+`/rolecopy`**. Wcześniej: **v0.307.0** — 🔎 **Audyt całości + gotowość publiczna** (kod funkcjonalnie kompletny — 95 komend / 59 usług / 46 stron / 92 trasy API, 0 TODO/stub; **pierwszy git tag + GitHub release**). Wcześniej: CI `workflow_dispatch` (v0.306.0), przewodnik wdrożenia + monitoring (v0.305.0, [`docs/AKTYWACJA-DEPLOY.md`](docs/AKTYWACJA-DEPLOY.md) — Railway/Vercel env + cron-job.org/Uptime.com wpięte w `/api/health`+`/api/health/check`).  Wcześniej: `undici` → 6.27.0 — 4 alerty Dependabota zamknięte (v0.304.0, override w [`pnpm-workspace.yaml`](pnpm-workspace.yaml)), bramka typów dla bota — `tsc`+biome w CI (v0.303.0, 14 błędów typów naprawionych), gotowość pod sharding >2500 serwerów (v0.302.0, [`shard.mts`](bot/src/shard.mts) `ShardingManager` + uodpornione `heartbeat`/`moderation`/`tempRoles`; [`docs/SHARDING.md`](docs/SHARDING.md)), reconciliation `ai_usage` per-serwer (v0.301.0) + domknięcie rezyduów F5 — `server_history`+`ai_usage` per-serwer (v0.300.0 🎉), Audyt #2 + naprawa F5 — scoping analityki `/stats` (v0.299.0, [`SECURITY-REVIEW-MARKETPLACE.md`](docs/SECURITY-REVIEW-MARKETPLACE.md)), retencja kohortowa — wykres D1/D7/D30 (v0.298.0, [`lib/retention.ts`](dashboard/lib/retention.ts), i18n ×14) + fundament danych (v0.297.0, `member_cohorts` + [`analytics/cohorts.mts`](bot/src/analytics/cohorts.mts) śledzi join/leave per-członka). Wcześniej **Marketplace M1–M6 w pełni domknięty**: przewodnik aktywacji community (v0.296.0, [`AKTYWACJA-COMMUNITY.md`](docs/AKTYWACJA-COMMUNITY.md) — env, dwa sekrety, `X-EBOT-Signature` HMAC, akcje, przykład Node.js), deklaracja triggera (`event`+`keywords`) w formularzu zgłoszeń (v0.295.0, [`CommunitySubmitForm`](dashboard/components/CommunitySubmitForm.tsx), i18n ×14), pluginy na `messageCreate` przez filtr słów-kluczy (v0.294.0, [`/api/internal/plugin-subscriptions`](dashboard/app/api/internal/plugin-subscriptions/route.ts), auth mostu w [`lib/pluginBridge.ts`](dashboard/lib/pluginBridge.ts)), most forwarduje cykl życia członka — `guildMemberRemove`+`guildBoost` (v0.293.0), auto-trigger z bota — most bot→panel (v0.292.0, [`/api/internal/plugin-event`](dashboard/app/api/internal/plugin-event/route.ts) → [`invokeGuildEvent`](dashboard/lib/pluginInvoke.ts)), toggle community per-serwer (v0.291.0), pola endpoint/secret w formularzu (v0.290.0), M6c trigger produkcyjny (v0.289.0, orchestrator [`lib/pluginInvoke.ts`](dashboard/lib/pluginInvoke.ts) + `/api/community/run`), M6c dry-run (v0.288.0), M6b akcje w Discordzie z per-akcja authz ([`lib/discordActions.ts`](dashboard/lib/discordActions.ts), v0.287.0), M6b start `setConfig` (v0.286.0, [`lib/pluginExecutor.ts`](dashboard/lib/pluginExecutor.ts)), M6a runner webhook (v0.285.0, [`lib/pluginRunner.ts`](dashboard/lib/pluginRunner.ts)), design M6 sandbox (v0.284.0, [`PLAN-M6-SANDBOX.md`](docs/PLAN-M6-SANDBOX.md)), self-review bezpieczeństwa multi-tenant (v0.283.0, 4 luki cross-tenant naprawione; [`SECURITY-REVIEW-MARKETPLACE.md`](docs/SECURITY-REVIEW-MARKETPLACE.md)), M3 config pluginów (v0.282.0), i18n moderacji + zgłoszeń community (v0.281.0), i18n onboardingu + linków (v0.280.0), onboarding „dodaj bota" (v0.279.0), formularz zgłoszeń community (v0.278.0), panel moderacji community (v0.277.0), community backend (v0.276.0), M5 billing Stripe (v0.275.0), M5 tiery/gating (v0.274.0), self-serve multi-tenant login (v0.273.0), interaktywny toggle marketplace (v0.272.0), strona `/marketplace` (v0.271.0), warstwa danych katalogu [`lib/pluginCatalog.ts`](dashboard/lib/pluginCatalog.ts) (v0.270.0), M1 chokepoint dostępu per-guild w `getPrimaryGuildId` (v0.269.0), warstwa multi-tenant [`lib/tenant.ts`](dashboard/lib/tenant.ts) (v0.268.0), schemat danych multi-guild (v0.267.0, additive), plan architektoniczny marketplace (v0.266.0), infra prod audyt + przewodnik (v0.265.0), Twitch sub→rola kod-ready (v0.264.0), `/stats` zakres + eksport CSV (v0.263.0); domknięte **i18n 14 jęz.** i **lustrzane RTL** (v0.254–260). Wcześniej: 14 stron tras (v0.258.0), strona główna (v0.257.0), chrom nawigacyjny (v0.255–256), fundament RTL `dir="rtl"` + audyt i18n 14 jęz. **1394×14** (v0.254.0). Wcześniej domknięta **i18n CAŁEJ powierzchni web**: panel 39/39 + współdzielone edytory + powierzchnia publiczna (login/`/p/leaderboard`/`/p/u/[id]`) + boilerplate (`error`/`404`/`loading`/metadane) + obraz OG profilu (fonty per-skrypt). Fundamenty: i18n treści „Jak to działa?" (37/37), web GameVault (+RTL), Architekt serwera, config per‑serwer (Etap K), 14 epików „2.0" (Faza 8).
Pełna, numerowana historia → [`CHANGELOG.md`](CHANGELOG.md).

<br/>

## 📁 Struktura repo

```
E-Bot/
├─ ingest/        📥 kolektory: steam · psn · gog · igdb → data/bot.db (+ Supabase)
├─ bot/           🤖 discord.js v14 — komendy, powiadomienia, anti-nuke, ekonomia
├─ dashboard/     🖥️ Next.js (panel GH0ST) → Vercel + Supabase
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
| [docs/DESIGN.md](docs/DESIGN.md) | System wizualny (GH0ST/Netflix) |
| [docs/SECRETS.md](docs/SECRETS.md) | Triage kluczy + rotacja |

<br/>

<div align="center">

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**© 2026 GH0ST EMPIRE — wszelkie prawa zastrzeżone.**
Made with 🩸 & ☕ · `E-BOT`

</div>
