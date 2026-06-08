import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
  Options,
  Partials,
} from 'discord.js';
import { startActivity } from './analytics/activity.mts';
import { startDigest } from './analytics/digest.mts';
import { startEcoSeason } from './analytics/ecoSeason.mts';
import { startSeasons } from './analytics/seasons.mts';
import { startServerHistory } from './analytics/serverHistory.mts';
import { startAutomod } from './automod.mts';
import { notifyError } from './cloud/alerts.mts';
import { startHeartbeat } from './cloud/heartbeat.mts';
import { startPresenceSync } from './cloud/presence.mts';
import { startRealtimeSync } from './cloud/realtime.mts';
import { startSettingsSync } from './cloud/settings-sync.mts';
import { startTicketSync } from './cloud/ticket-sync.mts';
import { handleCustomCommand } from './commands/customCommands.mts';
import { type Command, commands } from './commands/index.mts';
import { startAfk } from './community/afk.mts';
import { startAiDigest } from './community/aidigest.mts';
import { startAiHelp } from './community/aihelp.mts';
import { startAiMod } from './community/aimod.mts';
import { handleApplicationButton, handleApplicationModal } from './community/applications.mts';
import { startAutomations } from './community/automations.mts';
import { startBirthdays } from './community/birthdays.mts';
import { startCounters } from './community/counters.mts';
import { startCounting } from './community/counting.mts';
import { startHighlights } from './community/highlights.mts';
import { startInvites } from './community/invites.mts';
import { handleQuestButton, startQuests } from './community/quests.mts';
import { startResponder } from './community/responder.mts';
import { handleSuggestionButton } from './community/suggestions.mts';
import { startClipRelay } from './creator/clips.mts';
import { startSocialFeeds } from './creator/social.mts';
import { handleBlackjackButton } from './economy/blackjack.mts';
import { startEcoInterest } from './economy/interest.mts';
import { startEconomyConfigPolling } from './empire/config.mts';
import { setupMessageEarning } from './empire/messages.mts';
import { setupVoiceEarning } from './empire/voice.mts';
import { handleButton } from './engagement/buttons.mts';
import { startGiveaways } from './engagement/giveaways.mts';
import { startReminders } from './engagement/reminders.mts';
import { handleRoleMenu } from './engagement/rolemenu.mts';
import { startScheduledPosts } from './engagement/scheduledPosts.mts';
import { startScheduler } from './engagement/scheduler.mts';
import { startStarboard } from './engagement/starboard.mts';
import { startTempVoice } from './engagement/tempvoice.mts';
import { loadEnv } from './env.mts';
import { startFreeGames } from './gaming/freegames.mts';
import { startPatchNotes } from './gaming/patchnotes.mts';
import { startPriceTracker } from './gaming/pricetracker.mts';
import { startLeveling } from './leveling.mts';
import { log } from './lib/log.mts';
import { captureError } from './lib/sentry.mts';
import { startNotifier } from './live/notifier.mts';
import { startModmail } from './modmail.mts';
import { startReactionRoles } from './reaction-roles.mts';
import { startAntiNuke } from './security/antinuke.mts';
import { startAntiRaid } from './security/antiraid.mts';
import { startModeration } from './security/moderation.mts';
import { startServerLog } from './security/serverlog.mts';
import { handleVerifyButton, handleVerifyModal } from './security/verification.mts';
import { handleTicketButton, handleTicketModal } from './tickets/interactions.mts';
import { startTicketSla } from './tickets/sla.mts';
import { startWelcome } from './welcome.mts';

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

// MessageContent + GuildMembers (privileged, włączone w Dev Portal) — wymagane przez automod (treść)
// i powitania (guildMemberAdd); trzymamy w bazie niezależnie od ekonomii.
const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildModeration,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildInvites, // Tor 3 — Invite Tracker (śledzenie zaproszeń)
  GatewayIntentBits.DirectMessages, // Faza 7 / F6.4 — modmail (DM do bota)
];
const client = new Client({
  intents,
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  // Tor 5 — ograniczenie cache wiadomości + okresowe sprzątanie (mniej RAM na Railway).
  // Bezpieczne: zdarzenia nadal działają, a brakujące wiadomości moduły dobierają fetchem.
  makeCache: Options.cacheWithLimits({
    ...Options.DefaultMakeCacheSettings,
    MessageManager: 100,
  }),
  sweepers: {
    ...Options.DefaultSweeperSettings,
    messages: { interval: 3600, lifetime: 1800 },
  },
});

// Faza 6 / B7 — globalne handlery błędów: log + alert na Discord (throttling), bez wywracania procesu.
process.on('unhandledRejection', (reason) => {
  log.error('unhandledRejection', { err: reason });
  void captureError(reason, { label: 'unhandledRejection' }); // Faza 7 / F10.3 — Sentry (gdy DSN)
  void notifyError(client, 'unhandledRejection', reason);
});
process.on('uncaughtException', (err) => {
  log.error('uncaughtException', { err });
  void captureError(err, { label: 'uncaughtException' });
  void notifyError(client, 'uncaughtException', err);
});

// GT-earning listeners — registered only when the economy is enabled (no-op otherwise).
if (economyOn) {
  setupMessageEarning(client);
  setupVoiceEarning(client);
}

const registry = new Collection<string, Command>();
for (const c of commands) registry.set(c.data.name, c);

client.once(Events.ClientReady, (c) => {
  console.log(
    `✅ Zalogowano jako ${c.user.tag} (id ${c.user.id}) · serwery: ${c.guilds.cache.size}`,
  );
  if (process.argv.includes('--smoke')) {
    console.log('🔎 smoke OK — połączenie z bramą działa, zamykam.');
    void client.destroy();
    process.exit(0);
  }
  startNotifier(c);
  startAntiNuke(c);
  startModeration(c); // Faza 7 / F6 — auto-unban tempbanów (poll Supabase)
  startServerLog(c); // Faza 7 / F6.2 — logi serwera (zdarzenia → kanał, config z panelu)
  startAntiRaid(c); // Faza 7 / F6.3 — anti-raid (fala wejść → akcja, config z panelu)
  startModmail(c); // Faza 7 / F6.4 — modmail (DM ↔ wątek obsługi, config z panelu)
  startResponder(c); // Faza 7 / F7.2 — komendy własne + autoresponder (config z panelu)
  startBirthdays(c); // Faza 7 / F7.3 — urodziny (dzienny poller, config z panelu)
  startAfk(c); // Faza 7 / F7.3 — AFK (status w pamięci, mention-reply)
  startHighlights(c); // Faza 7 / F7.3 — highlighty (DM na słowo-klucz)
  startCounters(c); // Faza 7 / F7.4 — liczniki kanałów (statystyki w nazwach, poll 10 min)
  startCounting(c); // Tor 3 — gra w liczenie (config z panelu)
  startInvites(c); // Tor 3 — Invite Tracker (śledzenie zaproszeń, config z panelu)
  startQuests(c); // Tor A2 — questy dzienne/tygodniowe (postęp w pamięci)
  startAiMod(c); // Faza 7 / F8.3 — AI-moderacja (OpenAI moderation → usuń/ostrzeż/loguj)
  startAiHelp(c); // Tor C — AI-pomoc (RAG-lite na wskazanym kanale)
  startAiDigest(c); // Tor J — dzienny AI-digest kanału
  startAutomations(c); // Tor O — automatyzacje IFTTT-lite (event → akcja)
  startFreeGames(c); // Faza 7 / F9.1 — feed darmowych gier Epic (poll 6h)
  startPatchNotes(c); // Faza 7 / F9.1 — patch-notes Steam (poll 1h)
  startPriceTracker(c); // Faza 7 / F9.3 — śledzenie cen ITAD z listy życzeń (poll 12h)
  startActivity(c); // Faza 7 / F10.1 — analityka aktywności (flush co 5 min → activity_daily)
  startServerHistory(c); // snapshot rozmiaru serwera co 30 min → server_history (wykres wzrostu)
  startEcoInterest(c); // pasywny dochód — dzienne odsetki bankowe (jeśli włączone w configu eko)
  startSeasons(c); // Faza 7 / F10.2 — sezonowe rankingi (miesięczny hall of fame, sprawdza co 6h)
  startEcoSeason(c); // sezon ekonomii — miesięczny top-eco + wypłata podium + opcjonalny reset
  startDigest(c); // Tor E — tygodniowy digest serwera (poniedziałek, config z panelu)
  // Faza 3 — integracja bot↔chmura (no-op gdy brak SUPABASE_* w .env):
  startHeartbeat(c); // puls 'bot_status' → panel
  startPresenceSync(c); // 'bot_presence' z panelu → setPresence
  startSettingsSync(); // Supabase → lokalny SQLite (antinuke/notify widzą zmiany z panelu)
  startRealtimeSync(); // Tor 5+ — Realtime (WS) → natychmiastowy sync zamiast czekania na poll
  startLeveling(c); // Faza 4 — XP za czat/voice + role-nagrody (config z panelu, dane → Supabase)
  startTicketSync(c); // Faza 4 — archiwizacja wątków ticketów zamkniętych z panelu
  startTicketSla(c); // Tor D — auto-close ticketów po bezczynności (SLA)
  startReactionRoles(c); // Faza 4 — role za reakcje (config z panelu)
  startWelcome(c); // Faza 6 — powitania + autorole
  startAutomod(c); // Faza 6 — automoderacja
  startClipRelay(c); // Faza 6 — relay klipów Twitch (config z panelu /creator)
  startSocialFeeds(c); // Faza 8 — powiadomienia o nowych postach social (RSS), config /creator
  startReminders(c); // Faza 6 / B5 — przypomnienia /remind
  startScheduler(c); // Tor F — zaplanowane/cykliczne ogłoszenia (/schedule)
  startScheduledPosts(c); // Tor F+ — zaplanowane posty bogate (Message Studio), config z panelu
  startGiveaways(c); // Faza 6 / B5 — giveawaye /giveaway
  startStarboard(c); // Faza 6 / B5 — starboard ⭐
  startTempVoice(c); // Faza 6 / B5 — kanały głosowe na żądanie
  if (economyOn) {
    startEconomyConfigPolling();
    console.log(
      '   💰 GH0ST EMPIRE economy: ON — GT za wiadomości + voice (portal: ' +
        (process.env.GHOST_API_URL || 'default') +
        ')',
    );
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    const id = interaction.customId;
    const h = id.startsWith('ticket:')
      ? handleTicketButton(interaction)
      : id.startsWith('verify:')
        ? handleVerifyButton(interaction)
        : id.startsWith('sug:')
          ? handleSuggestionButton(interaction)
          : id.startsWith('bj:')
            ? handleBlackjackButton(interaction)
            : id.startsWith('quest:')
              ? handleQuestButton(interaction)
              : id.startsWith('app:')
                ? handleApplicationButton(interaction)
                : handleButton(interaction);
    await h.catch((err) => console.error('button:', err));
    return;
  }
  if (interaction.isModalSubmit()) {
    const h = interaction.customId.startsWith('verify:')
      ? handleVerifyModal(interaction)
      : interaction.customId.startsWith('app:')
        ? handleApplicationModal(interaction)
        : handleTicketModal(interaction);
    await h.catch((err) => console.error('modal:', err));
    return;
  }
  if (interaction.isStringSelectMenu()) {
    await handleRoleMenu(interaction).catch((err) => console.error('select:', err));
    return;
  }
  if (!interaction.isChatInputCommand()) return;
  const cmd = registry.get(interaction.commandName);
  if (!cmd) {
    // komenda spoza rejestru — może być no-code komendą z panelu (settings 'custom_commands')
    await handleCustomCommand(interaction).catch((err) => console.error('custom-cmd:', err));
    return;
  }
  try {
    await cmd.execute(interaction);
  } catch (err) {
    console.error(`Błąd w /${interaction.commandName}:`, err);
    const msg = {
      content: '😵 Wystąpił błąd przy wykonywaniu komendy.',
      flags: MessageFlags.Ephemeral as const,
    };
    if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
    else await interaction.reply(msg);
  }
});

void client.login(token);
