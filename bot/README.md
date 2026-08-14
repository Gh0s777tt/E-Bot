# Bot DC — rdzeń bota (Discord)

discord.js v14 + lekki framework komend. Sekrety czytane z głównego `../.env`.

## Uruchomienie
```bash
cd bot
npm install
npm run deploy   # rejestracja slash-komend (globalnie lub na DISCORD_DEV_GUILD_ID)
npm start        # bot wchodzi online
npm run smoke    # test: loguje się, potwierdza i wychodzi
```

## Komendy
Bot rejestruje **102 slash-komendy** + **4 komendy menu kontekstowego** (audyt 2026-08: sekcja
wymieniała 2 komendy ze 102 — pełna lista żyje w kodzie, nie w README). Źródło prawdy:
- rejestr slash-komend: [`src/commands/index.mts`](src/commands/index.mts) (opisy ×14 języków: `src/i18n/commandDescriptions.mts`)
- menu kontekstowe: [`src/commands/contextmenu.mts`](src/commands/contextmenu.mts)
- na Discordzie: `/help` (kategorie + wyszukiwarka) i `/tutorial` (samouczek krok po kroku)

Przykłady: `/ping` (latencja), `/library [szukaj]` (biblioteka gier Steam + IGDB), `/rank`, `/eco`,
`/ticket`, `/giveaway`, `/ai`… Duża część konfiguracji (automod, powitania, reaction-role, poziomy)
jest sterowana z panelu (`dashboard/`), nie komendami.

## Zaproszenie bota na serwer
Otwórz (uprawnienia: widok kanałów, wysyłanie, embedy, załączniki, historia, wzmianki + anti-nuke: audit-log, ban, kick, timeout, zarządzanie rolami):

https://discord.com/oauth2/authorize?client_id=1512758748761030677&scope=bot+applications.commands&permissions=1099780312198

> Wskazówka: ustaw `DISCORD_DEV_GUILD_ID` w `.env` na ID swojego serwera testowego —
> komendy pojawią się natychmiast (globalne propagują się do ~1h).
