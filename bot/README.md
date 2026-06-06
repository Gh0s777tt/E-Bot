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
- `/ping` — latencja (API + WebSocket)
- `/library [szukaj]` — Twoja biblioteka gier z bazy (Steam + IGDB), embed w czerwieni Netflix

## Zaproszenie bota na serwer
Otwórz (uprawnienia: widok kanałów, wysyłanie, embedy, załączniki, historia, wzmianki + anti-nuke: audit-log, ban, kick, timeout, zarządzanie rolami):

https://discord.com/oauth2/authorize?client_id=1512758748761030677&scope=bot+applications.commands&permissions=1099780312198

> Wskazówka: ustaw `DISCORD_DEV_GUILD_ID` w `.env` na ID swojego serwera testowego —
> komendy pojawią się natychmiast (globalne propagują się do ~1h).
