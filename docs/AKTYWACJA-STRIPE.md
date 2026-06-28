<div align="center">

# 💳 Aktywacja billingu Stripe (Marketplace M5)

![Status](https://img.shields.io/badge/kod-gotowy_·_env--gated-635BFF?style=for-the-badge&labelColor=0a0a0a)
![Domyślnie](https://img.shields.io/badge/domyślnie-UŚPIONY-555?style=for-the-badge&labelColor=0a0a0a)

</div>

> Kod billingu jest **kompletny i wpięty**, ale **uśpiony** bez kluczy Stripe — panel działa jak dziś (zero paywalla). Ten przewodnik aktywuje płatne tiery premium per-serwer.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🚨 Najpierw: bezpieczeństwo kluczy

- **Klucz sekretny (`sk_...`) = pełny dostęp do konta Stripe.** Nigdy nie wklejaj go do czatu, kodu ani repo.
- Jeśli klucz kiedykolwiek wyciekł (czat, screenshot, log): **Stripe Dashboard → Developers → API keys → „Roll key"** (unieważnia stary, generuje nowy). Sprawdź też **Developers → Events/Logs**.
- Klucze ustawiasz **wyłącznie jako zmienne środowiskowe** w Vercel (panel) — `.env.example` ma tylko puste placeholdery.

## 🔧 Kroki aktywacji

1. **Produkt + 2 ceny** — Stripe Dashboard → Products → utwórz produkt „Premium", dodaj **dwie ceny recurring**:
   - **miesięczną** (np. 19,99 zł / mc) → `STRIPE_PRICE_ID`,
   - **roczną** (np. 199 zł / rok) → `STRIPE_PRICE_ID_YEAR` *(opcjonalna — bez niej plan roczny użyje ceny miesięcznej)*.
2. **Klucz sekretny** — Developers → API keys → `sk_...` → `STRIPE_SECRET_KEY` *(bezpieczniejszy: klucz restricted `rk_...` z uprawnieniem Checkout)*.
3. **Webhook** — Developers → Webhooks → Add endpoint:
   - URL: `https://<twój-panel>/api/billing/webhook`
   - Eventy: **`checkout.session.completed`** + **`customer.subscription.deleted`**
   - Skopiuj **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`.
4. **Env w Vercel** — Project → Settings → Environment Variables, następnie Redeploy:
   - **Wymagane:** `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`.
   - **Plan roczny:** `STRIPE_PRICE_ID_YEAR`.
   - **Ceny wyświetlane** (opcjonalne; domyślnie `19,99 zł` / `199 zł`): `NEXT_PUBLIC_PREMIUM_PRICE`, `NEXT_PUBLIC_PREMIUM_PRICE_YEAR`.
5. **Schemat** — upewnij się, że uruchomiony jest [`m1-marketplace-schema.sql`](../dashboard/scripts/m1-marketplace-schema.sql) (tabela `guilds` z kolumnami `tier`/`stripe_customer_id`/`stripe_sub_id`).

## 🔄 Jak to działa

```mermaid
flowchart LR
  U[Admin serwera] -->|„Przejdź na Premium"| D[Okno porównania Free vs Premium<br/>przełącznik mc / rok]
  D -->|„Subskrybuj"| C[POST /api/billing/checkout<br/>plan: month / year]
  C -->|chokepoint guild_id + wybór price| S[Stripe Checkout]
  S -->|płatność| W[POST /api/billing/webhook]
  W -->|HMAC verify| DB[(guilds.tier = premium)]
  DB -->|gating| M[Marketplace odblokowuje premium]
```

- **Okno porównania** (`PremiumDialog`) — przycisk „Przejdź na Premium" w Marketplace (gdy billing włączony i serwer Free) otwiera porównanie planów z przełącznikiem **miesięczny/roczny**; dopiero „Subskrybuj" startuje Checkout. Cechy: edytowalna stała `PLAN_FEATURES` w [`dashboard/lib/premiumPlan.ts`](../dashboard/lib/premiumPlan.ts).
- **Checkout** scope'owany przez `getPrimaryGuildId` → admin kupuje premium tylko dla **swojego** serwera; `plan` w body wybiera `STRIPE_PRICE_ID` (mc) lub `STRIPE_PRICE_ID_YEAR` (rok).
- **Webhook** weryfikuje podpis `Stripe-Signature` (HMAC-SHA256, tolerancja 5 min) zanim ruszy `guilds.tier`.
- `checkout.session.completed` → `premium` (+ zapis `stripe_customer_id`/`stripe_sub_id`); `customer.subscription.deleted` → `free`.

## 🧪 Test (tryb testowy Stripe)

- Użyj kluczy **test** (`sk_test_...`) + Stripe CLI: `stripe listen --forward-to localhost:3001/api/billing/webhook`.
- Karta testowa: `4242 4242 4242 4242`, dowolna przyszła data, dowolny CVC.
- Po opłaceniu sprawdź w Supabase, że `guilds.tier` = `premium` dla danego `guild_id`.

## 🟢 Stan bez aktywacji

Bez `STRIPE_SECRET_KEY`: `billingEnabled()` = false → `canUsePlugin` zawsze `true` (brak paywalla), `/api/billing/checkout` → 400, webhook → 400. Wszystkie pluginy dostępne, panel jak dziś.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
<div align="center"><sub>Powiązane: <a href="PLAN-MARKETPLACE.md">PLAN-MARKETPLACE</a> · <a href="ROADMAP.md">ROADMAP</a> · kod: <code>dashboard/lib/billing.ts</code></sub></div>
