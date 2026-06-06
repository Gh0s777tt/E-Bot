# 🚀 Getting Started

> Uruchomienie E‑Bota lokalnie + deploy dashboardu.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1️⃣ Wymagania

| Narzędzie | Wersja | Po co |
|:--|:--|:--|
| **Node.js** | **26+** | `node:sqlite`, natywny `fetch`, `process.loadEnvFile()`, type‑stripping `.mts` |
| git | dowolna | klon repo |
| konto Vercel | — | hosting dashboardu |
| konto Supabase | — | baza w chmurze (opcjonalnie — fallback do lokalnego SQLite) |

## 2️⃣ Klon i sekrety

```bash
git clone https://github.com/Gh0s777tt/E-Bot.git
cd E-Bot
cp .env.example .env            # uzupełnij klucze
cp dashboard/.env.example dashboard/.env.local
```

> 🔐 **Nigdy** nie commituj `.env*`. Oba pliki są w `.gitignore`. Szczegóły: [[Security]].

Minimalny zestaw kluczy do ingest biblioteki:
- `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` — token IGDB (OAuth client_credentials)
- `STEAM_API_KEY` + SteamID64 — biblioteka Steam
- `NPSSO` — biblioteka PlayStation

## 3️⃣ Zasilenie biblioteki (ingest)

```bash
node ingest/steam.mts      # gry Steam
node ingest/psn.mts        # gry PlayStation (NPSSO)
node ingest/igdb.mts       # dopasowanie okładek/metadanych (external_game_source = 1)
node ingest/sync.mts       # zapis do data/bot.db
```

Dane lądują w `data/bot.db` (SQLite, **gitignored**).

## 4️⃣ Dashboard lokalnie

```bash
cd dashboard
npm install
npm run dev        # http://localhost:3000
```

Adapter danych (`lib/data.ts`) najpierw próbuje **Supabase**, a przy błędzie wraca do lokalnego **SQLite**.

## 5️⃣ Deploy (Vercel)

```bash
cd dashboard
npx tsc --noEmit                 # bramka typów
vercel deploy --prod
vercel alias set <deploy-url> e-bot-dc.vercel.app
```

Produkcyjny URL: **https://e-bot-dc.vercel.app**

> ⚠️ Nie myl z `e-bot.vercel.app` — to inny projekt. Po zmianach: `Ctrl+Shift+R` (twardy refresh).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

➡️ Dalej: [[Dashboard]] · [[Commands]]
