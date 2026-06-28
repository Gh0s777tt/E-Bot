<!-- Przewodnik wystawienia bota na top.gg. Nie jest pilnowany przez docs:check (to nie marker wersji). -->
<div align="center">

# ⭐ Wystawienie na top.gg &nbsp;·&nbsp; E‑Bot

![Discord Bot List](https://img.shields.io/badge/top.gg-listing-E50914?style=for-the-badge&labelColor=0a0a0a)

</div>

> Co jest **gotowe w repo** (#642): auto‑raport liczby serwerów do API top.gg ([`bot/src/cloud/topgg.mts`](../bot/src/cloud/topgg.mts)), komenda **`/vote`** ([`bot/src/commands/vote.mts`](../bot/src/commands/vote.mts)), wpis env `TOPGG_TOKEN`, lokalizacja `/vote` ×14. Czego **nie da się zrobić z repo** (musisz Ty, na stronie): założenie wpisu, weryfikacja własności, wklejenie treści, pobranie tokenu.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🚀 Kroki (po kolei)

1. **Zaloguj się** na [top.gg](https://top.gg) kontem Discord (tym, które ma dostęp do aplikacji bota).
2. **Add Bot** → wklej **Client ID** = `1512758748761030677`. top.gg zweryfikuje przez Discord, że jesteś właścicielem/teammem aplikacji.
3. **Wypełnij wpis** treścią z sekcji [„📋 Treść wpisu"](#-treść-wpisu-do-wklejenia) poniżej (krótki opis, długi opis, tagi, linki, prefix).
4. **Wyślij do review** — moderacja top.gg akceptuje wpis (zwykle godziny–dni).
5. **Pobierz token API**: wpis bota → zakładka **Webhooks / API** → skopiuj **token**.
6. **Ustaw env `TOPGG_TOKEN`** tam, gdzie hostowany jest **bot** (Railway — bo to proces bota raportuje serwery, nie panel na Vercel):
   - Railway → projekt bota → **Variables** → `TOPGG_TOKEN=<token>` → redeploy.
7. **Zarejestruj `/vote`**: po deployu bota uruchom rejestrację slash‑komend:
   ```bash
   cd bot && npm run deploy   # deploy-commands.mts — rejestruje m.in. /vote
   ```
8. **Gotowe.** Bot zacznie raportować liczbę serwerów co 30 min (log `[topgg] zaraportowano N serwerów.`), a `/vote` poda link do głosowania.

> 🔧 **Wyłączenie integracji**: usuń `TOPGG_TOKEN` (lub zostaw puste) → poster to no‑op (`[topgg] brak TOPGG_TOKEN — pomijam`). `/vote` działa niezależnie od tokenu (link buduje z ID bota).

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 📋 Gotowy wpis (kopiuj‑wklej) — ID bota: `1512758748761030677`

**Linki (z Twoim ID):**
- **Listing:** `https://top.gg/bot/1512758748761030677`
- **Invite:** `https://discord.com/oauth2/authorize?client_id=1512758748761030677&permissions=8&scope=bot+applications.commands`
- **Vote:** `https://top.gg/bot/1512758748761030677/vote`
- **Webhook URL:** `https://e-bot-dc.vercel.app/api/topgg/webhook`
- **Website / Dashboard:** `https://e-bot-dc.vercel.app`
- **Support Server:** *(wklej zaproszenie na swój serwer wsparcia, jeśli masz)*

**Avatar:** top.gg pobiera **automatycznie** awatar bota z Discorda — nic nie wgrywasz (zmień w Discord Developer Portal, jeśli chcesz inny).

**Prefix:** `/` (slash commands) · **Język wpisu (Library):** `English` (główny).

**Tagi / kategorie (wybierz z listy top.gg, do 5):** `Moderation` · `Leveling` · `Economy` · `Utility` · `Fun`
*(uzupełniająco, jeśli dostępne: `Social`, `Gaming`)*

**Headline / krótki opis (≤200 znaków) — EN:**
> All-in-one Discord bot with a full web dashboard: moderation & anti-nuke, leveling, economy, tickets, AI, live alerts and a Steam game library. 95+ commands, 14 languages.

**Headline (PL — jeśli wolisz polski wpis):**
> Wielofunkcyjny bot Discord z panelem web: moderacja i anti-nuke, leveling, ekonomia, tickety, AI, powiadomienia live i biblioteka gier. 95+ komend, 14 języków.

**Baner / tło (Background) — gotowy baner E‑Bot (1920×480, czerń/czerwień):**
`https://raw.githubusercontent.com/Gh0s777tt/E-Bot/main/docs/topgg/banner.png`
*(albo wgraj plik `docs/topgg/banner.png`; źródło edytowalne: `docs/topgg/banner.svg`)*

**Długi opis (EN, Markdown — top.gg renderuje Markdown):**

```markdown
# ⚙️🔥 E-Bot — all-in-one Discord bot + web dashboard

Run your whole server from one bot — and configure **everything in the browser**.
**95+ slash commands**, ~59 background services, **14 languages**, full per-server settings.

> 🖥️ **Dashboard:** https://e-bot-dc.vercel.app — log in with Discord and manage your server.

## 🛡️ Security & Moderation
Anti-Nuke (audit-log detection + punishments), Anti-Raid (join-flood, alt detection, auto-lockdown),
AutoMod (spam, invites, links, banned words/regex, anti-caps, scam & PII), verification, modmail,
full mod-logs, and tickets with transcripts.

## 📈 Leveling & Economy
XP with role rewards, multipliers, seasons & Hall of Fame, battle-pass. A full economy: currency,
daily/work, shop, gambling, player market, stocks, lottery, pets and collectible cards.

## 🤖 AI & Engagement
AI chat with memory, one-shot `/ask`, image description, AI moderation, `/imagine` image generation,
translate, TL;DR — plus giveaways, polls, suggestions, reaction/button roles, starboard, temp-voice,
counting, birthdays and an invite tracker.

## 📡 Live & Games
Stream alerts for **Twitch · Kick · YouTube · Rumble**, free-games & patch-notes feeds, and a
**Steam + IGDB** "Netflix"-style game library.

## 🌍 14 languages
PL · EN · DE · ES · IT · FR · PT · ZH · KO · RU · UK · JA · AR · ID — both commands and dashboard.

## 🚀 Get started
1. **Invite** E-Bot, then open the **dashboard** to set up modules in minutes.
2. Type **/help** in Discord to search commands live.
3. Enjoying it? **/vote** to support the project ⭐

Dashboard: https://e-bot-dc.vercel.app
```

> Polski długi opis masz w README i na [`/wiki`](https://e-bot-dc.vercel.app/wiki). **Publiczność top.gg jest głównie anglojęzyczna**, więc opis EN zalecany jako główny.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🗳️ Nagrody za głos — webhook ✅ (wdrożone)

Endpoint [`dashboard/app/api/topgg/webhook/route.ts`](../dashboard/app/api/topgg/webhook/route.ts) przyjmuje webhook top.gg (obsługuje **oba modele**: **v1** — podpis HMAC SHA‑256 w nagłówku `x-topgg-signature`, payload `vote.create` z `data.user.platform_id` + `data.weight`; oraz **legacy** — nagłówek `Authorization`, payload `{ user, type, isWeekend }`), zapisuje głos (tabela `topgg_votes`) i — best‑effort — przyznaje **GT** głosującemu (głos nie jest per‑serwer → nagroda globalna przez portal, jak `/link`).

**Konfiguracja:**
1. **Sekret** — wymyśl losowy ciąg i ustaw go w DWÓCH miejscach o tej samej wartości:
   - env panelu (Vercel): `TOPGG_WEBHOOK_AUTH=<sekret>` (dla v1 to klucz podpisu HMAC, dla legacy — wartość nagłówka `Authorization`).
   - top.gg → wpis bota → **Webhooks** → *Webhook URL* = `https://e-bot-dc.vercel.app/api/topgg/webhook`, sekret/`Authorization` = `<sekret>`.
   - Bez `TOPGG_WEBHOOK_AUTH` endpoint odrzuca wszystko (**401, fail‑closed**).
2. **Schemat** — uruchom `dashboard/scripts/_ALL.sql` (zawiera już tabelę `topgg_votes`).
3. **Nagroda GT (opcjonalna)** — `TOPGG_VOTE_REWARD` = ile GT za głos (domyślnie **100**, weekend **×2**). Wymaga skonfigurowanego portalu (`GHOST_API_URL` + `GHOST_BOT_SECRET` w env panelu) **oraz** powiązanego konta gracza (`/link`); inaczej głos jest tylko zapisywany (bez GT).
4. **Test** — w panelu webhooków top.gg jest „Send test" (`type: "test"` → zapis bez nagrody).

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ✅ Checklist

- [ ] Wpis utworzony na top.gg (Client ID = `1512758748761030677`)
- [ ] 🔁 **Token API zregenerowany** (poprzedni był wklejony na czacie → spalony)
- [ ] Treść wklejona (krótki + długi opis, tagi, linki, prefix `/`)
- [ ] Wpis zaakceptowany przez moderację
- [ ] `TOPGG_TOKEN` ustawiony w env **bota** (Railway) + redeploy
- [ ] `npm run deploy` (rejestracja `/vote`)
- [ ] W logach bota: `[topgg] zaraportowano N serwerów.`
- [ ] (opcjonalnie) nagrody za głos: `TOPGG_WEBHOOK_AUTH` (Vercel + top.gg Webhooks) + `_ALL.sql` + `TOPGG_VOTE_REWARD`
- [ ] (opcjonalnie) baner/ikona wpisu, support server

<div align="center"><sub>🛰️ E‑Bot · E‑Forge — powiązane: <a href="../CHANGELOG.md">CHANGELOG</a> · <a href="ROADMAP.md">ROADMAP</a></sub></div>
