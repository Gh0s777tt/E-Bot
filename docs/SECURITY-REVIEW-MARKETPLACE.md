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
<div align="center"><sub>Self-review · v0.283.0 · powiązane: <a href="PLAN-MARKETPLACE.md">PLAN-MARKETPLACE</a> · <a href="ROADMAP.md">ROADMAP</a></sub></div>
