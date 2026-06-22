<!-- SYNC: v0.412.0 · #482 · 2026-06-22 — utrzymywane przez `pnpm docs:check` (badge wersji + blurb „Najnowsze") -->
<!-- ╔══════════════════════════════════════════════════════════════════╗ -->
<!-- ║                            E - B O T                              ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->

<div align="center">

<img src="dashboard/public/ghost-skull.png" width="120" alt="GH0ST EMPIRE" />

# 🎬 E‑BOT &nbsp;·&nbsp; GH0ST EMPIRE

### ⟣ Discordowe ramię imperium · biblioteka gier „Netflix" · live · bezpieczeństwo ⟣

<br/>

![Wersja](https://img.shields.io/badge/wersja-0.412.0-E50914?style=for-the-badge&labelColor=0a0a0a)
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

Najnowsze: **v0.412.0** — 🧪⌨️ **rygiel opcji komend no-code** ([`customCommands.options.test.ts`](dashboard/lib/customCommands.options.test.ts), 6×): `buildCommandOptions` (refactor behavior-preserving z `saveCustomCommands`) — **RYGIEL kolejności** (wymagane przed opcjonalnymi — inaczej Discord odrzuca rejestrację `/custom-command`) + kap 25 + typ STRING/opis-fallback/filtr bezimiennych; mutation-proof (usunięcie sortu zwala kolejność, `slice(0,25)`→`(0,250)` zwala kap), 0 zmian zachowania. Suite 80 plików / 635 testów. Wcześniej: **v0.411.0** — 🧪💾 **rygiel snapshotu serwera** ([`backup.test.ts`](bot/src/lib/backup.test.ts), 6×): `captureGuild` (`Guild → Snapshot`, Architekt/Security) — **RYGIEL bezpieczeństwa restore** (pomija role zarządzane + @everyone — inaczej restore pada/dubluje) + sort wg pozycji + permissions jako string + kapy (≤100 ról / typy kanałów, kategorie pierwsze); mutation-proof (usunięcie `!r.managed` zwala filtr, `slice(0,100)`→`(0,1000)` zwala kap), 0 zmian produkcyjnych. Suite 79 plików / 629 testów. Wcześniej: **v0.410.0** — ♻️🧪 **DRY linku zaproszenia bota** (`botInviteUrl`): builder był w **2 kopiach** ([`invite.ts`](dashboard/lib/invite.ts) — powłoka panelu + [`enroll.ts`](dashboard/lib/enroll.ts) — onboarding M4), rozjazd defaultów `permissions`/`scope` = różne linki; teraz **1 źródło prawdy** (`enroll` re-eksportuje z `invite`), −11 linii, 0 zmian zachowania + rygiel anty-redup (`===` ta sama referencja, mutation-proof). Suite 78 plików / 623 testy. Wcześniej: **v0.409.0** — 🧪🔐 **rygiel podpisanej sesji** ([`session.test.ts`](dashboard/lib/session.test.ts), 10×): `signSession`/`verifySession`/`getAuthSecret` (cookie HMAC-SHA256, bramka autoryzacji panelu) — **RYGIEL anty-forge** (zły sekret / podmieniony body / podmieniony podpis → `null`) + **wygaśnięcie** (`exp` przeszłość → `null`) + **fail-closed sekretu** (produkcja + krótki/brak `AUTH_SECRET` → wyjątek, nie publiczny fallback); mutation-proof (pominięcie `if(!ok) return null` zwala anty-forge, `exp<Date.now()`→`>` zwala wygaśnięcie), 0 zmian produkcyjnych. Suite 77 plików / 622 testy. Wcześniej: **v0.408.0** — 🧪👁️ **rygiel trybów widoku panelu** ([`viewMode.test.ts`](dashboard/lib/viewMode.test.ts), 9×): `tierVisible`/`isViewMode`/`VIEW_MODES` (bramka widoczności nawigacji) — **RYGIEL przecieku dev** (próg `dev`: klucze/audyt widoczne tylko w trybie Developer, nie przeciekają do Prostego/Zaawansowanego) + esencja zawsze widoczna + monotoniczność + type guard + katalog 3 trybów; mutation-proof (`≤`→`<` zwala widoczność, usunięcie gałęzi `simple` zwala guard), 0 zmian produkcyjnych. Suite 76 plików / 612 testów. Wcześniej: **v0.407.0** 🎉 — 🧪🔗 **rygiel linku zaproszenia bota** ([`invite.test.ts`](dashboard/lib/invite.test.ts), 5×): `botInviteUrl` (OAuth „dodaj bota") — fail-safe braku `DISCORD_CLIENT_ID` → pusty string + **RYGIEL scope** (zawsze `bot`+`applications.commands` — inaczej slash-komendy się nie zarejestrują) + **permissions** domyślnie `8` (Administrator), env honorowane/przycięte; mutation-proof (usunięcie guardu zwala pusty link, `||'8'`→`||'0'` zwala domyślne uprawnienia), 0 zmian produkcyjnych. **Suite 75 plików / 603 testy (próg 600 przekroczony)**. Wcześniej: **v0.406.0** — 🧪🕐 **rygiel formatera czasu względnego** ([`insights.relTime.test.ts`](dashboard/lib/insights.relTime.test.ts), 6×): `relTime` („2 dni temu" na pulpicie, deterministyczny — `now` wstrzykiwany) — granice kubełków (sek/min/godz/dni) + **RYGIEL clampu przyszłości** (`ts > now` → „teraz", nie „za X") + granica dni (25 h → dni); asercje przez lustro `Intl` (odporne na ICU); mutation-proof (usunięcie `Math.max(0,…)` zwala clamp, `h<24`→`h<2400` zwala granicę dni), 0 zmian produkcyjnych. Suite 74 pliki / 598 testów. Wcześniej: **v0.405.0** — 🧪📊 **rygiel matematyki retencji kohortowej** ([`retention.test.ts`](dashboard/lib/retention.test.ts), 10×): `survived`/`mondayKey` (rdzeń D1/D7/D30 na `/stats`) — **RYGIEL granicy inkluzywnej** (przetrwał gdy `left===null` lub odszedł `≥ n·DAY`; dokładnie n-ty dzień liczy się) + **RYGIEL kubełka tygodnia** (niedziela należy do bieżącego tygodnia, nie następnego); mutation-proof (`≥`→`>` zwala granicę, `(getUTCDay()+6)%7`→`getUTCDay()` zwala kubełkowanie), 2× `export`. Suite 73 pliki / 592 testy. Wcześniej: **v0.404.0** — 🧪❓ **rygiel /trivia** ([`trivia.test.ts`](bot/src/commands/trivia.test.ts), 10×): bank pytań `BANK` + `pick` + `row` — **RYGIEL integralności** (4 odpowiedzi, poprawny indeks `c ∈ [0,3]` — inaczej pytanie niewygrywalne) + **spójność kategorii** (każda z 5 oferowanych kategorii ma ≥1 pytanie) + `pick` (zawsze trafia w kategorię, fallback do BANK); mutation-proof (`c:4` zwala indeks, `pick` `===`→`!==` zwala kategorię), 0 zmian zachowania (4× `export`). Suite 72 pliki / 582 testy. Wcześniej: **v0.403.0** — 🧪🔊 **rygiel kontroli kanału tymczasowego** ([`tempvoice.test.ts`](bot/src/engagement/tempvoice.test.ts), 6×): `canControlVoice` — refactor behavior-preserving (predykat z `isController`, bez stanu `owners`) + **RYGIEL bezpieczeństwa** (sterować może tylko właściciel LUB staff z `ManageChannels` — inaczej obcy przejmuje cudzy kanał) + guard niezcache'owanego membera (`permissions` string → `false`, nie wyjątek); mutation-proof (owner→`return false` zwala właściciela, usunięcie `ManageChannels` zwala staffa), 0 zmian zachowania. Suite 71 plików / 572 testy. Wcześniej: **v0.402.0** — 🧪🔘 **rygiel paneli ról-za-przyciski** ([`buttonroles.test.ts`](bot/src/engagement/buttonroles.test.ts), 8×): `buildRoleRows` — **twarde limity Discorda** (max 5 przycisków/rząd, max 5 rzędów = kap 25, nadmiar ucięty — inaczej API odrzuca publikację `/buttonpanel`) + kontrakt przycisku (`customId=role:<id>`, label domyślny, emoji opcjonalny); mutation-proof (kap `<5`→`<50` zwala test 25, `slice i+5`→`i+6` zwala ≤5/rząd), 0 zmian produkcyjnych. Suite 70 plików / 566 testów. Wcześniej: **v0.401.0** — 🧪⭐ **rygiel starboardu** ([`starboard.test.ts`](bot/src/engagement/starboard.test.ts), 8×): `parseStarboardConfig`/`emojiMatches` — refactor behavior-preserving (parser wyjęty z `cfg`, bez bazy) + **RYGIEL klamry progu ≥1** (próg 0/ujemny bez klamry = każda wiadomość na starboardzie = spam) + fail-safe OFF (uszkodzony JSON → defaulty) + `emojiMatches` (unicode/`<:name:id>`/id); mutation-proof (usunięcie `Math.max` zwala klamrę, usunięcie gałęzi `toString` zwala emoji własny), 0 zmian zachowania. Suite 69 plików / 558 testów. Wcześniej: **v0.400.0** 🎉 — 🧪↩️ **rygiel rejestru /undo** ([`undo.test.ts`](bot/src/lib/undo.test.ts), 8×): `recordUndo`/`readUndo`/`clearUndo` (siatka bezpieczeństwa cofania prowizjonowania Architekta) — round-trip + „tylko ostatnia operacja" + **RYGIEL fail-safe parsowania** (uszkodzony JSON / `channels`-`roles` nie-tablica → `null`, nigdy połowiczny rekord; brak `label`→`''`); mutation-proof (usunięcie strażnika `Array.isArray` zwala 2 testy), **0 zmian produkcyjnych**, realny SQLite. Suite 68 plików / 550 testów. Wcześniej: **v0.399.0** — 🧪🔐 **rygiel generatora captcha** ([`captcha.test.ts`](bot/src/lib/captcha.test.ts), 7×): `generateCaptchaCode`/`ALPHABET` (brama weryfikacji anty-bot/raid) — **RYGIEL czytelności** (brak znaków dwuznacznych `0/O/1/I/L` — inaczej user oblewa legalną weryfikację) + długość (domyślna 5, `0`→`''`) + każdy znak ∈ ALPHABET + **pełny zasięg indeksu** (cały alfabet osiągalny); mutation-proof (wstrzyknięcie `0` zwala czytelność, `i<len`→`i<=len` zwala długość), zmiana produkcyjna = 1× `export`. Suite 67 plików / 542 testy. Wcześniej: **v0.398.0** — 🧪✂️ **rygiel /rps** ([`rps.test.ts`](bot/src/commands/rps.test.ts), 6×): wynik rundy kamień-papier-nożyce — refactor behavior-preserving (logika zwycięstwa z `execute` → czysta `rpsOutcome`) + **RYGIEL anty-symetrii** (`win(a,b)⟺lose(b,a)` — bot nie oszukuje) + **integralność cyklu `BEATS`** (każdy wybór wygrywa z 1 i przegrywa z 1); mutation-proof (zepsucie cyklu `rock:'paper'` zwala 3 testy), 0 zmian zachowania. Suite 66 plików / 535 testów. Wcześniej: **v0.397.0** — 🧪💘 **rygiel /ship** ([`ship.test.ts`](bot/src/commands/ship.test.ts), 8×): `shipPct` — **deterministyczny + SYMETRYCZNY** % dopasowania (`shipPct(a,b)===shipPct(b,a)` dzięki `.sort()`; bez sortu para dostaje różny % zależnie od kolejności) + zakres `[0,100]` (kontrakt dla progów i `bar`) + `bar` (10 segmentów, `round(pct/10)`, kompozycja nigdy nie rzuca); mutation-proof (usunięcie sortu zwala symetrię, `/10`→`/5` zwala `bar` `RangeError`), zmiana produkcyjna = 2× `export`. Suite 65 plików / 529 testów. Wcześniej: **v0.396.0** — 🧪🗺️ **rygiel integralności katalogu questów** ([`quests.catalog.test.ts`](bot/src/community/quests.catalog.test.ts), 9×): `QUESTS` (battle-pass lite) — `id` unikalne (duplikat = **podwójny claim**) + `period ∈ {daily,weekly}` + `metric ∈` klucze liczników (spoza → postęp nie urośnie) + `target ≥ 1` (0 → darmowa nagroda) + `reward`/`points > 0` + label + ≥1 dzienny/tygodniowy; mutation-proof (dup id + `target:0` zwala 2 testy), 0 zmian produkcyjnych. Suite 64 pliki / 521 testów. Wcześniej: **v0.395.0** — ♻️🧪 **DRY taga tygodnia** (`weekKey`): wzór `YYYY-Wnn` był w **2 kopiach** (digest dedup + reset questów weekly) — teraz **1 źródło prawdy** ([`lib/weekKey.mts`](bot/src/lib/weekKey.mts)), 2 kopie usunięte (0 zmian zachowania) + rygiel `weekKey` (4 testy: W0/W1/W52/UTC, mutation-proof). Suite 63 pliki / 512 testów. Wcześniej: **v0.394.0** — 🧪🔗 **rygiel budowy URL OAuth** ([`auth.authorizeUrl.test.ts`](dashboard/lib/auth.authorizeUrl.test.ts), 5×): `authorizeUrl` — **scope `guilds` tylko przy self-serve** (inaczej minimalnie `identify`) + `redirect_uri`/`response_type`/`prompt`/`state`; mutation-proof, 0 zmian produkcyjnych. Suite 62 pliki / 508 testów. Wcześniej: **v0.393.0** — 🧪🏅 **rygiel odznak panelu** ([`badges.test.ts`](dashboard/lib/badges.test.ts), 7×): `nextBadges` (najbliższe do zdobycia — sort wg %, pomija zdobyte/osiągnięte) + `resolveBadges`/`badgeById` + **spójność lustra id panel↔bot** (13); mutation-proof, 0 zmian produkcyjnych. **Suite 61 plików / 503 testy (próg 500 przekroczony)**. Wcześniej: **v0.392.0** — 🧪🌐 **rygiel detekcji języka panelu** ([`panelI18n.detect.test.ts`](dashboard/lib/panelI18n.detect.test.ts), 6×): `isPanelLocale` + `detectBrowserLocale` (odcina region `pt-BR`→`pt`, case-insensitive, brak `navigator` SSR → `pl`); mutation-proof, 0 zmian produkcyjnych. Suite 60 plików / 496 testów. Wcześniej: **v0.391.0** — 🧪🗂️ **rygiel grupowania komend** ([`commands.group.test.ts`](dashboard/lib/commands.group.test.ts), 5×): `groupCommands` (widok `/commands`) — konserwacja (każda raz, brak dup), nieznana → „Inne" (ostatnia), kolejność wg katalogu, puste grupy pominięte; mutation-proof, 0 zmian produkcyjnych. Suite 59 plików / 490 testów. Wcześniej: **v0.390.0** — 🧪👑 **rygiel whitelisty właściciela instancji** ([`tenant.isOwner.test.ts`](dashboard/lib/tenant.isOwner.test.ts), 5×): `isOwner` (instance-admin: owner = pełny dostęp do serwerów bota) — uid z listy `DASHBOARD_OWNER_IDS` (trim/filter), fail-closed (brak env / null uid → false); mutation-proof, 0 zmian produkcyjnych. Suite 58 plików / 485 testów. Wcześniej: **v0.389.0** — 🧪🌉 **rygiel auth mostu bot→panel** ([`pluginBridge.test.ts`](dashboard/lib/pluginBridge.test.ts), 9×): `bridgeAuthorized` (Bearer w stałym czasie, **pusty sekret nie autoryzuje** — guard `token.length>0`) + `bridgeReady` (sekret ≥16 + community ON); bramka `/api/internal/*`; mutation-proof, 0 zmian produkcyjnych. Suite 57 plików / 480 testów. Wcześniej: **v0.388.0** — 🧪🔑 **rygiel parserów auth** ([`auth.parse.test.ts`](dashboard/lib/auth.parse.test.ts), 10×): `parseCookie` (sesja HMAC z nagłówka — trim, decode, split po pierwszym `=`, guard `i>0`) + `getOrigin` (`redirect_uri` OAuth — XFF>host, localhost→http); mutation-proof, 0 zmian produkcyjnych. Suite 56 plików / 471 test. Wcześniej: **v0.387.0** — 🧪✏️ **rygiel edytora rich-message panelu** ([`richMessage.test.ts`](dashboard/lib/richMessage.test.ts), 8×): `embedTotal` (suma znaków = baza limitu 6000), `v2TextTotal` (limit 4000 — tylko text/section), `v2HasContent`/`normalizeRich`/`fromLegacy`; mutation-proof, 0 zmian produkcyjnych. Suite 55 plików / 461 test. Wcześniej: **v0.386.0** — 🧪🧬 **rygiel kodeka recept Architekta** ([`setup.recipe.test.ts`](dashboard/lib/setup.recipe.test.ts), 7×): `encode`/`decodeRecipe` (base64 udostępnialnego setupu) — round-trip + **whitelist anty-wstrzyknięcie** (decode filtruje przez `BLUEPRINT_MODULES`/`PROV_BLOCKS`, nieznane id odpadają) + degeneraty → `null`; mutation-proof, 0 zmian produkcyjnych. Suite 54 pliki / 453 testy. Wcześniej: **v0.385.0** — 🧪💳 **rygiel bramki monetyzacji** ([`billing.canUsePlugin.test.ts`](dashboard/lib/billing.canUsePlugin.test.ts), 4×): `canUsePlugin` — billing OFF → brak paywalla (wszystko), billing ON → plugin `premium` na serwerze `free` **zablokowany** (paywall nie przecieka); mutation-proof, 0 zmian produkcyjnych. Suite 53 pliki / 446 testów. Wcześniej: **v0.384.0** — 🧪🔒 **rygiel kontraktu akcji pluginów** ([`pluginRunner.schema.test.ts`](dashboard/lib/pluginRunner.schema.test.ts), 9×): granica zaufania z obcym kodem (M6 sandbox) — `pluginActionSchema`/`pluginResponseSchema` odrzucają nieznane typy akcji, **>20 akcji** (anty-abuse) i przerośnięte pola (content 2000 / id 32 / value 4000); mutation-proof, 0 zmian produkcyjnych. Suite 52 pliki / 442 testy. Wcześniej: **v0.383.0** — 🧪🛡️ **rygiel mappera AutoModa** ([`discordAutomod.test.ts`](dashboard/lib/discordAutomod.test.ts), 4×): `mapRule` raw API Discorda (snake_case) → `NativeRule` panelu (camelCase) — pełne mapowanie + defaulty (`?? []`/`?? null`) + **RYGIEL `?? null` vs `|| null`** (limit `0` wzmianek zostaje `0`, nie `null`); mutation-proof, 0 zmian produkcyjnych. Suite 51 plików / 433 testy. Wcześniej: **v0.382.0** — 🧪✉️ **rygiel limitów embeda** ([`richMessage.limits.test.ts`](bot/src/lib/richMessage.limits.test.ts), 6×): twarde limity Discorda w `buildEmbed`/`buildRichMessage` (content 2000, title 256, desc 4096, footer 2048, pole 256/1024, **max 25 pól**) — przekroczenie = API odrzuca całą wiadomość; przycięcie PO podstawieniu zmiennych; mutation-proof, 0 zmian produkcyjnych. Suite 50 plików / 429 testów. Wcześniej: **v0.381.0** — ♻️🧪 **DRY helpera cooldownu**: formuła `minutesSince` (`null→∞` / `/60_000`) była w **3 kopiach** (store/cards/pets) — teraz **1 źródło prawdy** (cards/pets re-eksportują `store.minutesSince`), 2 kopie usunięte (0 zmian zachowania) + rygiel anty-redup (`===` ta sama referencja). Suite 49 plików / 423 testy. Wcześniej: **v0.380.0** — 🧪📈 **rygiel katalogu giełdy** ([`stocks-catalog.test.ts`](bot/src/economy/stocks-catalog.test.ts), 6×): `findStock` (case-insensitive+trim) + **kontrakt uppercase** (symbole `STOCKS` muszą być WIELKĄ literą — inaczej niezznajdowalne) + pasmo cen per-spółka `base × [max(0.15,1−0.38·vol), 1+0.38·vol]`; mutation-proof, 0 zmian produkcyjnych. Suite 48 plików / 421 testów. Wcześniej: **v0.379.0** — 🧪🎨 **rygiel presetów motywu** ([`themes.test.ts`](dashboard/lib/themes.test.ts), 4×): kontrakt CSS `rgb(var(--accent-rgb))` — `rgb`/`hover`/`dark` = triplet `"R G B"` (spacje, 0–255; przecinek/>255 = cicho zepsuty akcent panelu) + unikalne id; mutation-proof, 0 zmian produkcyjnych. Suite 47 plików / 415 testów. Wcześniej: **v0.378.0** — 🧪🌍 **rygiel listy języków bota w panelu** ([`botLocales.test.ts`](dashboard/lib/botLocales.test.ts), 5×): `normalizeBotLocale` (fallback `auto`) + **spójność cross-package** — opcje panelu (mirror) == 14 języków bota + `auto`; rozjazd = panel proponuje język, którego bot nie obsługuje; mutation-proof, 0 zmian produkcyjnych. Suite 46 plików / 411 testów. Wcześniej: **v0.377.0** — 🧪🖼️ **rygiel proxowania okładek** ([`cover.test.ts`](dashboard/lib/cover.test.ts), 8×): `proxied` (data: bez proxy — inline; http(s) → `/api/img` z `encodeURIComponent`) + `coverFallbacks` (łańcuch zapasowy zawsze z placeholderem, dedup); mutation-proof, 0 zmian produkcyjnych. Suite 45 plików / 406 testów. Wcześniej: **v0.376.0** — 🧪🎨 **rygiel spójności stylu kart bot↔panel** ([`cardstyle-consistency.test.ts`](bot/src/lib/cardstyle-consistency.test.ts), 4×): oferta czcionek panelu == możliwości renderu bota (`CARD_FONTS` + domyślny `RANKCARD_DEFAULT`/`CARD_STYLE_DEFAULT`) — rozjazd = panel proponuje font, którego bot nie ma → cichy fallback; mutation-proof, 0 zmian produkcyjnych. Suite 44 pliki / 398 testów. Wcześniej: **v0.375.0** — 🧪🛡️ **rygiel rate-limitu panelu** ([`rateLimit.test.ts`](dashboard/lib/rateLimit.test.ts), 8×): sliding-window anty-flood publicznych sinków `/api/sentry`+`/api/hook` — off-by-one limitu, reset po `windowMs`, ścisła granica okna (`<`), izolacja kluczy + `clientIp` (XFF→x-real-ip→unknown); fałszywy zegar, mutation-proof, 0 zmian produkcyjnych. Suite 43 pliki / 394 testy. Wcześniej: **v0.374.0** — 🧪🎭 **rygiel menu ról** ([`rolemenu.test.ts`](bot/src/engagement/rolemenu.test.ts), 8×): twarde limity Discorda dla select-menu — **kap 25 opcji**, label ≤100 / placeholder ≤150 / description ≤100 (przekroczenie = API odrzuca publikację `/rolemenu`) + filtr opcji bez `roleId` + `buildRoleMenu` null gdy pusto; mutation-proof, 0 zmian produkcyjnych. Suite 42 pliki / 386 testów. Wcześniej: **v0.373.0** — 🧪🛡️ **rygiel diagnozy uprawnień anti-nuke** ([`antinuke-perms.test.ts`](bot/src/security/antinuke-perms.test.ts), 5×): `missingPerms` — `/antinuke status` musi pokazać realne braki (regresja = bot raportuje „OK", a nie może banować = cicha dziura w obronie); zaryglowane mapowanie flaga→etykieta + kolejność, brak `me`→`["nieznane"]`; mutation-proof, 0 zmian produkcyjnych. Suite 41 plików / 378 testów. Wcześniej: **v0.372.0** — 🧪👋 **rygiel renderowania pożegnań/boostu** ([`farewell.test.ts`](bot/src/farewell.test.ts), 11×): `renderVars` (literalne replaceAll — **wszystkie** wystąpienia, odporne na regex) + `memberVars` (`{user}`/`{username}`/`{server}`/`{memberCount}`, fallback) + `farewellEmbed`; mutation-proof, 0 zmian produkcyjnych. Suite 40 plików / 373 testy. Wcześniej: **v0.371.0** — 🧪🐹 **rygiel ekonomii petów** ([`pets-gift.test.ts`](bot/src/economy/pets-gift.test.ts), 9×): `giftValue` (dochód pet = `giftBase × poziom × sytość`; factor 0.2–1.0, fałszywy zegar) + kap `petLevel` 50 + katalog `SPECIES`/`findSpecies`; mutation-proof, 0 zmian produkcyjnych. Suite 39 plików / 362 testy. Wcześniej: **v0.370.0** — 🧪🌐 **rygiel runtime'u i18n** ([`t.test.ts`](bot/src/i18n/t.test.ts), 9×): funkcja `t()` (każdy zlokalizowany string przez nią przechodzi) — interpolacja `{placeholder}` (wszystkie wystąpienia, nieznana zmienna dosłownie, liczby koercjonowane, bez vars surowo) + **łańcuch fallback** `locale→en→pl→sam klucz` (nigdy `undefined`); mutation-proof, 0 zmian produkcyjnych. Suite 38 plików / 353 testy. Wcześniej: **v0.369.0** — 🧪🃏 **rygiel gachy** ([`cards.test.ts`](bot/src/economy/cards.test.ts), 12×): drabina rzadkości (`RARITY` — waga **maleje**, sprzedaż **rośnie**, suma 100) + integralność `CARDS` (każda rzadkość ma kartę) + `findCard`/`rarityRank` (kolejność mythic<…<common) + `drawCard` (zawsze prawidłowa karta, wszystkie 5 rzadkości osiągalnych); mutation-proof, 0 zmian produkcyjnych. Suite 37 plików / 344 testy. Wcześniej: **v0.368.0** — 🧪🌍 **rygiel rejestru języków** ([`locales.test.ts`](bot/src/i18n/locales.test.ts), 11×): **dwukierunkowa spójność map** `LOCALE_TO_DISCORD`↔`DISCORD_TO_LOCALE` (anti-drift — komenda zarejestrowana pod kodem X musi rozwiązać się na właściwy język) + `isRtl` (dokładnie 1 RTL = `ar`) + `fromDiscordLocale` (warianty `en-US`/`pt-BR`/`zh-CN`→baza); mutation-proof, zmiana produkcyjna = 1× `export`. Suite 36 plików / 332 testy. Wcześniej: **v0.367.0** — 🧪💬 **rygiel autorespondera** ([`responder.test.ts`](bot/src/community/responder.test.ts), 6×): wydzielony `matchTrigger` (3 tryby `contains`/`exact`/`starts`, case-insensitive) — **`exact` to ścisła równość, nie podłańcuch** + **pusty trigger nigdy nie pasuje** (anti-spam: reaguje na każdą wiadomość); refactor behavior-preserving, mutation-proof. Suite 35 plików / 321 testów. Wcześniej: **v0.366.0** — ♻️🧪 **DRY krzywej levelingu**: formuła `5L²+50L+100` była w **5 kopiach** (rank/profile/prestige/giveaways/leveling) — teraz **1 źródło prawdy** ([`leveling.mts`](bot/src/leveling.mts) eksportuje `levelInfo`), 4 lokalne kopie usunięte (−34 linie, 0 zmian zachowania) + rygiel `levelInfo` (+4 testy, mutation-proof). Suite 34 plików / 315 testów. Wcześniej: **v0.365.0** — 🧪🚦 **rygiel bram funkcji** ([`feature-toggles.test.ts`](bot/src/community/feature-toggles.test.ts), 14× = 7×2 parsery): `afkEnabled`/`highlightsEnabled` — **fail-safe OFF** (uszkodzony JSON / brak configu → `false`, nigdy wyjątek/przypadkowe włączenie) + override per-serwer + izolacja A↛B; mutation-proof, 0 zmian produkcyjnych (suite 34 plików / 311 testów). Wcześniej: **v0.364.0** — 🧪🎁 **rygiel losowania giveawayów** ([`giveaways.test.ts`](bot/src/engagement/giveaways.test.ts), 7×): `weightedPick` — **bez podwójnych zwycięzców** (dedup), nie więcej niż uczestników, dolny clamp wagi (`Math.max(1,…)` — waga 0/ujemna nadal uprawniona); niezmienniki w pętli 200 przebiegów (dowolne tasowanie); mutation-proof, 0 zmian produkcyjnych (suite 33 plików / 297 testów). Wcześniej: **v0.363.0** — 🧪⏱️ **rygiel warstwy danych eko** ([`store-config.test.ts`](bot/src/economy/store-config.test.ts), 13×): **`minutesSince`** — rdzeń bramek czasowych (`null`→`+Infinity`, dzielnik `60_000`, przyszłość→ujemne; fałszywy zegar `vi`) + **`ecoConfig`** per-serwer override+fallback global (Etap K, merge płytki, uszkodzony JSON→default, izolacja A↛B) + sanity `ECO_DEFAULT` (`workMin≤workMax`, procenty ∈ [0,100]); mutation-proof, 0 zmian produkcyjnych (suite 32 plików / 290 testów). Wcześniej: **v0.362.0** — 🧪🎨 **rygiel katalogu skórek** ([`skins.test.ts`](bot/src/economy/skins.test.ts), 9×): **cross-module spójność fontu** (każda `style.font` ∈ `CARD_FONTS` — inaczej renderer cicho podmienia na Poppins i user nie dostaje opłaconej skórki) + integralność (5 skórek, `classic` darmowa, drabina cen) + walidacja stylu (hex/angle); mutation-proof, 0 zmian produkcyjnych (suite 31 plików / 277 testów). Wcześniej: **v0.361.0** — 🧪🏅 **rygiel progów odznak** ([`badges.test.ts`](bot/src/community/badges.test.ts), 19×): dokładne progi `>=` 13/13 (poziom/prestiż/majątek/streak/zaproszenia/gry — odznaki permanentne, off-by-one = na zawsze) + izolacja wymiaru (każdy predykat patrzy tylko na swoje pole) + anti-rozjazd test↔produkcja; mutation-proof, 0 zmian produkcyjnych (suite 30 plików / 268 testów). Wcześniej: **v0.360.0** — 🧪⏳ **rygiel TTL efektów itemów** ([`effects.test.ts`](bot/src/economy/effects.test.ts), 11×): granica wygaśnięcia `exp < now` (ścisłe `<` — now===exp jeszcze działa, +1 ms gaśnie; fałszywy zegar `vi`) + mnożnik `xp2` + izolacja klucza `guild:user:effect`; mutation-proof, 0 zmian produkcyjnych (suite 29 plików / 249 testów). Wcześniej: **v0.359.0** — 🧪🃏 **rygiel blackjacka** ([`blackjack.test.ts`](bot/src/economy/blackjack.test.ts), 10×): **miękki as** (`val` — as 11→1 przy buscie, pojedynczo i tylko ile trzeba) + integralność talii (`freshDeck` — 52 karty, 0 duplikatów, suma 380); mutation-proof, zmiana produkcyjna = tylko `export` (3 linie). Suite 28 plików / 238 testów. Wcześniej: **v0.358.0** — 🧪💍 **rygiel logiki małżeństw (/marry)** ([`marriage.test.ts`](bot/src/lib/marriage.test.ts), 8×): symetria zapisu (oba kierunki + ten sam `since`) + **strażnik lustra przy rozwodzie** (re-marriage nie kasuje świeżego związku partnera) + izolacja multi-tenant; mutation-proof, 0 zmian produkcyjnych (suite 27 plików / 228 testów). Wcześniej: **v0.357.0** — 🔧🏁 **domknięcie znalezisk audytu:** `ingest` otypowany (`pnpm typecheck` obejmuje **4 pakiety**, type-clean) + `pnpm lint` exit 0 (drift wyczyszczony, `next-env` w ignore biome); `twitch_sub`/`kofi` zweryfikowane jako poprawne (toggle bramkuje webhook panelu). Wszystkie 4 znaleziska zamknięte. Wcześniej: **v0.356.0** — 🔧🔍 **pełny audyt funkcjonalny** (kod kompletny: 95+3 komend · 57/57 usług · 93 trasy API · 0 stub) + naprawa `pnpm typecheck`. Wcześniej: **v0.355.0** — 🧪🌍🏁 **parytet i18n całego projektu** (bot+panel+how-it-works). Wcześniej: **v0.354.0** — 🧪🌍 **rygiel parytetu i18n panelu** (UI 1430×14 + MODES). Wcześniej: **v0.353.0** — 🧪🌍 **rygiel parytetu i18n bota** + fix `error.generic` w 12 jęz. Wcześniej: **v0.352.0** — 🧪 **rygiel matematyki ekonomii** (giełda·pety·format). Wcześniej: **v0.351.0** — 🧪 **rygiel progów odznak-tierów** (`tierAtLevel`/`nextTier`). Wcześniej: **v0.350.0** — 🧪 **rygiel krzywej XP→poziom** (`levelForXp`, `5L²+50L+100`). Wcześniej: **v0.349.0** — 🧪🛡️🏁 **rygiel anti-nuke `mergeConfig` + KONIEC toru bezpieczeństwa** (heat·antiraid·antinuke). Wcześniej: **v0.348.0** — 🧪🛡️ **rygiel detekcji fali anti-raid** (`detectWave`, okno+próg). Wcześniej: **v0.347.0** — 🧪🛡️ **rygiel scoringu anty-spam (heat)** — wagi czynników `messageHeat`. Wcześniej: **v0.346.0** — 🧪 **rygiel spójności `MIGRATED_GUILD_KEYS` (bot ⊆ panel)** — anty-rozjazd round-tripu zapisu multi-tenant. Wcześniej: **v0.345.0** — 🧪 **komplet testów izolacji pollerów (7/7)** + rdzeń + harmonogram (suite 16 plików / 106 testów). Wcześniej: **v0.344.0** — 🧪 **testy scheduledPosts:** logika harmonogramu (tryby/okno/**Europe/Warsaw+DST**) + izolacja state. Wcześniej: **v0.343.0** — 🧪 **rygiel pricetracker:** `guild_id` na wishliście (anty-IDOR, mutacja zwala 3/4). Wcześniej: **v0.342.0** — 🧪 **rygiel runtime freegames:** routing per-serwer + dedup `g:<id>:freegames_seen` (mutacja zwala 2/4). Wcześniej: **v0.341.0** — 🧪 **rygiel izolacji per-serwer (bot):** [`db.isolation.test.ts`](bot/src/lib/db.isolation.test.ts) (8×) — `getGuildSettings`/`configWriteKey`, anty-leak B→A. Wcześniej: **v0.340.0** — 🪵🏁 **loggery — KONIEC sweepu:** reszta bota (62 pliki / 154 wywołania) `console.*` → `log.*` ⇒ **0 `console` w `bot/src`**; po drodze fix cichego zaniku błędu (7× catch-handler interakcji w `index`). Wcześniej: **v0.339.0** — 🪵 **loggery strukturalne:** 7 feedów/pollerów (3 gaming-feedy · `aidigest` · `social` · `clips` · `scheduledPosts`) `console.*` → `log.*` (JSON-lines, gating `LOG_LEVEL`; batch 1 sweepu). Wcześniej: **v0.338.0** — 🔐🏁 **multi-tenant:** ostatnie 3 pollery per-serwer (`social_feeds`/`scheduled_posts`/`creator`) — **KONIEC migracji 9/9** globalnych configów (per-serwer + fallback + izolacja kanałów). Wcześniej: **v0.337.0** — 🔐 3 gaming-feedy per-serwer (`pricetracker` naprawił przeciek wishlisty). Wcześniej: **v0.336.0** — 🔐 `aidigest` per-serwer (wzorzec pollera, przetestowany). Wcześniej: **v0.335.0** — 🔐 `aihelp_config` per-serwer (2/~9, wzorzec aimod). Wcześniej: **v0.334.0** — 🔐 `aimod_config` per-serwer (wzorzec, AI-moderacja czytała config globalnie). Wcześniej: **v0.333.0** — ⚡ parytet hardeningu proxy okładek `/api/img` (edge-cache + timeout 8s). Wcześniej: **v0.332.0** — ♿ klawiatura na overlayach panelu (`GameDetailModal` focus-trap; `Assistant`/`TourGuide` tylko `Escape`). Wcześniej: **v0.331.0** — ♿ `Escape` + restore focusu na dropdownie języka w GameVault. Wcześniej: **v0.330.0** — 🐛♿ modal szczegółów gry **nie dawał się zamknąć** (`AnimatePresence` + React 19) → render warunkowy + a11y dialogu (`useFocusTrap`→web/). Wcześniej: **v0.329.0** — ♿ kontrast WCAG AA na 12 etykietach panelu (np. `/60`=3.2:1 → solidny `text-muted` 7.2:1; logowanie objęte). Wcześniej: **v0.328.0** — 🧹 ujednolicona liczba usług (`~40`→**59** wg audytu) + martwe komentarze i18n + dedup blurba. Wcześniej: **v0.327.0** — ↔️🖼️ embla `direction:'rtl'` w karuzeli GameVault (poprawny RTL) + fundament `images.remotePatterns` (oba `next.config.mjs`) pod `next/image`. Wcześniej: **v0.326.0** — 🧪 testy izolacji multi-tenant (`isolation.test.ts`, mock Supabase) — rygiel anty-IDOR: usunięcie scope `guild_id` = czerwony CI (vitest 36/36). Wcześniej: **v0.325.0** — 🛟 `window.confirm` przed nieodwracalnym usunięciem w panelu (wishlist + sklep), z nazwą pozycji — 0 nowych kluczy i18n. Wcześniej: **v0.324.0** — 🧰 deklaracja `engines` (Node ≥24 · pnpm ≥11) w 5 pakietach — jawny kontrakt toolchainu. Wcześniej: **v0.323.0** — 🛡️ rate-limit publicznego sinku `/api/sentry` (10/min per IP + cap 16 KB) + wspólny helper `lib/rateLimit.ts` (`/api/hook` zdedup.). Wcześniej: **v0.322.0** — 🛡️ **P0 (re-audyt) — KONIEC tieru:** walidacja `zod` (`safeParse`) na globalnym configu `integrations` — koniec ślepego `as IntegrationConfig`. Wcześniej: **v0.321.0** — 🛡️ domknięcie strażników — **SSRF IPv4-mapped IPv6** (`::ffff:127.0.0.1`/metadata omijały guard runnera) + **`CRON_SECRET` timing-safe** (`timingSafeEqual` zamiast `===`). Wcześniej: **v0.320.0** — 🛡️ web/ resilience — `safeGenres` (jeden uszkodzony wiersz nie ubije strony) + granice błędu `error.tsx`/`global-error.tsx` (koniec białego ekranu GameVault). Wcześniej: **v0.319.0** — 🔭 `captureError` w krytycznych `catch` (billing webhook + auth callback) — ciche awarie premium/logowania trafiają do Sentry. Wcześniej: **v0.318.0** — 🔐 IDOR shop/tickets (cross-tenant). Wcześniej: **v0.317.0** — ♿ focus-trap na `CommandPalette`. Wcześniej: **v0.316.0** — ♿ prymityw `useFocusTrap` + dialog `MobileNav`. Wcześniej: **v0.315.0** — ⚡ `GuildSwitcher` `router.refresh` + `loading.tsx` serwerowy. Wcześniej: **v0.314.0** — ⚡ edge-cache `/api/img` (potwierdzony MISS→HIT). Wcześniej: **v0.313.0** — 🔭 hook `onRequestError` → Sentry (błędy serwera widoczne). Wcześniej: **v0.312.0** — 🔐 bramka instance-admin na 4 globalnych configach (`integrations`/`ai`/`locale`/`presence`). Wcześniej: **v0.311.0** — 🧪 testy rdzenia (20 vitest) + **E2E Playwright w CI** + fix SSRF IPv6 `[::1]`. Wcześniej: **v0.310.0** — 🔐 bramka **instance-admin** na sekretach globalnych (Ko-fi/webhook-relay) w self-serve. Wcześniej: **v0.309.0** — 🔐 **cz.2:** ujednolicone uprawnienia bota + sekret admina na `web/ /api/settings`. Wcześniej: **v0.308.0** — 🔐 **nagłówki bezpieczeństwa HTTP** (CSP / HSTS / `X-Frame-Options` / `nosniff` / `Referrer-Policy`) w panelu + GameVault + **anty-eskalacja `/roleperms`+`/rolecopy`**. Wcześniej: **v0.307.0** — 🔎 **Audyt całości + gotowość publiczna** (kod funkcjonalnie kompletny — 95 komend / 59 usług / 46 stron / 92 trasy API, 0 TODO/stub; **pierwszy git tag + GitHub release**). Wcześniej: CI `workflow_dispatch` (v0.306.0), przewodnik wdrożenia + monitoring (v0.305.0, [`docs/AKTYWACJA-DEPLOY.md`](docs/AKTYWACJA-DEPLOY.md) — Railway/Vercel env + cron-job.org/Uptime.com wpięte w `/api/health`+`/api/health/check`).  Wcześniej: `undici` → 6.27.0 — 4 alerty Dependabota zamknięte (v0.304.0, override w [`pnpm-workspace.yaml`](pnpm-workspace.yaml)), bramka typów dla bota — `tsc`+biome w CI (v0.303.0, 14 błędów typów naprawionych), gotowość pod sharding >2500 serwerów (v0.302.0, [`shard.mts`](bot/src/shard.mts) `ShardingManager` + uodpornione `heartbeat`/`moderation`/`tempRoles`; [`docs/SHARDING.md`](docs/SHARDING.md)), reconciliation `ai_usage` per-serwer (v0.301.0) + domknięcie rezyduów F5 — `server_history`+`ai_usage` per-serwer (v0.300.0 🎉), Audyt #2 + naprawa F5 — scoping analityki `/stats` (v0.299.0, [`SECURITY-REVIEW-MARKETPLACE.md`](docs/SECURITY-REVIEW-MARKETPLACE.md)), retencja kohortowa — wykres D1/D7/D30 (v0.298.0, [`lib/retention.ts`](dashboard/lib/retention.ts), i18n ×14) + fundament danych (v0.297.0, `member_cohorts` + [`analytics/cohorts.mts`](bot/src/analytics/cohorts.mts) śledzi join/leave per-członka). Wcześniej **Marketplace M1–M6 w pełni domknięty**: przewodnik aktywacji community (v0.296.0, [`AKTYWACJA-COMMUNITY.md`](docs/AKTYWACJA-COMMUNITY.md) — env, dwa sekrety, `X-EBOT-Signature` HMAC, akcje, przykład Node.js), deklaracja triggera (`event`+`keywords`) w formularzu zgłoszeń (v0.295.0, [`CommunitySubmitForm`](dashboard/components/CommunitySubmitForm.tsx), i18n ×14), pluginy na `messageCreate` przez filtr słów-kluczy (v0.294.0, [`/api/internal/plugin-subscriptions`](dashboard/app/api/internal/plugin-subscriptions/route.ts), auth mostu w [`lib/pluginBridge.ts`](dashboard/lib/pluginBridge.ts)), most forwarduje cykl życia członka — `guildMemberRemove`+`guildBoost` (v0.293.0), auto-trigger z bota — most bot→panel (v0.292.0, [`/api/internal/plugin-event`](dashboard/app/api/internal/plugin-event/route.ts) → [`invokeGuildEvent`](dashboard/lib/pluginInvoke.ts)), toggle community per-serwer (v0.291.0), pola endpoint/secret w formularzu (v0.290.0), M6c trigger produkcyjny (v0.289.0, orchestrator [`lib/pluginInvoke.ts`](dashboard/lib/pluginInvoke.ts) + `/api/community/run`), M6c dry-run (v0.288.0), M6b akcje w Discordzie z per-akcja authz ([`lib/discordActions.ts`](dashboard/lib/discordActions.ts), v0.287.0), M6b start `setConfig` (v0.286.0, [`lib/pluginExecutor.ts`](dashboard/lib/pluginExecutor.ts)), M6a runner webhook (v0.285.0, [`lib/pluginRunner.ts`](dashboard/lib/pluginRunner.ts)), design M6 sandbox (v0.284.0, [`PLAN-M6-SANDBOX.md`](docs/PLAN-M6-SANDBOX.md)), self-review bezpieczeństwa multi-tenant (v0.283.0, 4 luki cross-tenant naprawione; [`SECURITY-REVIEW-MARKETPLACE.md`](docs/SECURITY-REVIEW-MARKETPLACE.md)), M3 config pluginów (v0.282.0), i18n moderacji + zgłoszeń community (v0.281.0), i18n onboardingu + linków (v0.280.0), onboarding „dodaj bota" (v0.279.0), formularz zgłoszeń community (v0.278.0), panel moderacji community (v0.277.0), community backend (v0.276.0), M5 billing Stripe (v0.275.0), M5 tiery/gating (v0.274.0), self-serve multi-tenant login (v0.273.0), interaktywny toggle marketplace (v0.272.0), strona `/marketplace` (v0.271.0), warstwa danych katalogu [`lib/pluginCatalog.ts`](dashboard/lib/pluginCatalog.ts) (v0.270.0), M1 chokepoint dostępu per-guild w `getPrimaryGuildId` (v0.269.0), warstwa multi-tenant [`lib/tenant.ts`](dashboard/lib/tenant.ts) (v0.268.0), schemat danych multi-guild (v0.267.0, additive), plan architektoniczny marketplace (v0.266.0), infra prod audyt + przewodnik (v0.265.0), Twitch sub→rola kod-ready (v0.264.0), `/stats` zakres + eksport CSV (v0.263.0); domknięte **i18n 14 jęz.** i **lustrzane RTL** (v0.254–260). Wcześniej: 14 stron tras (v0.258.0), strona główna (v0.257.0), chrom nawigacyjny (v0.255–256), fundament RTL `dir="rtl"` + audyt i18n 14 jęz. **1394×14** (v0.254.0). Wcześniej domknięta **i18n CAŁEJ powierzchni web**: panel 39/39 + współdzielone edytory + powierzchnia publiczna (login/`/p/leaderboard`/`/p/u/[id]`) + boilerplate (`error`/`404`/`loading`/metadane) + obraz OG profilu (fonty per-skrypt). Fundamenty: i18n treści „Jak to działa?" (37/37), web GameVault (+RTL), Architekt serwera, config per‑serwer (Etap K), 14 epików „2.0" (Faza 8).
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
