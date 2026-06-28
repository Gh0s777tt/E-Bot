<div align="center">

# 🛰️ HOSTING BOTA 24/7 &nbsp;·&nbsp; E‑BOT

</div>

> Bot pisze puls (`bot_status`), stosuje presence i wysyła powiadomienia **tylko gdy proces żyje**.
> Żeby zielona kropka w panelu świeciła non‑stop i live‑notyfikacje działały — bot musi chodzić 24/7.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔑 Wymagane zmienne środowiskowe

Ustaw je w panelu hostingu (NIE commituj `.env`):

| Zmienna | Po co |
|:--|:--|
| `DISCORD_BOT_TOKEN` | logowanie bota (wymagane) |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | puls + presence + sync ustawień z panelu |
| `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` / `TWITCH_CHANNEL` | live Twitch |
| `KICK_CHANNEL`, `RUMBLE_LIVESTREAM_API_URL`, `YOUTUBE_LIVE_CHANNEL_ID` | pozostałe live |
| `GHOST_ECONOMY=1` + `GHOST_BOT_SECRET` + `GHOST_API_URL` | ekonomia E-Forge + `/link` (opcjonalnie) |

> Włączone privileged intents (Message Content + Server Members) w Discord Dev Portal są potrzebne tylko gdy `GHOST_ECONOMY=1`.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🅰️ Railway (najprościej — Docker)

1. [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo** → `Gh0s777tt/E-Bot`.
2. W ustawieniach serwisu: **Dockerfile Path** = `bot/Dockerfile`, **Root** = repozytorium.
3. **Variables** → wklej zmienne z tabeli wyżej.
4. Deploy. Logi powinny pokazać `✅ Zalogowano jako E-Bot#…` + `[heartbeat] puls do Supabase co 60s`.

## 🅱️ Fly.io (Docker)

```bash
fly launch --dockerfile bot/Dockerfile --no-deploy
fly secrets set DISCORD_BOT_TOKEN=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
fly deploy
```

## 🆗 VPS / własny serwer (pm2 — bez Dockera)

```bash
git clone https://github.com/Gh0s777tt/E-Bot.git && cd E-Bot
pnpm install --filter bot-dc-bot
cp .env.example .env   # uzupełnij sekrety
npm i -g pm2
pm2 start "node bot/src/index.mts" --name e-bot
pm2 save && pm2 startup   # autostart po reboocie
```

## 🐳 Lokalnie przez Docker

```bash
docker build -f bot/Dockerfile -t e-bot .
docker run --env-file .env --restart unless-stopped e-bot
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ✅ Po wdrożeniu

- Panel → pasek: **zielona kropka** „online" (puls świeży < 120 s).
- Zmiana presence/anti‑nuke w panelu → bot podchwytuje w ≤ 60 s (settings‑sync).
- Restart/crash: hosting z `restart: always` (Railway/Fly mają domyślnie; pm2 — `--restart`).

<div align="center"><sub>🛰️ E‑BOT · E-Forge — powiązane: <a href="../CHANGELOG.md">CHANGELOG</a> · <a href="ROADMAP.md">ROADMAP</a></sub></div>
