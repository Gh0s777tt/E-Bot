// Rejestracja slash-komend. Guild (jeśli ustawisz DISCORD_DEV_GUILD_ID) = natychmiast; inaczej globalnie.

import { REST, Routes } from 'discord.js';
import { contextCommands } from './commands/contextmenu.mts';
import { commands } from './commands/index.mts';
import { loadEnv } from './env.mts';
import { log } from './lib/log.mts';

loadEnv();

const token = process.env.DISCORD_BOT_TOKEN;
const appId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_DEV_GUILD_ID;

if (!token || !appId) {
  log.error('Brak DISCORD_BOT_TOKEN lub DISCORD_CLIENT_ID w .env');
  process.exit(1);
}

const body = [
  ...commands.map((c) => c.data.toJSON()),
  ...contextCommands.map((c) => c.data.toJSON()),
];
const rest = new REST().setToken(token);
const route = guildId
  ? Routes.applicationGuildCommands(appId, guildId)
  : Routes.applicationCommands(appId);

const data = (await rest.put(route, { body })) as unknown[];
log.info(
  `✅ Zarejestrowano ${data.length} komend ${guildId ? `na serwerze ${guildId} (natychmiast)` : 'globalnie (propagacja do ~1h)'}.`,
);
log.info(`   Komendy: ${commands.map((c) => `/${c.data.name}`).join(', ')}`);
log.info(`   Context-menu: ${contextCommands.map((c) => c.data.name).join(', ')}`);
