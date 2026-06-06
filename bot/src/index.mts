import { Client, GatewayIntentBits, Events, Collection, MessageFlags, Partials } from 'discord.js';
import { loadEnv } from './env.mts';
import { commands, type Command } from './commands/index.mts';
import { startNotifier } from './live/notifier.mts';
import { startAntiNuke } from './security/antinuke.mts';
import { setupMessageEarning } from './empire/messages.mts';
import { setupVoiceEarning } from './empire/voice.mts';
import { startEconomyConfigPolling } from './empire/config.mts';
import { startHeartbeat } from './cloud/heartbeat.mts';
import { startPresenceSync } from './cloud/presence.mts';
import { startSettingsSync } from './cloud/settings-sync.mts';
import { startLeveling } from './leveling.mts';
import { startTicketSync } from './cloud/ticket-sync.mts';
import { startReactionRoles } from './reaction-roles.mts';

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

// GuildMessages + GuildVoiceStates są nieprivileged i potrzebne też dla levelingu (Faza 4).
const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildModeration,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildMessageReactions,
];
if (economyOn) {
  intents.push(
    GatewayIntentBits.MessageContent,    // PRIVILEGED — enable in Dev Portal
    GatewayIntentBits.GuildMembers,      // PRIVILEGED — enable in Dev Portal
  );
}
const client = new Client({
  intents,
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

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
  // Faza 3 — integracja bot↔chmura (no-op gdy brak SUPABASE_* w .env):
  startHeartbeat(c);       // puls 'bot_status' → panel
  startPresenceSync(c);    // 'bot_presence' z panelu → setPresence
  startSettingsSync();     // Supabase → lokalny SQLite (antinuke/notify widzą zmiany z panelu)
  startLeveling(c);        // Faza 4 — XP za czat/voice + role-nagrody (config z panelu, dane → Supabase)
  startTicketSync(c);      // Faza 4 — archiwizacja wątków ticketów zamkniętych z panelu
  startReactionRoles(c);   // Faza 4 — role za reakcje (config z panelu)
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
