import { Client, GatewayIntentBits, Events, Collection, MessageFlags } from 'discord.js';
import { loadEnv } from './env.mts';
import { commands, type Command } from './commands/index.mts';
import { startNotifier } from './live/notifier.mts';
import { startAntiNuke } from './security/antinuke.mts';

loadEnv();

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error('❌ Brak DISCORD_BOT_TOKEN w .env');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildModeration] });

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
