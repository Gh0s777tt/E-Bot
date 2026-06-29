// Ghost Empire — partia 4: natywny ekran powitalny Discord (Welcome Screen).
// Server Guide / Membership Screening ustawia się w UI serwera (API ich nie wystawia w pełni).
//   node src/setup/ghost-empire-onboarding.mts --guild <ID> [--dry-run]

import { Client, Events, GatewayIntentBits, type Guild } from 'discord.js';
import { loadEnv } from '../env.mts';
import { log } from '../lib/log.mts';

loadEnv();
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const guildArg = argv[argv.indexOf('--guild') + 1];
const token = process.env.DISCORD_BOT_TOKEN;
if (!token || !guildArg) {
  log.error('Użycie: --guild <ID>');
  process.exit(1);
}

const WELCOME = {
  enabled: true,
  description:
    '👻 Oficjalna twierdza Gh0s77tt — streamy, gry, ekonomia GT i ekipa duchów. Zweryfikuj się i wbijaj!',
  welcomeChannels: [
    {
      channel: '1507036286941401251',
      description: 'Zasady + weryfikacja (start tutaj)',
      emoji: '📜',
    },
    { channel: '1508138689501597716', description: 'Odbierz role i odblokuj kanały', emoji: '🎭' },
    { channel: '1508138817331396659', description: 'Najczęstsze pytania', emoji: '❓' },
    { channel: '1508140908959498321', description: 'Powiadomienia o streamach', emoji: '🔴' },
    { channel: '1508906936316465312', description: 'Pomoc i tickety', emoji: '🎫' },
  ],
};

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  let code = 0;
  try {
    const guild: Guild = await (await c.guilds.fetch(guildArg)).fetch();
    if (DRY) {
      console.log('Welcome Screen:', JSON.stringify(WELCOME, null, 2));
      await c.destroy();
      process.exit(0);
    }
    await guild.editWelcomeScreen(WELCOME);
    log.info('[gonb] Welcome Screen ustawiony.', { kanały: WELCOME.welcomeChannels.length });
    console.log(
      `\n✅ Ghost Empire (partia 4): ekran powitalny ON (${WELCOME.welcomeChannels.length} kanałów).\n   ℹ️ Server Guide / Membership Screening dokończ w Ustawieniach serwera → Onboarding (UI).\n`,
    );
  } catch (e) {
    log.error('[gonb] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
