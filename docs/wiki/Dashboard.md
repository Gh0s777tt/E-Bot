# 🖥️ Dashboard

> Next.js (App Router) · Tailwind · Supabase · styl Netflix (`#E50914`). Live: **https://e-bot-dc.vercel.app**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔐 Logowanie

OAuth Discord → podpisane HMAC ciasteczko sesji (`lib/session.ts`, Web Crypto).
`middleware.ts` chroni wszystkie trasy poza `/login`, `/api/auth`, `/api/img`, `/_next`, `/favicon.ico`.
Dostęp tylko dla właściciela — allowlista `DASHBOARD_OWNER_IDS`.

## 📺 Strony

| Strona | Co robi |
|:--|:--|
| 🎮 **Biblioteka** | Półki z okładkami (PSN/Steam/GOG), filtry, dane z `getGames()` |
| 🔴 **Live** | Status Twitch / Kick / Rumble / YouTube, auto‑odświeżanie 30 s + sygnał dźwiękowy |
| 💰 **Ekonomia** | Konfiguracja nagród z E-Forge (`/api/bot/config`: `messageReward`, `voiceRewardPerMinute`…) |
| ⚙️ **Ustawienia** | Ustawienia bota, presence, anti‑nuke, akcent motywu |
| 👤 **Profil bota** | Zmiana **nazwy** i **avatara** (Discord `PATCH /users/@me`, owner‑gated) |
| 🛰️ **Status bota** | Heartbeat z Supabase (`bot_status`: online, guilds, tag, ts — świeży < 2 min) |

## ✨ Funkcje panelu

- **Zaproś bota** — `lib/invite.ts` → `botInviteUrl()` (`DISCORD_CLIENT_ID` + uprawnienia `1099780312198`).
- **Customizacja** — nazwa/avatar bota (`/api/bot/profile`).
- **Presence** — status/aktywność (`bot_presence`: `{status, type, text, url}`).
- **Theme switcher** — zmienna CSS `--accent-rgb`, brak migotania (inline `<script>` w `<head>`).
- **Image proxy** — `/api/img` z whitelistą hostów (anty‑SSRF).

## 🎨 Design

- Fonty: `next/font/google` — Oswald (display) + Montserrat (body), subsety `latin` + `latin-ext` (polskie znaki).
- Paleta: czerń + czerwień Netflix `#E50914`, półki z okładkami, minimalistyczny sidebar (dopasowany do E-Forge).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📐 Architektura i przepływy: [`docs/ARCHITECTURE.md`](https://github.com/Gh0s777tt/E-Bot/blob/main/docs/ARCHITECTURE.md)
