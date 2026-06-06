import { Client, GatewayIntentBits, Events, Collection, MessageFlags } from 'discord.js';
import { loadEnv } from './env.mts';
import { commands, type Command } from './commands/index.mts';
import { startNotifier } from './live/notifier.mts';
import { startAntiNuke } from './security/antinuke.mts';
import { setupMessageEarning } from './empire/messages.mts';
import { setupVoiceEarning } from './empire/voice.mts';
import { startEconomyConfigPolling } from './empire/config.mts';

loadEnv();

// GH0ST EMPIRE Discord economy (GT for messages + voice). Opt-in: set GHOST_ECONOMY=1 AND
// GHOST_BOT_SECRET, AND enable the MessageContent + Server Members privileged intents in the
// Discord Dev Portal (otherwise the gateway rejects the login). Off by default so E-Bot's
// existing features (library / live notifs / antinuke / commands) are untouched.
const economyOn =
  (process.env.GHOST_ECONOMY === '1' || process.env.GHOST_ECONOMY === 'true') &&
  !!process.env.GHOST_BOT_SECRET;

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error('❌ Brak DISCORD_BOT_TOKEN w .env');
  process.exit(1);
}

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildModeration];
if (economyOn) {
  intents.push(
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,    // PRIVILEGED — enable in Dev Portal
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,      // PRIVILEGED — enable in Dev Portal
  );
}
const client = new Client({ intents });

// GT-earning listeners — registered only when the economy is enabled (no-op otherwise).
if (economyOn) {
  setupMessageEarning(client);
  setupVoiceEarning(client);
}

const registry = new Collection<string, Command>();
for (const c of commands) registry.set(c.data.name, c);

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Zalogowano jako ${c.user.tag} (id ${c.user.id}) · serwery: ${c.guilds.cache.size}`);
  if (process.argv.includes('--smoke')) {
    console.log('🔎 smoke OK — połączenie z bramą działa, zamykam.');
    void client.destroy();
    process.exit(0);
  }
  startNotifier(c);
  startAntiNuke(c);
  if (economyOn) {
    startEconomyConfigPolling();
    console.log('   💰 GH0ST EMPIRE economy: ON — GT za wiadomości + voice (portal: ' + (process.env.GHOST_API_URL || 'default') + ')');
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = registry.get(interaction.commandName);
  if (!cmd) return;
  try {
    await cmd.execute(interaction);
  } catch (err) {
    console.error(`Błąd w /${interaction.commandName}:`, err);
    const msg = { content: '😵 Wystąpił błąd przy wykonywaniu komendy.', flags: MessageFlags.Ephemeral as const };
    if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
    else await interaction.reply(msg);
  }
});

void client.login(token);
