# ── E-BOT (discord.js) — obraz produkcyjny 24/7 ───────────────────────────
# Build z KORZENIA repo:  docker build -f bot/Dockerfile -t e-bot .
# Uruchomienie:           docker run --env-file .env e-bot
FROM node:26-slim

# pnpm (corepack bywa wyłączony w nowych obrazach — instalujemy jawnie)
RUN npm i -g pnpm@11.5.2
WORKDIR /app

# Katalog na lokalny SQLite (settings-sync pobiera tu config z Supabase; bot czyta przez getSettings).
# Bez tego: "unable to open database file" → pusty config leveling/tickety/ai/antinuke.
RUN mkdir -p /app/data
ENV DATABASE_PATH=/app/data/bot.db

# Najpierw manifesty workspace (lepszy cache warstw Docker)
COPY pnpm-workspace.yaml pnpm-lock.yaml .npmrc package.json ./
COPY bot/package.json ./bot/
COPY dashboard/package.json ./dashboard/
COPY web/package.json ./web/
COPY ingest/package.json ./ingest/

# Instalujemy TYLKO zależności bota (discord.js), bez devDeps
RUN pnpm install --filter bot-dc-bot --frozen-lockfile --prod

# Kod bota (node:sqlite + fetch są wbudowane w Node 26 — zero dodatkowych warstw)
COPY bot/ ./bot/

ENV NODE_ENV=production
# Sekrety podaj przez zmienne środowiskowe platformy (NIE kopiujemy .env do obrazu).
CMD ["node", "bot/src/index.mts"]
