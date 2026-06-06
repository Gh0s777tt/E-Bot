# Bot DC

Osobisty bot twórcy + agregator biblioteki gier w **stylu Netflix**.
Discord jako centrum, powiadomienia live (Kick / Twitch / YouTube / Rumble), oraz „Netflix dla Twoich gier" (Steam · PlayStation · GOG) z metadanymi z IGDB.

> Right-sized z planu SaaS z `.docx` (patrz `docs/ANALIZA.md`). Bot działa lokalnie na PC, gotowy pod hosting.

## Co już działa (zweryfikowane)
- **Biblioteka gier** — 58 gier Steam + 121 tytułów PlayStation = **179** w SQLite, okładki/metadane z IGDB. (GOG dołączy automatycznie, gdy zainstalujesz GOG Galaxy.)
- **Web UI (Netflix)** — `web/`: hero, półki, kafelki z hover, modal, proxy okładek. Półki „Najczęściej grane", „PlayStation", „Steam", po gatunkach.
- **Bot Discord** — `bot/`: discord.js v14, komendy `/ping` · `/library` · `/link` · `/portal` · `/antinuke`. Zalogowany jako `E-Bot#8722`. **Ekonomia GH0ST EMPIRE** (GT za czat/voice + linkowanie kont) — patrz sekcja „Integracja GH0ST EMPIRE".
- **Powiadomienia live** — polling Twitch/Kick/Rumble (YouTube opcjonalnie); embedy w kolorach platform.
- **Panel ustawień** — `/settings`: kanał, wzmianka, przełączniki platform → zapis do bazy, **bot czyta na żywo**.

## Integracja GH0ST EMPIRE — ekonomia Discord

E-Bot jest **Discordowym ramieniem GH0ST EMPIRE** (Empire Bot ogarnia streaming: Twitch/Kick/YT/Rumble; E-Bot ogarnia Discord + społeczność). Przejmuje rolę dawnego `ghost-empire-bot`: nalicza **Ghost Tokens (GT)** za aktywność na Discordzie i łączy konta z portalem. Saldo GT żyje w portalu (Postgres) — E-Bot tylko woła jego API.

- **`/link <kod>`** — wiąże Discord z profilem GH0ST EMPIRE (`bot/src/commands/link.mts`).
- **`/portal`** — link do portalu + jak zarabiać GT (`bot/src/commands/portal.mts`).
- **GT za wiadomości + voice** — `bot/src/empire/*` woła `POST /api/internal/award`; stawki konfiguruje się **na żywo** w portalu (`/admin#bot`, polling `/api/bot/config`).

### Włączenie ekonomii (opt-in — domyślnie OFF, by nie ruszać reszty E-Bota)
1. W głównym `.env` (repo Bot DC):
   - `GHOST_ECONOMY=1`
   - `GHOST_BOT_SECRET=<ten sam sekret co portal GE>` *(już ustawiony dla `/link`)*
   - `GHOST_API_URL=https://ghost-empire-web.vercel.app` *(domyślny; już dla `/link`)*
   - opcjonalnie: `DISCORD_GUILD_ID=<id serwera społeczności>` (zawęża naliczanie), oraz nadpisania nagród `GHOST_MESSAGE_REWARD` / `GHOST_MESSAGE_COOLDOWN_SECONDS` / `GHOST_VOICE_REWARD_PER_MINUTE` / `GHOST_VOICE_TICK_SECONDS` / `GHOST_AFK_GIVES_REWARD` / `GHOST_MUTED_GIVES_REWARD`.
2. **Discord Dev Portal** (aplikacja E-Bot) → Bot → **Privileged Gateway Intents**: włącz **Message Content** i **Server Members**. ⚠️ Bez tego bot z `GHOST_ECONOMY=1` **nie zaloguje się** (brama odrzuci intencje).
3. Zarejestruj nowe komendy: `cd bot && npm run deploy` (dodaje `/portal`).
4. Restart bota. W logach pojawi się `💰 GH0ST EMPIRE economy: ON`.
5. **Wyłącz stary `ghost-empire-bot`** (w repo `ghost-empire-phase1`) — jest już zastąpiony przez E-Bota.

## Uruchomienie
```bash
# 1) Biblioteka gier → SQLite (Steam + PSN + GOG):
node ingest/sync.mts

# 2) Web (Netflix) — http://localhost:3000 oraz /settings:
cd web && npm install && npm run dev

# 3) Bot Discord:
cd bot && npm install && npm run deploy   # rejestracja komend
cd bot && npm start                       # bot online + powiadomienia live
```

## Pozostaje do zrobienia (po Twojej stronie)
1. **Zaproś bota** na serwer (link w `bot/README.md`) i w `/settings` ustaw **ID kanału** powiadomień.
2. (Opcjonalnie) **GOG** — zainstaluj GOG Galaxy, kolektor sam je wykryje.
3. (Opcjonalnie) **Discord OAuth** do panelu — wymaga dodania redirect URI w portalu Discord (do dorobienia).
4. Naprawa martwych kluczy: Cloudflare, Gemini; doładowanie Grok/X (patrz `docs/SECRETS.md`).

## Struktura
```
ingest/   kolektory: steam, psn, gog, igdb → data/bot.db   (node ingest/sync.mts)
web/      Next.js (Netflix UI + /settings + /api/img proxy)
bot/      discord.js v14 (komendy + powiadomienia live)
data/     bot.db (SQLite, gitignored)
docs/     ANALIZA.md · DESIGN.md · SECRETS.md
.env      sekrety (gitignored)
```

## Stos
Node LTS · node:sqlite (→ Drizzle/Postgres przy hostingu) · discord.js v14 · Next.js + Tailwind + Framer Motion + Embla · IGDB (przez OAuth Twitcha) · hosting docelowy Vercel.

## Bezpieczeństwo
Sekrety tylko w `.env` (gitignored). Po zakończeniu prac — rotacja kluczy (`docs/SECRETS.md`). Skan: Snyk (zależności) + GitGuardian (sekrety).
