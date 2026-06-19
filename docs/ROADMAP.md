<!-- SYNC: v0.278.0 · #348 · 2026-06-19 — utrzymywane przez `pnpm docs:check` (NIE edytuj ręcznie wersji bez aktualizacji statusu) -->
<div align="center">

# 🗺️ ROADMAPA &nbsp;·&nbsp; E‑BOT

![Fazy](https://img.shields.io/badge/fazy_0–8-ukończone-E50914?style=for-the-badge&labelColor=0a0a0a)
![Etapy](https://img.shields.io/badge/etapy_A–K-ukończone-E50914?style=for-the-badge&labelColor=0a0a0a)
![Bot](https://img.shields.io/badge/bot-LIVE_24%2F7-E50914?style=for-the-badge&logo=railway&labelColor=0a0a0a)
![i18n](https://img.shields.io/badge/i18n-14_języków-E50914?style=for-the-badge&labelColor=0a0a0a)
![Wersja](https://img.shields.io/badge/wersja-0.278.0-E50914?style=for-the-badge&labelColor=0a0a0a)

</div>

> Roadmapa żywa — aktualizowana przy każdym istotnym update. Szczegółowy status zadań: [`PHASES.md`](PHASES.md). Numeracja/wersje: [`CHANGELOG.md`](../CHANGELOG.md).
> 🔄 **Synchronizacja z CHANGELOG pilnowana przez `pnpm docs:check`** (zasada: [`CLAUDE.md`](../CLAUDE.md)).

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ⏳ Oś czasu

```mermaid
gantt
  title Roadmapa E-Bot (skrót)
  dateFormat YYYY-MM-DD
  axisFormat %d %b
  section Fazy 0–5 · Fundament + chmura
  Ingest · web · rdzeń bota · panel    :done, f0, 2026-06-01, 4d
  OAuth · anti-nuke · Supabase · /link :done, f1, 2026-06-05, 2d
  Leveling · tickety · AI · EventSub   :done, f4, 2026-06-06, 1d
  Bot 24/7 (Railway)                   :done, f5, 2026-06-06, 1d
  section Fazy 6–8 · Wszystko + 2.0
  „Zrób wszystko" B1–B7 + F1–F10       :done, f7, 2026-06-07, 2d
  Message Studio + 14 epików „2.0"     :done, f8, 2026-06-08, 2d
  section Etapy A–K · Rozbudowa + i18n bota
  Architekt serwera + i18n bota (14)   :done, ek1, 2026-06-09, 2d
  Etapy A–J (przyjazność/safety/gry)   :done, ek2, 2026-06-10, 1d
  Config per-serwer (Etap K, C-1…C-27) :done, ek3, 2026-06-10, 1d
  section i18n treści + UI (bieżące)
  Samouczek · asystent · „Jak działa" 37/37 :done, i1, 2026-06-11, 1d
  Web GameVault (14 jęz. + RTL)        :done, i2, 2026-06-11, 1d
  i18n UI panelu (39/39 stron)         :done, i3, 2026-06-12, 8d
  section Otwarte
  Marketplace M1–M6 (multi-guild SaaS) :active, mk, 2026-06-19, 14d
```

## 🧭 Fazy / etapy

| Etap | Cel | Status |
|:--:|:--|:--:|
| **0–3** | Fundamenty: ingest, web, rdzeń bota, panel; OAuth, anti‑nuke, chmura, heartbeat/presence/sync | ✅ done |
| **4–5** | Leveling, tickety, AI, reaction roles, EventSub, statystyki, **bot 24/7** | ✅ done |
| **6–7** | „Zrób wszystko" (B1–B7) + pełna personalizacja (F1–F10) | ✅ done |
| **8** | Fundament customizacji: Message Studio + 14 epików „2.0" | ✅ done |
| **A–J** | Architekt serwera, fun/safety/gaming, customization 2.0, **i18n bota (14 jęz.)** | ✅ done |
| **K** | Przyjazność 2.0 + **config per‑serwer** (C‑1…C‑27 — fundament multi‑guild) | ✅ done |
| **i18n** | Treść panelu/web w 14 językach: pomoc 37/37 ✓, web ✓, **UI panelu 39/39 ✓** | ✅ done |
| **Wzrost** | Marketplace pluginów / multi‑guild (**M1 w toku**), retencja, infra prod | 🚧 w toku |

## ✅ Zrealizowane — stan na v0.222

Stack zmodernizowany (Next 16 · React 19 · Tailwind 4 · TS 6 · React Compiler · pnpm · Biome · Zod), branding GH0ST, panel na Vercel (**e‑bot‑dc.vercel.app**), **bot 24/7 na Railway**, ~95 slash‑komend, ~40 usług w tle, tabele Supabase, integracja GH0ST (`/link`, `link-status`). Pełen zestaw: moderacja + bezpieczeństwo (anti‑nuke/anti‑raid/heat/automod/weryfikacja/modmail/logi), leveling+ekonomia (eco/sklep/giełda/pety/karty), tickety, AI (czat/vision/moderacja/`/imagine`), powiadomienia live + EventSub, biblioteka gier 2.0, narzędzia twórcy, Architekt serwera, **config per‑serwer** oraz **i18n bota w 14 językach** (komendy + runtime).

```mermaid
flowchart LR
  P[🖥️ Panel] -->|config per-serwer| SB[(Supabase)]
  SB -->|settings-sync + Realtime| B[🤖 Bot 24/7 Railway]
  B -->|dane: levele / tickety / AI / eko| SB
  SB -->|ranking / listy / staty| P
  B -->|akcje + i18n 14 jęz.| DC[Discord]
  P -->|link-status| GH[GH0ST EMPIRE]
```

## 🏁 Ukończone — i18n UI panelu

Etykiety/formularze **wszystkich** stron panelu przetłumaczone na 14 języków (Pulpit `/` + powłoka + pomoc 37/37 + web GameVault + strony ustawień). **Komplet: 39/39 stron** — ostatnia, odkryta przy przeglądzie strona główna (Pulpit `/`) z widgetami pulpitu (health-check, szybkie akcje, wzrost serwera, alarm anti-raid, live-kafelki, checklista) + relTime zależny od języka (v0.250.0). Domknięta też opcjonalna fala — etykiety współdzielonego `CardStyleEditor` + `GradientField` (v0.249.0). Zlokalizowana również **powierzchnia publiczna / pre-auth** (osobno od 39/39): logowanie, publiczny ranking `/p/leaderboard`, publiczny profil `/p/u/[id]` (17 kluczy `ui.pub.*` × 14 jęz., v0.251.0) oraz **boilerplate frameworka** — `error`/`404`/`loading`/metadane (8 kluczy `ui.sys.*` × 14 jęz., v0.252.0). Naprawiony też **obraz OG profilu** — dynamiczne fonty Google per-skrypt (fail-safe) + etykiety (5 kluczy `ui.og.*` × 14 jęz., v0.253.0), więc dowolny username/skrypt renderuje się bez „tofu". **KONIEC i18n CAŁEJ powierzchni web** — nie zostaje żaden niezlokalizowany element UI. **Audyt 14 jęz. (v0.254.0)**: parzystość 1394×14, 0 duplikatów, tokeny `{…}` spójne; naprawiony **RTL** dla arabskiego (`dir="rtl"` na `<html>` — SSR z cookie + klient na zmianę języka; pełne lustrzane odbicie układu jako follow-up). Szczegóły: [`PHASES.md`](PHASES.md#-bieżący-tor-v02540).

## 🧭 Wzrost (plan / opcjonalne)

- 🛒 **Marketplace / efekt sieciowy** — pluginy, multi‑guild jako usługa. *Config* per‑serwer już jest (Etap K). **Decyzje: płatne (tiery) + community (3rd-party)** → pełny zakres M1–M6. **M1–M6 rdzeń ✓ (bez sandboxa):** schemat + multi-tenant + chokepoint (v0.267–269) + katalog + strona + toggle (v0.270–272) + self-serve login (v0.273.0) + billing Stripe (v0.274–275) + community zgłoszenia/moderacja + **UI pipeline** `/marketplace/submit`+`/review` (v0.276–278). **Sandbox wykonania obcego kodu = świadomie poza zakresem.** Plan: [`PLAN-MARKETPLACE.md`](PLAN-MARKETPLACE.md).
- 📈 **Retencja + więcej wykresów w czasie** (`/stats`) — przyrosty 1–3 gotowe (v0.261–263): wzrost członków + komplet trendów + konfigurowalny zakres 7/14/30/90d + eksport CSV; dalej opcjonalnie kohortowa retencja.
- 🧱 **Produkcyjna infra** — szkielety **kompletne + gated** (audyt v0.265.0, [`AKTYWACJA-INFRA.md`](AKTYWACJA-INFRA.md)): Sentry (env `SENTRY_DSN`), Realtime (`ALTER PUBLICATION … ADD TABLE settings`, fallback poll), Redis niewpięty (opcja na skalę).
- 🔗 **Twitch sub → rola** — kod **kompletny + gotowy do aktywacji** (v0.264.0, `eventsub-setup.mts` rejestruje `channel.subscribe`, przewodnik `AKTYWACJA-TWITCH-SUB.md`); aktywacja wymaga aplikacji Twitch + OAuth broadcastera (`channel:read:subscriptions`).
- ↔️ **Lustrzane RTL — ✅ KOMPLETNE (v0.260.0)** — cała powierzchnia (chrom + strony + komponenty + przełączniki) na klasach logicznych Tailwind v4; zostaje tylko weryfikacja wizualna arabskiego na preview‑deployu.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
<div align="center"><sub>Ostatnia aktualizacja: 2026‑06‑19 · v0.278.0 (#348) · powiązane: <a href="PHASES.md">PHASES</a> · <a href="../CHANGELOG.md">CHANGELOG</a> · weryfikacja sync: <code>pnpm docs:check</code></sub></div>
