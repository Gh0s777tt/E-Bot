# ❓ FAQ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 🌐 Jaki jest poprawny adres dashboardu?
**https://e-bot-dc.vercel.app**. Adres `e-bot.vercel.app` to **inny** projekt. Po deployu zrób twardy refresh (`Ctrl+Shift+R`).

### 🧱 Dlaczego Node 26?
Korzystamy z wbudowanych: `node:sqlite` (DatabaseSync), natywnego `fetch`, `process.loadEnvFile()` oraz uruchamiania `.mts` bez bundlera (type‑stripping). Zero zależności w warstwie ingest.

### 🗄️ Supabase czy lokalny SQLite?
Oba. `dashboard/lib/data.ts` najpierw próbuje Supabase; przy błędzie wraca do lokalnego `data/bot.db`. Dzięki temu panel działa też offline.

### 🎮 Skąd biorą się okładki gier?
Z **IGDB**. Dopasowanie po Steam używa `external_game_source = 1` (a **nie** przestarzałego `category`). Token IGDB pobierany przez Twitch OAuth (client_credentials).

### 🔑 Czy w repo są klucze?
Nie. Sekrety trzymamy w `.env*` (gitignored) i w Vercel env. W repo jest tylko `.env.example`. Przed każdym pushem skan `git grep`. Patrz [[Security]].

### 🤖 Dlaczego część bota jest „w sesji 2”?
Katalog `bot/` rozwijany jest równolegle w drugiej sesji. Aby uniknąć konfliktów, ta sesja commituje **tylko** wybrane ścieżki (`dashboard/`, `docs/`, `.github/`…), nigdy `git add -A`.

### 🔗 Dlaczego `/link` jeszcze nie działa w pełni?
Wymaga `GHOST_BOT_SECRET` (wspólny sekret z E-Forge) — do uzupełnienia. Patrz `docs/ROADMAP.md`.

### 📈 Gdzie śledzić postęp?
- Plan i fazy: `docs/ROADMAP.md`, `docs/PHASES.md`
- Historia zmian: `CHANGELOG.md` (numerowane update'y `[#NNN]`)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

➡️ [[Home]] · [[Getting Started]] · [[Dashboard]]
