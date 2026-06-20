<!-- SYNC: v0.307.0 · #377 · 2026-06-20 — utrzymywane przez `pnpm docs:check` (badge wersji + blurb „Najnowsze") -->
<!-- ╔══════════════════════════════════════════════════════════════════╗ -->
<!-- ║                            E - B O T                              ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->

<div align="center">

<img src="dashboard/public/ghost-skull.png" width="120" alt="GH0ST EMPIRE" />

# 🎬 E‑BOT &nbsp;·&nbsp; GH0ST EMPIRE

### ⟣ Discordowe ramię imperium · biblioteka gier „Netflix" · live · bezpieczeństwo ⟣

<br/>

![Wersja](https://img.shields.io/badge/wersja-0.307.0-E50914?style=for-the-badge&labelColor=0a0a0a)
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
| 🤖 **Bot Discord** | ~95 slash‑komend (moderacja, ekonomia, leveling, tickety, AI, gry…), ~40 usług w tle, **i18n 14 języków** | ![](https://img.shields.io/badge/-stabilny-E50914?labelColor=0a0a0a) |
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

Najnowsze: **v0.307.0** — 🔎 **Audyt całości + gotowość publiczna** (werdykt: kod funkcjonalnie kompletny — 95 komend / 59 usług / 46 stron / 92 trasy API, 0 TODO/stub; sekrety czyste w całej historii git; poprawione 2 nieaktualne miejsca w `PHASES.md`; **pierwszy git tag + GitHub release**). Wcześniej: CI `workflow_dispatch` (v0.306.0), przewodnik wdrożenia + monitoring (v0.305.0, [`docs/AKTYWACJA-DEPLOY.md`](docs/AKTYWACJA-DEPLOY.md) — Railway/Vercel env + cron-job.org/Uptime.com wpięte w `/api/health`+`/api/health/check`).  Wcześniej: `undici` → 6.27.0 — 4 alerty Dependabota zamknięte (v0.304.0, override w [`pnpm-workspace.yaml`](pnpm-workspace.yaml)), bramka typów dla bota — `tsc`+biome w CI (v0.303.0, 14 błędów typów naprawionych), gotowość pod sharding >2500 serwerów (v0.302.0, [`shard.mts`](bot/src/shard.mts) `ShardingManager` + uodpornione `heartbeat`/`moderation`/`tempRoles`; [`docs/SHARDING.md`](docs/SHARDING.md)), reconciliation `ai_usage` per-serwer (v0.301.0) + domknięcie rezyduów F5 — `server_history`+`ai_usage` per-serwer (v0.300.0 🎉), Audyt #2 + naprawa F5 — scoping analityki `/stats` (v0.299.0, [`SECURITY-REVIEW-MARKETPLACE.md`](docs/SECURITY-REVIEW-MARKETPLACE.md)), retencja kohortowa — wykres D1/D7/D30 (v0.298.0, [`lib/retention.ts`](dashboard/lib/retention.ts), i18n ×14) + fundament danych (v0.297.0, `member_cohorts` + [`analytics/cohorts.mts`](bot/src/analytics/cohorts.mts) śledzi join/leave per-członka). Wcześniej **Marketplace M1–M6 w pełni domknięty**: przewodnik aktywacji community (v0.296.0, [`AKTYWACJA-COMMUNITY.md`](docs/AKTYWACJA-COMMUNITY.md) — env, dwa sekrety, `X-EBOT-Signature` HMAC, akcje, przykład Node.js), deklaracja triggera (`event`+`keywords`) w formularzu zgłoszeń (v0.295.0, [`CommunitySubmitForm`](dashboard/components/CommunitySubmitForm.tsx), i18n ×14), pluginy na `messageCreate` przez filtr słów-kluczy (v0.294.0, [`/api/internal/plugin-subscriptions`](dashboard/app/api/internal/plugin-subscriptions/route.ts), auth mostu w [`lib/pluginBridge.ts`](dashboard/lib/pluginBridge.ts)), most forwarduje cykl życia członka — `guildMemberRemove`+`guildBoost` (v0.293.0), auto-trigger z bota — most bot→panel (v0.292.0, [`/api/internal/plugin-event`](dashboard/app/api/internal/plugin-event/route.ts) → [`invokeGuildEvent`](dashboard/lib/pluginInvoke.ts)), toggle community per-serwer (v0.291.0), pola endpoint/secret w formularzu (v0.290.0), M6c trigger produkcyjny (v0.289.0, orchestrator [`lib/pluginInvoke.ts`](dashboard/lib/pluginInvoke.ts) + `/api/community/run`), M6c dry-run (v0.288.0), M6b akcje w Discordzie z per-akcja authz ([`lib/discordActions.ts`](dashboard/lib/discordActions.ts), v0.287.0), M6b start `setConfig` (v0.286.0, [`lib/pluginExecutor.ts`](dashboard/lib/pluginExecutor.ts)), M6a runner webhook (v0.285.0, [`lib/pluginRunner.ts`](dashboard/lib/pluginRunner.ts)), design M6 sandbox (v0.284.0, [`PLAN-M6-SANDBOX.md`](docs/PLAN-M6-SANDBOX.md)), self-review bezpieczeństwa multi-tenant (v0.283.0, 4 luki cross-tenant naprawione; [`SECURITY-REVIEW-MARKETPLACE.md`](docs/SECURITY-REVIEW-MARKETPLACE.md)), M3 config pluginów (v0.282.0), i18n moderacji + zgłoszeń community (v0.281.0), i18n onboardingu + linków (v0.280.0), onboarding „dodaj bota" (v0.279.0), formularz zgłoszeń community (v0.278.0), panel moderacji community (v0.277.0), community backend (v0.276.0), M5 billing Stripe (v0.275.0), M5 tiery/gating (v0.274.0), self-serve multi-tenant login (v0.273.0), interaktywny toggle marketplace (v0.272.0), strona `/marketplace` (v0.271.0), warstwa danych katalogu [`lib/pluginCatalog.ts`](dashboard/lib/pluginCatalog.ts) (v0.270.0), M1 chokepoint dostępu per-guild w `getPrimaryGuildId` (v0.269.0), warstwa multi-tenant [`lib/tenant.ts`](dashboard/lib/tenant.ts) (v0.268.0), schemat danych multi-guild (v0.267.0, additive), plan architektoniczny marketplace (v0.266.0), infra prod audyt + przewodnik (v0.265.0), Twitch sub→rola kod-ready (v0.264.0), `/stats` zakres + eksport CSV (v0.263.0); domknięte **i18n 14 jęz.** i **lustrzane RTL** (v0.254–260). Wcześniej: infra prod audyt + przewodnik (v0.265.0), Twitch sub→rola kod-ready (v0.264.0), `/stats` zakres + eksport CSV (v0.263.0); domknięte **i18n 14 jęz.** i **lustrzane RTL** (v0.254–260). Wcześniej: 14 stron tras (v0.258.0), strona główna (v0.257.0), chrom nawigacyjny (v0.255–256), fundament RTL `dir="rtl"` + audyt i18n 14 jęz. **1394×14** (v0.254.0). Wcześniej domknięta **i18n CAŁEJ powierzchni web**: panel 39/39 + współdzielone edytory + powierzchnia publiczna (login/`/p/leaderboard`/`/p/u/[id]`) + boilerplate (`error`/`404`/`loading`/metadane) + obraz OG profilu (fonty per-skrypt). Fundamenty: i18n treści „Jak to działa?" (37/37), web GameVault (+RTL), Architekt serwera, config per‑serwer (Etap K), 14 epików „2.0" (Faza 8).
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
