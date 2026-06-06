# Bot DC

Osobisty bot twórcy + agregator biblioteki gier w **stylu Netflix**.
Discord jako centrum, powiadomienia live (Kick / Twitch / YouTube / Rumble), oraz „Netflix dla Twoich gier" (Steam · PlayStation · GOG) z metadanymi z IGDB.

> Right-sized z planu SaaS z `.docx` (patrz `docs/ANALIZA.md`). Bot działa lokalnie na PC, gotowy pod hosting.

## Co już działa (zweryfikowane)
- **Biblioteka gier** — 58 gier Steam + 121 tytułów PlayStation = **179** w SQLite, okładki/metadane z IGDB. (GOG dołączy automatycznie, gdy zainstalujesz GOG Galaxy.)
- **Web UI (Netflix)** — `web/`: hero, półki, kafelki z hover, modal, proxy okładek. Półki „Najczęściej grane", „PlayStation", „Steam", po gatunkach.
- **Bot Discord** — `bot/`: discord.js v14, komendy `/ping` i `/library`. Zalogowany jako `E-Bot#8722`.
- **Powiadomienia live** — polling Twitch/Kick/Rumble (YouTube opcjonalnie); embedy w kolorach platform.
- **Panel ustawień** — `/settings`: kanał, wzmianka, przełączniki platform → zapis do bazy, **bot czyta na żywo**.

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
