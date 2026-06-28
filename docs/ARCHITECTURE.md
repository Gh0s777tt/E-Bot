<!-- Uwaga: diagramy nie obejmują jeszcze warstwy Marketplace pluginów (M1–M6: plugin-bridge,
     sandbox, auto-trigger). Architektura pluginów: docs/PLAN-MARKETPLACE.md · docs/PLAN-M6-SANDBOX.md ·
     docs/SECURITY-REVIEW-MARKETPLACE.md. -->

<div align="center">

# 🧠 ARCHITEKTURA &nbsp;·&nbsp; E‑BOT

![Diagramy](https://img.shields.io/badge/diagramy-mermaid-E50914?style=for-the-badge&labelColor=0a0a0a)

</div>

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🛰️ Widok systemu

```mermaid
flowchart TB
  subgraph CLIENT[" "]
    U([👥 Discord]) ; B([🌐 Przeglądarka])
  end
  subgraph LOCAL["💻 Lokalnie / Host"]
    EB["🤖 E-Bot<br/>discord.js v14"]
    ING["📥 ingest/<br/>steam·psn·gog·igdb"]
  end
  subgraph CLOUD["☁️ Chmura"]
    SB[("🟢 Supabase<br/>games · settings")]
    DASH["🖥️ Dashboard<br/>Next.js · Vercel"]
    GE[("🟥 GH0ST Portal<br/>Postgres · API")]
  end
  EXT{{📡 Twitch · Kick · YouTube · Rumble}}
  GAMES{{🎮 Steam · PSN · IGDB}}

  U <-->|gateway| EB
  B -->|OAuth + UI| DASH
  EB -->|live status| EXT
  DASH -->|live status| EXT
  ING -->|fetch| GAMES
  ING -->|upsert| SB
  ING -->|upsert| LOC[("💾 SQLite")]
  DASH <-->|read/write| SB
  EB -->|award GT · link| GE
  DASH -->|config| GE
  DASH -->|invite · profil · presence| EB
```

## 🔻 Przepływ danych — biblioteka gier

```mermaid
flowchart LR
  S[Steam Web API] & P[psn-api / NPSSO] & G[GOG Galaxy DB] --> N[normalizacja]
  N -->|nazwa/appid| I[IGDB<br/>OAuth Twitcha]
  I -->|okładka · gatunek · rok| M[(model games)]
  N --> M
  M --> SQ[(SQLite bot.db)]
  M -->|npm run sync:cloud| SUP[(Supabase games)]
  SUP --> DB[Dashboard /library]
```

## 🔐 Sekwencja — logowanie do panelu (Discord OAuth)

```mermaid
sequenceDiagram
  actor U as Właściciel
  participant D as Dashboard (Vercel)
  participant DC as Discord OAuth
  U->>D: /login → „Zaloguj przez Discord"
  D->>DC: authorize (client_id, redirect_uri, scope=identify, state)
  DC-->>U: ekran zgody
  U->>DC: akceptacja
  DC->>D: /api/auth/callback?code&state
  D->>DC: wymiana code → token, GET /users/@me
  D->>D: sprawdź DASHBOARD_OWNER_IDS, podpisz sesję (HMAC)
  D-->>U: cookie sesji + redirect / (middleware przepuszcza)
```

## 🔗 Sekwencja — łączenie konta GH0ST (`/link`)

```mermaid
sequenceDiagram
  actor U as Użytkownik
  participant P as Portal GH0ST
  participant B as E-Bot
  U->>P: generuj kod (6 znaków, 10 min)
  U->>B: /link <kod>
  B->>P: POST /api/internal/link-discord (Bearer BOT_SECRET, {code, discordId})
  P-->>B: { ok, userId }
  B-->>U: „Połączono z GH0ST EMPIRE ✅"
```

## 🧩 Mapa modułów

| Ścieżka | Rola |
|:--|:--|
| `ingest/` | Kolektory gier → `data/bot.db` (+ Supabase przez `sync:cloud`) |
| `bot/src/` | discord.js: komendy, `live/` powiadomienia, `security/` anti‑nuke, `empire/` ekonomia |
| `dashboard/app/` | Strony panelu (App Router) + `api/` (auth, img, settings, antinuke, bot/*, live) |
| `dashboard/lib/` | `data` (adapter Supabase↔SQLite), `live`, `economy`, `session`, `auth`, `themes`, `invite`… |
| `dashboard/components/` | UI: Sidebar, Topbar, karty, formularze, ThemeSwitcher… |
| `web/` | Pierwsza wersja UI „Netflix dla gier" (lokalna) |

## 🗃️ Model danych (kluczowe tabele)

```mermaid
erDiagram
  GAMES {
    string platform
    string platform_app_id
    string title
    int    igdb_id
    int    release_year
    text   genres
    string cover_url
    int    playtime_min
  }
  SETTINGS {
    string key PK
    text   value
  }
```

`settings` przechowuje m.in.: `antinuke` (JSON), powiadomienia (`notify_*`), `bot_status` (heartbeat),
`bot_presence` (status/aktywność).

## 🧠 Kluczowe decyzje (ADR skrót)

| # | Decyzja | Dlaczego |
|:--:|:--|:--|
| 1 | **Node LTS**, nie Bun | Stabilność discord.js + audio |
| 2 | **node:sqlite** lokalnie → **Supabase** w chmurze | Zero‑ops dev, jeden adapter z fallbackiem |
| 3 | **Adapter Supabase↔SQLite** (fallback na błędzie) | Panel działa lokalnie i w chmurze tym samym kodem |
| 4 | **IGDB przez OAuth Twitcha** | Darmowe metadane, te same klucze |
| 5 | **Proxy `/api/img`** | CORS/cache okładek, whitelist hostów (anty‑SSRF) |
| 6 | **OAuth HMAC cookie + middleware** | Lekka autoryzacja właściciela bez ciężkich zależności |

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
<div align="center"><sub>Powiązane: <a href="ROADMAP.md">ROADMAP</a> · <a href="DESIGN.md">DESIGN</a> · <a href="SECRETS.md">SECRETS</a></sub></div>
