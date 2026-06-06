// Rejestracja slash-komend. Guild (jeśli ustawisz DISCORD_DEV_GUILD_ID) = natychmiast; inaczej globalnie.
import { REST, Routes } from 'discord.js';
import { loadEnv } from './env.mts';
import { commands } from './commands/index.mts';

loadEnv();

const token = process.env.DISCORD_BOT_TOKEN;
const appId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_DEV_GUILD_ID;

if (!token || !appId) {
  console.error('Brak DISCORD_BOT_TOKEN lub DISCORD_CLIENT_ID w .env');
  process.exit(1);
}

const body = commands.map((c) => c.data.toJSON());
const rest = new REST().setToken(token);
const route = guildId
  ? Routes.applicationGuildCommands(appId, guildId)
  : Routes.applicationCommands(appId);

const data = (await rest.put(route, { body })) as unknown[];
console.log(
  `✅ Zarejestrowano ${data.length} komend ${guildId ? `na serwerze ${guildId} (natychmiast)` : 'globalnie (propagacja do ~1h)'}.`,
);
console.log('   Komendy:', commands.map((c) => '/' + c.data.name).join(', '));
