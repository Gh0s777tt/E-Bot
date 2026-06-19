<div align="center">

# 🧱 Aktywacja: infra produkcyjna (Sentry · Realtime · Redis)

![Sentry](https://img.shields.io/badge/Sentry-gated_(DSN)-E50914?style=for-the-badge&labelColor=0a0a0a)
![Realtime](https://img.shields.io/badge/Realtime-gated_(publication)-3ECF8E?style=for-the-badge&labelColor=0a0a0a)
![Redis](https://img.shields.io/badge/Redis-opcjonalny-888?style=for-the-badge&labelColor=0a0a0a)

</div>

> Kod jest **kompletny i bezpiecznie wygaszony** (gated): bez konfiguracji wszystko działa na obecnym stosie (SQLite/Supabase + poll), a po dodaniu zasobów aktywuje się bez zmian w kodzie. Poniżej dokładne kroki.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🛰️ Sentry — śledzenie błędów

- **Kod**: [`dashboard/lib/sentry.ts`](../dashboard/lib/sentry.ts) — wysyła envelope przez `fetch` (zero zależności). Klient (`error.tsx`) → [`/api/sentry`](../dashboard/app/api/sentry/route.ts) → `captureError`. Try/catch — **nigdy nie wywraca żądania**.
- **Stan bez konfiguracji**: `captureError` robi `return` gdy brak `SENTRY_DSN` (uśpione).
- **Aktywacja** — dodaj w env Vercela:
  ```
  SENTRY_DSN=https://<publicKey>@<host>/<projectId>
  ```
  Od tej chwili błędy klienta lecą do projektu Sentry. (Opcjonalnie: rozszerz `captureError` na serwerowe `catch` w API routes — dziś łapany jest error boundary klienta.)

## ⚡ Supabase Realtime — natychmiastowy sync panel → bot

- **Kod**: [`bot/src/cloud/realtime.mts`](../bot/src/cloud/realtime.mts) — natywny WebSocket (Node 26, zero zależności) subskrybuje zmiany tabeli `settings`; zmiana w panelu wchodzi do bota **od ręki** zamiast czekać na poll 60 s. Wykładniczy backoff, heartbeat 25 s.
- **Stan bez konfiguracji**: bez chmury/WebSocket lub bez publikacji → **graceful fallback na poll 60 s** (zero breakage).
- **Aktywacja** — jednorazowo w SQL Supabase:
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE settings;
  ```
  Wymaga skonfigurowanej chmury (`SUPABASE_URL` + `SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY`). Log bota potwierdzi: `realtime: subskrypcja settings aktywna`.

## 🧰 Redis — opcjonalny backend (na skalę)

- **Stan**: `REDIS_URL` jest w [`.env.example`](../.env.example) i [`SECRETS.md`](SECRETS.md) jako **opcja na później** — projekt działa na **SQLite/Supabase** i **nie ma dziś warstwy korzystającej z Redis**.
- **Kiedy warto**: dopiero przy skali (cache/kolejki/rate-limit współdzielony między instancjami). Wymaga **implementacji warstwy cache** (nie istnieje) + instancji Redis — to osobne zadanie, nie samo wpięcie env.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ✅ Podsumowanie

| Element | Kod | Aktywacja | Bez aktywacji |
|---|---|---|---|
| **Sentry** | ✅ kompletny | `SENTRY_DSN` (env) | no-op |
| **Realtime** | ✅ kompletny | `ALTER PUBLICATION … ADD TABLE settings` | poll 60 s |
| **Redis** | ⛔ niewpięty | wymaga implementacji cache + instancji | n/d (SQLite/Supabase) |

<div align="center"><sub>Powiązane: <a href="SECRETS.md">SECRETS</a> · <a href="ROADMAP.md">ROADMAP</a> · <a href="PHASES.md">PHASES</a></sub></div>
