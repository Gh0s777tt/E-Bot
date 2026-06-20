<div align="center">

# 🔐 Przegląd bezpieczeństwa — Marketplace / multi-tenant

![Zakres](https://img.shields.io/badge/zakres-self--serve_·_billing_·_community-E50914?style=for-the-badge&labelColor=0a0a0a)
![Status](https://img.shields.io/badge/krytyczne-naprawione-2ea043?style=for-the-badge&labelColor=0a0a0a)

</div>

> Adwersarialny self-review kodu dołożonego w torze marketplace (v0.267–282): chokepoint izolacji,
> self-serve login, billing Stripe, community submit/review. Self-serve jest **env-gated OFF** —
> luki F1–F3 są aktywne dopiero po `MARKETPLACE_SELF_SERVE=1`, ale naprawiono je niezależnie.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🧭 Korzeń problemu

Bramki instance-global zakładały „**rola sesji `admin` = zaufany operator instancji**" — prawda w trybie
jednowłaścicielskim. Self-serve nadaje adminowi serwera (tenantowi) sesję `role='admin'`, więc założenie
przestało być prawdziwe. Rozróżnienie: **rola sesji** (admin tenanta) ≠ **admin instancji**
(`resolveRole(uid)==='admin'` — właściciel z env lub `panel_staff`).

## 🔴 Znalezione i naprawione

| # | Sev | Luka | Naprawa |
|:--:|:--:|---|---|
| **F1** | High | `/api/config/export` **bez bramki admina** (proxy obejmował tylko `panel-staff`/`config/import`) → każdy zalogowany (w tym `viewer`/tenant) pobierał `getAllSettings()` = config **wszystkich** serwerów (`g:<guildId>:*`) → wyciek między tenantami | Handler sprawdza `isInstanceAdminRequest` (owner/staff-admin) |
| **F2** | High | `/api/panel-staff` + `/api/config/import` bramkowane sesyjną `role==='admin'` → tenant-admin self-serve (też `role='admin'`) przechodził → przejęcie staff / nadpisanie całej konfiguracji | Handlery sprawdzają `isInstanceAdminRequest` (defense-in-depth ponad proxy) |
| **F3** | Med | `setGuildRawSetting`: `gid = getPrimaryGuildId()`; gdy `gid=''` (scoped tenant bez dostępnego serwera lub błąd lookupu) → `rawSet(key)` pisał **globalnie** → tenant zanieczyszczał config instancji | `getWriteGuildScope()` — globalny zapis tylko dla owner/legacy; scoped tenant bez serwera → **no-op** |
| **F4** | Low | Manifest community `homepage` walidowany `z.string().url()` — akceptuje `javascript:` (latentny XSS, gdyby renderowany jako link) | `.refine()` → tylko `http(s)` |

**Nowy strażnik:** [`isInstanceAdminRequest(request)`](../dashboard/lib/panelRoles.ts) = `resolveRole(uid)==='admin'`
(właściciel/staff-admin), niezależny od roli sesji. Bramkuje `panel-staff`, `config/export`, `config/import`.

## 🟢 Zweryfikowane jako bezpieczne

- **Webhook Stripe** — podpis HMAC-SHA256 nad `t.body`, porównanie w stałym czasie, tolerancja 5 min; bez `STRIPE_WEBHOOK_SECRET` zwraca 400. Brak forgingu bez sekretu.
- **Checkout** — serwer = `getPrimaryGuildId` (chokepoint) → user kupuje premium tylko dla SWOJEGO serwera; wymaga sesji.
- **Moderacja community** (`/api/community/review`) — `resolveRole==='admin'` (owner/staff), tenant → 403.
- **Chokepoint** `getPrimaryGuildId` — cookie `panel_guild`/env honorowane tylko w obrębie serwerów dostępnych; scoped tenant nie wyjdzie poza swoje członkostwo.
- **CSRF** — cookie sesji `SameSite=Lax` → blokada cross-site POST do endpointów mutujących.
- **Injection/XSS** — Supabase parametryzowane zapytania; React auto-escape treści; klucz pluginu regex-walidowany.

## 🟡 Rekomendacje (nie-blokujące)

- **Rate-limit** na `/api/community/submit` (spam pending-zgłoszeń). Dziś gated env `MARKETPLACE_COMMUNITY`; przy włączeniu warto dodać limit per-uid.
- **`x-forwarded-host`** w `getOrigin` (success/cancel URL Stripe) — Vercel ustawia nagłówek, ale rozważ allowlistę hostów, jeśli wdrożenie poza Vercel.
- Przy realnym uruchomieniu self-serve: audyt pozostałych stron/akcji „admin-only" pod kątem czy są guild-scoped, czy instance-global.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔁 Audyt #2 — most pluginów (auto-trigger) + retencja (v0.299.0)

Adwersarialny przegląd kodu z v0.292–298: most bot→panel (`/api/internal/*`), fan-out wykonujący pluginy community, tracking kohort, wykres retencji. Realizuje też rekomendację z Audytu #1 (sprawdzenie stron „admin-only" pod kątem guild-scope).

### 🔴 Znalezione i naprawione

| # | Sev | Luka | Naprawa |
|:--:|:--:|---|---|
| **F5** | High | Analityka `/stats` (`getLeaderboard`/`getTopActiveUsers`/`getHourlyActivity`/`getActivitySeries` + nowe `getCohortRetention`) czytała Supabase **bez `.eq('guild_id', …)`** → agregat WSZYSTKICH serwerów bota. Trasa dostępna dla każdego zalogowanego (wzorzec: chokepoint na danych, nie gate trasy) → przy `MARKETPLACE_SELF_SERVE=1` tenant widział XP/aktywność/retencję **cudzych** serwerów. | Każda funkcja scoped przez `getPrimaryGuildId()` + `.eq('guild_id', gid)` (jak reszta panelu); `gid=''` → fail-closed (pusto). Eksport CSV scoped automatycznie. |

### 🟢 Zweryfikowane jako bezpieczne

- **Most `/api/internal/plugin-event` + `/plugin-subscriptions`** — `bridgeAuthorized` (Bearer, porównanie constant-time), `bridgeReady` wymaga sekretu **≥16 zn.** + `MARKETPLACE_COMMUNITY`; inaczej **404** (nie zdradza trasy). NIE sesja użytkownika — service-to-service.
- **Fan-out `invokeGuildEvent`** — bot autorytatywny tylko co do `guild_id`; o wykonaniu decyduje sandbox: plugin musi być **zatwierdzony I włączony na TYM serwerze**. `guildId` z mostu nie omija strażników → brak cross-tenant.
- **Filtr keywordów `messageCreate`** — dwuwarstwowy (bot = tania bramka częstotliwości, panel = autorytatywny per-plugin); dopasowanie substring na treści, bez injekcji.
- **Tracking kohort (`cohorts.mts`)** — filtr PostgREST `guild_id=eq.…&user_id=eq.…` na snowflake'ach Discord (zawsze numeryczne, z bramy — nie od atakującego) → brak injekcji. Boty pomijane; no-op bez chmury; backfill ograniczony progiem 10 000 + oknem 90 dni.

### 🟢 Rezydua — DOMKNIĘTE (v0.300–301)

- **`server_history`** → **per-serwer** (`g:<guildId>:server_history`): bot snapshotuje każdy serwer osobno ([`serverHistory.mts`](../bot/src/analytics/serverHistory.mts)), panel czyta przez chokepoint ([`insights.ts`](../dashboard/lib/insights.ts) `getGuildRawSetting`). „Wzrost serwera" scoped per-tenant (v0.300.0).
- **`ai_usage`** → **per-serwer** (migracja PK na `(guild_id, user_id, day)` — [`expansion-ai-usage-guild-schema.sql`](../dashboard/scripts/expansion-ai-usage-guild-schema.sql), idempotentna): bot zapisuje `guild_id` ([`lib/ai.mts`](../bot/src/lib/ai.mts) + 7 komend), panel scope'uje odczyt (`getAiUsageToday`/`getAiUsageSeries` przez `getPrimaryGuildId`). Dzienny limit AI działa teraz **per-serwer-per-użytkownik**; stare wiersze (`guild_id=''`) nie pokażą się tenantom (fail-closed). (v0.300 schemat+bot, v0.301 scoping panelu + usunięcie zbędnego owner-gate).

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
<div align="center"><sub>Self-review · v0.283.0 (F1–F4) + v0.299.0 (F5) + v0.300–301 (rezydua F5 domknięte: server_history + ai_usage per-serwer) · powiązane: <a href="PLAN-MARKETPLACE.md">PLAN-MARKETPLACE</a> · <a href="ROADMAP.md">ROADMAP</a></sub></div>
