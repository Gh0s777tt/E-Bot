<div align="center">

# 🗺️ ROADMAPA &nbsp;·&nbsp; E‑BOT

![Faza](https://img.shields.io/badge/aktualna_faza-3-E50914?style=for-the-badge&labelColor=0a0a0a)
![Postęp](https://img.shields.io/badge/fazy_0–2-ukończone-E50914?style=for-the-badge&labelColor=0a0a0a)

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
  Heartbeat bota → Supabase    :active, f3a, 2026-06-07, 3d
  Presence apply (status z panelu) :     f3b, after f3a, 3d
  Sync whitelisty/configu      :     f3c, after f3b, 3d
  section Faza 4 · Wzrost
  Tickety                      :     f4a, 2026-06-13, 5d
  Leveling + XP                :     f4b, after f4a, 5d
  Komendy AI (limit kosztów)   :     f4c, after f4b, 5d
  Marketplace / efekt sieciowy :     f4d, after f4c, 7d
```

## 🧭 Fazy

| Faza | Cel | Status |
|:--:|:--|:--:|
| **0** | Fundamenty: ingest, web, rdzeń bota, szkielet panelu | ✅ done |
| **1** | OAuth, Anti‑Nuke, chmura (Supabase + Vercel), `/link` | ✅ done |
| **2** | Pełny panel GH0ST: live, ekonomia, personalizacja, motywy | ✅ done |
| **3** | Integracja bot↔chmura: heartbeat, presence apply, sync configu | 🔄 w toku |
| **4** | Wzrost: tickety, leveling, komendy AI, marketplace | 🧭 plan |

## 🎯 Najbliższe kroki (Faza 3)

```mermaid
flowchart LR
  A[Panel zapisuje<br/>bot_status / bot_presence / config] --> B[(Supabase)]
  B --> C[Bot czyta z Supabase]
  C --> D[setPresence + heartbeat + anti-nuke/notif config na żywo]
  D -.->|kropka online + status| A
```

1. 🟢 **Heartbeat** — bot pisze `settings['bot_status']` `{online,guilds,tag,ts}` co ~60 s (panel już czyta).
2. 🎭 **Presence apply** — bot czyta `settings['bot_presence']` i woła `client.user.setPresence`.
3. 🔁 **Sync configu** — bot czyta z Supabase whitelistę anti‑nuke + ustawienia powiadomień (zamiast lokalnego SQLite).

## 🧪 Pomysły / backlog (Faza 4+)

- 🎟️ Tickety (panel + komendy) · 🏆 Leveling/XP + role nagrody · 🤖 Komendy AI (DeepSeek/OpenAI z limitem)
- 🧩 Reaction roles z edytora · 🔔 Webhooki EventSub (zamiast pollingu) przez Cloudflare Tunnel
- 📈 Statystyki/retencja w panelu · 🛒 Marketplace pluginów

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
<div align="center"><sub>Aktualizuj przy każdym kamieniu milowym · powiązane: <a href="PHASES.md">PHASES</a> · <a href="../CHANGELOG.md">CHANGELOG</a></sub></div>
