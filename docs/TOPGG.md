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
2. **Add Bot** → wklej **Client ID** bota (to samo `DISCORD_CLIENT_ID`). top.gg zweryfikuje, że jesteś właścicielem/teammem aplikacji w Discord Developer Portal.
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

## 📋 Treść wpisu (do wklejenia)

**Krótki opis (PL):**
> Wielomodułowy bot Discord: moderacja, anti‑nuke, leveling, ekonomia, tickety, AI, biblioteka gier i powiadomienia live — z panelem web.

**Short description (EN):**
> Multi‑module Discord bot: moderation, anti‑nuke, leveling, economy, tickets, AI, game library and live alerts — all with a web dashboard.

**Prefix:** `/` (slash commands)

**Tagi (max 5):** `Moderation` · `Leveling` · `Economy` · `Utility` · `Fun`

**Linki:**
- **Invite:** `https://discord.com/oauth2/authorize?client_id=<DISCORD_CLIENT_ID>&permissions=8&scope=bot%20applications.commands`
- **Website / Dashboard:** `https://e-bot-dc.vercel.app`
- **Support Server:** *(wklej zaproszenie na swój serwer wsparcia, jeśli masz)*

**Długi opis (EN, markdown — top.gg renderuje Markdown):**

```markdown
# E-Bot — your all-in-one Discord companion ⚙️🔥

A multi-module bot with a full **web dashboard** (configure everything in the browser).
**95+ slash commands**, background services, and **14 languages**.

## ✨ Highlights
- 🛡️ **Security** — Anti-Nuke (audit-log detection), Anti-Raid, automod, verification, modmail, mod-logs
- 📈 **Leveling** — XP, role rewards, seasons & Hall of Fame, battle-pass
- 💰 **Economy** — currency, shop, jobs, gambling, market, stocks, pets, cards
- 🎫 **Tickets** — support panels with claiming & transcripts
- 🤖 **AI** — chat with memory, image description, AI moderation, `/imagine`
- 📡 **Live alerts** — Twitch · Kick · YouTube · Rumble
- 🎮 **Game library** — Steam + IGDB "Netflix"-style library
- 🌍 **14 languages** + per-server configuration

## 🚀 Get started
1. Invite the bot, then open the **dashboard** to configure modules.
2. Type `/help` in Discord to browse commands live.
3. Like it? `/vote` to support the project on top.gg ⭐

Dashboard: https://e-bot-dc.vercel.app
```

> Polską wersję długiego opisu masz w README i na [`/wiki`](https://e-bot-dc.vercel.app/wiki) — możesz ją skrócić do top.gg, ale **publiczność top.gg jest głównie anglojęzyczna**, więc opis EN jest zalecany jako główny.

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

- [ ] Wpis utworzony na top.gg (Client ID = `DISCORD_CLIENT_ID`)
- [ ] Treść wklejona (krótki + długi opis, tagi, linki, prefix `/`)
- [ ] Wpis zaakceptowany przez moderację
- [ ] `TOPGG_TOKEN` ustawiony w env **bota** (Railway) + redeploy
- [ ] `npm run deploy` (rejestracja `/vote`)
- [ ] W logach bota: `[topgg] zaraportowano N serwerów.`
- [ ] (opcjonalnie) nagrody za głos: `TOPGG_WEBHOOK_AUTH` (Vercel + top.gg Webhooks) + `_ALL.sql` + `TOPGG_VOTE_REWARD`
- [ ] (opcjonalnie) baner/ikona wpisu, support server

<div align="center"><sub>🛰️ E‑Bot · E‑Forge — powiązane: <a href="../CHANGELOG.md">CHANGELOG</a> · <a href="ROADMAP.md">ROADMAP</a></sub></div>
