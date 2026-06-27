<!-- Przewodnik hardeningu produkcyjnego — pozycje wymagające TWOJEJ infry (panel Railway/Vercel/
     Supabase) lub osobnego, skupionego PR-a. Powstał z audytu v0.461–0.468. NIE jest w docs:check. -->
<div align="center">

# 🔒 Hardening produkcyjny &nbsp;·&nbsp; E‑BOT

![Status](https://img.shields.io/badge/pozycje-infra--gated_+_focused--PR-E50914?labelColor=0a0a0a)

</div>

> Te pozycje z backlogu audytu **nie dało się wykonać bezpośrednio z repo** — wymagają Twojego panelu
> (Railway/Vercel/Supabase) albo osobnego PR-a z weryfikacją, której nie da się przeprowadzić lokalnie.
> Każda ma **precyzyjny przepis** + powód, dla którego nie weszła w falę automatyczną.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🚂 Railway (panel — nie da się z `railway.json`)

### 1. Wolumen na `/app/data` (persystencja lokalnej bazy bota)
`bot/Dockerfile` tworzy `/app/data` (`DATABASE_PATH=/app/data/bot.db`), ale Railway ma **efemeryczny FS** —
bez wolumenu `bot.db` znika przy każdym redeployu. Źródłem prawdy jest Supabase (`settings-sync`), więc
strata jest zwykle nieszkodliwa, ale dla pewności:
- Railway → projekt → usługa bota → **Variables/Settings → Volumes → Add Volume** → mount path `/app/data`.

### 2. Healthcheck (auto-restart zawieszonego procesu)
Dziś restart tylko `ON_FAILURE` (proces musi paść). Zawieszony-ale-żywy bot (zakleszczony poller) nie
zostanie zrestartowany. **Wymaga kodu** (bot nie wystawia HTTP): dodać mini-serwer `node:http` na `PORT`
zwracający 200 gdy `client.isReady()`, inaczej 503 — i `railway.json` → `deploy.healthcheckPath: "/health"`.
*Status: osobny PR (zmiana startu bota; niskie ryzyko, ale poza falą automatyczną).*

## ▲ Vercel (panel / per-route — nie zgaduję z repo)

### 1. Regiony funkcji
Funkcje jadą w domyślnym regionie (zwykle `iad1`/US). **Jeśli Twój Supabase jest w EU**, każde wywołanie
API ma RTT przez Atlantyk. Ustaw region BLISKO Supabase: `dashboard/vercel.json` → `"regions": ["fra1"]`
(EU) lub `["iad1"]` (US-East). *Nie ustawiłem — nie znam regionu Twojego Supabase.*

### 2. `maxDuration` dla ciężkich tras
`setup/provision`, `community/run` robią sekwencje wywołań do Discord/Twitch/IGDB — mogą obić się o
domyślny limit (10 s Hobby / 15 s Pro). W tych konkretnych `route.ts`: `export const maxDuration = 60;`
(Next App Router — to jest właściwy mechanizm, nie `vercel.json`). *Zależne od Twojego planu Vercel.*

### 3. `CRON_SECRET`
`/api/health/check` ma timing-safe porównanie, ale sekret jest **opcjonalny** — bez niego endpoint jest
publiczny (każdy odpali alert na Discord). Ustaw `CRON_SECRET` w env Vercela (prod).

## 🛡️ CodeQL — `upload: never` → widoczne ustalenia
`.github/workflows/codeql.yml` ma `upload: never` (repo prywatne bez GitHub Advanced Security → wyniki tylko
jako artefakt SARIF, nikt ich nie zobaczy). Po włączeniu **GitHub Advanced Security** (Settings → Code
security) zmień na `upload: always` — alerty trafią do zakładki Security. *Wymaga GHAS na Twoim repo.*

## 🔐 RLS per-guild (po migracji na Supabase Auth)
Dziś izolacja tenantów jest **w aplikacji** (filtr `guild_id` + chokepoint `getPrimaryGuildId`), bo panel
używa własnej sesji Discord OAuth, nie Supabase Auth. RLS jest włączone, ale **bez polityk** (dostęp przez
`service_role`, który omija RLS). To obrona jednopoziomowa — wyciek `service_role` = dostęp do danych
wszystkich gildii. **Gdy** przejdziesz na Supabase Auth (JWT z `discord_id` w `sub`), włącz polityki per-guild.
Szablon (zastosuj dla KAŻDEJ tabeli per-gildia — `user_levels`, `tickets`, `mod_cases`, `economy_*`, …):

```sql
-- Wzorzec: użytkownik widzi wiersze tylko swoich gildii (z guild_members).
create policy guild_isolation on user_levels
  using (
    guild_id in (
      select guild_id from guild_members where discord_id = auth.jwt() ->> 'sub'
    )
  );
-- Powtórz dla pozostałych tabel per-gildia. guild_members/guilds: scope po discord_id = sub.
```

## ⚡ Perf opcjonalne (DB) — `topActive` agregacja po stronie Postgresa
Publiczny `/p/leaderboard` (topActive) domyślnie skanuje okno `user_activity` i sumuje w JS. Szybsza droga:
funkcja Postgres `top_active` (GROUP BY + top-N). Uruchom RAZ w Supabase → SQL Editor:
[`dashboard/scripts/topactive-rpc.sql`](../dashboard/scripts/topactive-rpc.sql). Kod NAJPIERW próbuje RPC,
a bez niej wraca do skanu+JS (**zero regresji** bez tego pliku). Perf-only, bezpieczne do pominięcia.

## 🧩 Pozycje zamknięte z dowodem
- **Cache 5 usług per-wiadomość** — ✅ **ZROBIONE** (v0.470, #540) inaczej niż TTL: **invalidacja epoką**
  (`settingsEpoch()` rośnie przy zapisie) → cache hit między zapisami + natychmiastowy config po zmianie.
- **Pakiet `@ebot/live` (dryf luster)** — ❌ **NIE robić — byłby BUGIEM.** `MIGRATED_GUILD_KEYS` bot=29 ⊊
  panel=32 (panel ma aimod/aihelp/aidigest więcej) to **intencjonalny podzbiór** (staging), strzeżony testem
  `migrated-keys-consistency.test.ts` — unifikacja złamałaby go. Parsery live = osobne implementacje. Plus
  Dockerfile kopiuje tylko `bot/` (nieweryfikowalne bez Dockera). Brak bezpiecznego celu dedup.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
<div align="center"><sub>Źródło: audyt v0.461–0.468 · powiązane: <a href="AKTYWACJA-DEPLOY.md">AKTYWACJA-DEPLOY</a> · <a href="AKTYWACJA-INFRA.md">AKTYWACJA-INFRA</a> · <a href="SECURITY-REVIEW-MARKETPLACE.md">SECURITY-REVIEW</a></sub></div>
