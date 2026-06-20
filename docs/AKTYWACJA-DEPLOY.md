<div align="center">

# 🚀 Wdrożenie i monitoring — Railway · Vercel · cron-job.org · Uptime.com

![Bot](https://img.shields.io/badge/bot-Railway-E50914?style=for-the-badge&logo=railway&labelColor=0a0a0a)
![Panel](https://img.shields.io/badge/panel-Vercel-E50914?style=for-the-badge&logo=vercel&labelColor=0a0a0a)
![Monitoring](https://img.shields.io/badge/monitoring-health--endpoints-E50914?style=for-the-badge&labelColor=0a0a0a)

</div>

> Bot (Discord) hostuje **Railway** (proces 24/7), panel (Next.js) — **Vercel** (serverless). Monitoring i cron wpinają się w **istniejące** endpointy panelu (`/api/health`, `/api/health/check`) — nic nie trzeba dokodowywać. Ten przewodnik to wyłącznie **konfiguracja w panelach usług** — żadnych sekretów w repo.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🚨 Bezpieczeństwo poświadczeń — czytaj najpierw

- **Sekrety (API keys, tokeny, klucze) ustawiasz WYŁĄCZNIE jako zmienne środowiskowe w panelach usług** (Railway/Vercel) — nigdy w repo, nigdy w czacie, nigdy w `.env` commitowanym. Kod czyta tylko `process.env.*`.
- **Klucz API serwisu (Railway/Vercel/cron-job.org/Uptime.com) = pełna kontrola konta.** Trzymaj go w menedżerze haseł; jeśli kiedykolwiek wyciekł (czat, screenshot, log) — **natychmiast zrotuj** w panelu danego serwisu (revoke + new).
- Wdrożenie (deploy, zmiana env, tworzenie monitorów) robisz **w UI usług** lub ich CLI uruchamianym lokalnie u Ciebie — nie przez wklejanie tokenów osobom trzecim.

## 1️⃣ Railway — bot (proces 24/7)

1. **Service** → podłącz repo (root) lub obraz; komenda startu:
   - domyślnie: `pnpm install --frozen-lockfile && pnpm --filter bot-dc-bot start` (`node bot/src/index.mts`),
   - przy skali >2500 serwerów: zamień `start` → **`shard`** (`node bot/src/shard.mts`, `SHARD_COUNT=auto`). Patrz [`SHARDING.md`](SHARDING.md).
2. **Variables** (Settings → Variables) — minimalnie:
   - `DISCORD_BOT_TOKEN` (wymagany),
   - `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (chmura: heartbeat, analytics, sync; bez nich bot działa lokalnie z SQLite),
   - opcjonalnie: `GHOST_API_URL`+`GHOST_BOT_SECRET`, klucze AI/streaming, `SENTRY_DSN`.
   - **Most pluginów (M6, jeśli włączasz):** `PLUGIN_BRIDGE_URL=https://<panel>` + `PLUGIN_BRIDGE_SECRET` (ten sam co w Vercel).
3. **Privileged Intents** w Discord Dev Portal: **Server Members** + **Message Content** (bot ich używa do powitań/automodu/mostu).
4. Pełna lista zmiennych: [`.env.example`](../.env.example).

## 2️⃣ Vercel — panel (dashboard)

1. **Project** → import `dashboard/` (Framework: Next.js).
2. **Environment Variables** (Settings → Environment Variables) — kluczowe:
   - **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   - **Auth/OAuth:** `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DASHBOARD_OWNER_IDS` (Twoje Discord ID = admin instancji),
   - **Marketplace (opcjonalne, domyślnie OFF):** `MARKETPLACE_SELF_SERVE`, `MARKETPLACE_COMMUNITY`, `PLUGIN_BRIDGE_SECRET` (ten sam co w Railway), `DISCORD_BOT_PERMISSIONS`,
   - **Billing Stripe (opcjonalne):** `STRIPE_SECRET_KEY`/`STRIPE_PRICE_ID`/`STRIPE_WEBHOOK_SECRET` → [`AKTYWACJA-STRIPE.md`](AKTYWACJA-STRIPE.md),
   - **Monitoring:** `CRON_SECRET` (ochrona `/api/health/check`), `SENTRY_DSN`.
3. Po zmianie env → **Redeploy**. Pełna lista: [`.env.example`](../.env.example).

## 3️⃣ cron-job.org — alarm „bot offline" na Discord

Panel ma gotowy endpoint [`/api/health/check`](../dashboard/app/api/health/check/route.ts): sprawdza świeżość pulsu bota i **wysyła wiadomość na Discord przy ZMIANIE stanu** (down/up), z dedupem (zero spamu).

1. cron-job.org → **Create cronjob**:
   - **URL:** `https://<twój-panel>/api/health/check?key=<CRON_SECRET>` (albo bez `?key=` i nagłówek `Authorization: Bearer <CRON_SECRET>`; jeśli `CRON_SECRET` puste — endpoint otwarty).
   - **Harmonogram:** co **2 minuty** (puls bota leci co 60 s; „offline" = brak pulsu > 3 min).
   - Metoda: GET.
2. Kanał alarmu: `alert_channel_id`/`notify_channel_id` w ustawieniach panelu lub `NOTIFY_DISCORD_CHANNEL_ID`.

## 4️⃣ Uptime.com — monitor zewnętrzny

1. Uptime.com → **Add Check** (HTTP/HTTPS):
   - **URL:** `https://<twój-panel>/api/health` — zwraca **200** gdy puls bota świeży (<120 s) i online, **503** gdy nie. Monitor traktuje 503 jako DOWN → alert.
   - Interwał: 1–5 min.
2. (Opcjonalnie) drugi check na sam panel (`https://<twój-panel>/`) — pilnuje dostępności Vercela niezależnie od bota.

> ℹ️ Bot to klient bramy Discorda — **nie ma własnego serwera HTTP**, więc Uptime.com nie pinguje go bezpośrednio. „Żywość" bota mierzymy pulsem w Supabase, który `/api/health` udostępnia jako 200/503. To celowy, poprawny model.

## ✅ Checklist wdrożenia

- [ ] Railway: `DISCORD_BOT_TOKEN` + Supabase + (opcjonalnie most/AI/Sentry); komenda `start` (lub `shard`).
- [ ] Vercel: Supabase + OAuth + `DASHBOARD_OWNER_IDS` + (opcjonalnie marketplace/Stripe) + `CRON_SECRET`; redeploy.
- [ ] cron-job.org: GET `/api/health/check?key=…` co 2 min.
- [ ] Uptime.com: HTTP check na `/api/health` (oczekuj 200).
- [ ] Sekrety tylko w panelach usług; ewentualne wyciekłe — **zrotowane**.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
<div align="center"><sub>Powiązane: <a href="SHARDING.md">SHARDING</a> · <a href="AKTYWACJA-INFRA.md">AKTYWACJA-INFRA</a> · <a href="AKTYWACJA-STRIPE.md">AKTYWACJA-STRIPE</a> · <a href="AKTYWACJA-COMMUNITY.md">AKTYWACJA-COMMUNITY</a> · <a href="../.env.example">.env.example</a></sub></div>
