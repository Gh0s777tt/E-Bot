<div align="center">

# 🗺️ ROADMAPA &nbsp;·&nbsp; E‑BOT

![Faza](https://img.shields.io/badge/fazy_0–4-ukończone-E50914?style=for-the-badge&labelColor=0a0a0a)
![Bot](https://img.shields.io/badge/bot-LIVE_24%2F7-E50914?style=for-the-badge&logo=railway&labelColor=0a0a0a)

</div>

> Roadmapa żywa — aktualizowana przy każdym istotnym update. Status faz: `docs/PHASES.md`.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ⏳ Oś czasu

```mermaid
gantt
  title Roadmapa E-Bot
  dateFormat YYYY-MM-DD
  axisFormat %d %b
  section Faza 0 · Fundamenty
  Ingest gier (Steam/PSN/IGDB) :done,  f0a, 2026-06-01, 2d
  Web „Netflix dla gier"       :done,  f0b, 2026-06-02, 2d
  Rdzeń bota (discord.js)      :done,  f0c, 2026-06-03, 2d
  Szkielet dashboardu          :done,  f0d, 2026-06-04, 2d
  section Faza 1 · Chmura + bezpieczeństwo
  Discord OAuth (panel)        :done,  f1a, 2026-06-05, 1d
  Anti-Nuke                    :done,  f1b, 2026-06-05, 1d
  Supabase + Vercel (live)     :done,  f1c, 2026-06-06, 1d
  GH0ST /link                  :done,  f1d, 2026-06-06, 1d
  section Faza 2 · Pełny panel
  Look GH0ST + responsywność   :done,  f2a, 2026-06-06, 1d
  Live + Ekonomia              :done,  f2b, 2026-06-06, 1d
  Personalizacja + motywy      :done,  f2c, 2026-06-06, 1d
  section Faza 3 · Integracja bot↔chmura
  Heartbeat bota → Supabase    :done, f3a, 2026-06-06, 1d
  Presence apply (status z panelu) :done, f3b, 2026-06-06, 1d
  Sync whitelisty/configu      :done, f3c, 2026-06-06, 1d
  section Faza 4 · Funkcje społeczności
  Leveling + role-nagrody      :done, f4a, 2026-06-06, 1d
  Tickety (dwukierunkowo)      :done, f4b, 2026-06-06, 1d
  Komendy AI (limit kosztów)   :done, f4c, 2026-06-06, 1d
  Reaction roles               :done, f4d, 2026-06-06, 1d
  Bot 24/7 (Railway)           :done, f4e, 2026-06-06, 1d
  section Faza 5 · Wzrost (plan)
  EventSub (webhooki live)     :     f5a, 2026-06-13, 5d
  Statystyki / retencja        :     f5b, after f5a, 5d
  Marketplace pluginów         :     f5c, after f5b, 7d
```

## 🧭 Fazy

| Faza | Cel | Status |
|:--:|:--|:--:|
| **0** | Fundamenty: ingest, web, rdzeń bota, szkielet panelu | ✅ done |
| **1** | OAuth, Anti‑Nuke, chmura (Supabase + Vercel), `/link` | ✅ done |
| **2** | Pełny panel GH0ST: live, ekonomia, personalizacja, motywy | ✅ done |
| **3** | Integracja bot↔chmura: heartbeat, presence, sync configu | ✅ done |
| **4** | Funkcje: leveling, tickety, AI, reaction roles, link‑status, bot 24/7 | ✅ done |
| **5** | Wzrost: EventSub, statystyki/retencja, marketplace | 🧭 plan |

## ✅ Zrealizowane (Fazy 0–4) — wszystko LIVE

Stack zmodernizowany (Next 16 · React 19 · Tailwind 4 · TS 6 · React Compiler · pnpm · Biome · Zod), branding GH0ST (logo/baner/favicon/avatar bota), panel na Vercel (**e-bot-dc.vercel.app**), **bot 24/7 na Railway**, tabele Supabase, integracja GH0ST (`/link`, `link-status`). Funkcje: leveling + role‑nagrody, tickety (dwukierunkowo), komendy AI (z twardym limitem kosztów), reaction roles, anti‑nuke, powiadomienia live.

```mermaid
flowchart LR
  P[🖥️ Panel] -->|config| SB[(Supabase)]
  SB -->|settings-sync| B[🤖 Bot 24/7 Railway]
  B -->|dane: levele / tickety / AI| SB
  SB -->|ranking / listy / staty| P
  B -->|akcje| DC[Discord]
  P -->|link-status| GH[GH0ST EMPIRE]
```

## 🧭 Faza 5 — Wzrost (plan / opcjonalne)

- 🔔 **EventSub** — webhooki Twitch zamiast pollingu (natychmiastowe powiadomienia live; wymaga publicznego endpointu + subskrypcji Twitch EventSub). *Polling już działa → niski priorytet.*
- 📈 **Statystyki / retencja** — wykresy aktywności, XP w czasie, użycie AI (dane już w Supabase).
- 🛒 **Marketplace / efekt sieciowy** — pluginy, multi‑guild.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
<div align="center"><sub>Aktualizuj przy każdym kamieniu milowym · powiązane: <a href="PHASES.md">PHASES</a> · <a href="../CHANGELOG.md">CHANGELOG</a></sub></div>
