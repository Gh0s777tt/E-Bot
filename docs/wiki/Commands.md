# 🤖 Komendy bota

> Bot (`bot/`, discord.js v14) jest rozwijany w **sesji 2**. Poniżej znane komendy i system ekonomii.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ⌨️ Slash commands

| Komenda | Opis |
|:--|:--|
| `/portal` | Panel/portal użytkownika (wejście do ekosystemu GH0ST) |
| `/link` | Powiązanie konta Discord z GH0ST EMPIRE (wymaga `GHOST_BOT_SECRET`) |

## 💰 Ekonomia (GH0ST EMPIRE)

Nagrody konfigurowane są centralnie i czytane przez dashboard z publicznego endpointu
`https://ghost-empire-web.vercel.app/api/bot/config`:

| Pole | Znaczenie | Domyślnie |
|:--|:--|:--:|
| `messageReward` | punkty za wiadomość | `5` |
| `voiceRewardPerMinute` | punkty za minutę na kanale głosowym | `10` |

Logika w `bot/src/empire/` (`award`, `config`, `messages`, `voice`).

## 🛡️ Anti‑nuke

Czysta implementacja (inspirowana analizą dodatków) — limity akcji administracyjnych,
wykrywanie masowych zmian, konfiguracja zapisywana w ustawieniach (`saveAntinuke()` w dashboardzie).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> 🚧 Lista komend będzie aktualizowana wraz z rozwojem `bot/` (Faza 3+). Patrz [[FAQ]] i `docs/ROADMAP.md`.
