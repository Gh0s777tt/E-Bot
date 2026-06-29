// E-Forge (hub 1515985902566899762) — Welcome Screen + Onboarding/Server Guide.
// Prompt produktowy (role produktów) zamiast gier. Graceful fallback gdy Discord
// odrzuci włączenie onboardingu (ostra bramka = mało publicznych kanałów).
//   node src/setup/eforge-onboarding.mts --guild <ID> [--dry-run]

import {
  Client,
  Events,
  GatewayIntentBits,
  type Guild,
  type GuildOnboardingEditOptions,
  type GuildOnboardingPromptData,
  GuildOnboardingPromptType,
} from 'discord.js';
import { loadEnv } from '../env.mts';
import { log } from '../lib/log.mts';

loadEnv();
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const guildArg = argv[argv.indexOf('--guild') + 1] ?? '1515985902566899762';
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  log.error('Brak DISCORD_BOT_TOKEN');
  process.exit(1);
}

const CH = {
  regulamin: '1521090262716252172',
  weryfikacja: '1521081755006799892',
  wybierzRole: '1521070182015963226',
  projekty: '1521070172981428354',
  ogloszenia: '1521070169361875026',
  aktualizacje: '1521070177540767846',
  live: '1521092071891538030',
  zgloszenie: '1521070197702660146',
};
const PRODUCTS: [string, string, string][] = [
  ['E-Forge (platforma)', '1521075998035279903', '🏭'],
  ['E-Bot (bot Discord)', '1521070137795674113', '🤖'],
  ['E-Logistic', '1521070136881320078', '🚚'],
  ['WatchNet', '1521070139142045696', '🛰️'],
  ['E-Tacho', '1521070140135968799', '⏱️'],
  ['E-Scaner', '1521070141020962857', '📄'],
  ['E-OS', '1521070142157492305', '🦀'],
  ['Minecraft / Nemesis', '1521070143331893421', '⛏️'],
];
const ANNOUNCE_ROLE = '1521070144053313629';

const WELCOME = {
  enabled: true,
  description: '⚙️ Hub ekosystemu E-Forge — zweryfikuj się i wybierz produkty, które Cię interesują!',
  welcomeChannels: [
    { channel: CH.regulamin, description: 'Zasady + weryfikacja (start)', emoji: '📜' },
    { channel: CH.wybierzRole, description: 'Wybierz role produktów', emoji: '🎭' },
    { channel: CH.projekty, description: 'Co budujemy', emoji: '🗺️' },
    { channel: CH.ogloszenia, description: 'Ogłoszenia i aktualizacje', emoji: '📢' },
    { channel: CH.zgloszenie, description: 'Pomoc / kontakt', emoji: '🎫' },
  ],
};

const prompts: GuildOnboardingPromptData[] = [
  {
    title: '🧩 Które produkty Cię interesują?',
    type: GuildOnboardingPromptType.Dropdown,
    singleSelect: false,
    required: false,
    inOnboarding: true,
    options: PRODUCTS.map(([title, roleId, emoji]) => ({ title, roles: [roleId], emoji })),
  },
  {
    title: '🔔 Powiadomienia',
    type: GuildOnboardingPromptType.MultipleChoice,
    singleSelect: false,
    required: false,
    inOnboarding: true,
    options: [{ title: 'Ogłoszenia i nowości', roles: [ANNOUNCE_ROLE], emoji: '🔔' }],
  },
];

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  let code = 0;
  try {
    const guild: Guild = await (await c.guilds.fetch(guildArg)).fetch();

    if (DRY) {
      console.log('Welcome Screen kanałów:', WELCOME.welcomeChannels.length);
      console.log('Onboarding prompty: produkty(', PRODUCTS.length, ') + powiadomienia(1)');
      await c.destroy();
      process.exit(0);
    }

    // 1) Welcome Screen (fallback: tylko regulamin + weryfikacja, gdyby odrzucił bramkowane)
    try {
      await guild.editWelcomeScreen(WELCOME);
      log.info('[efo] Welcome Screen ustawiony.', { kanały: WELCOME.welcomeChannels.length });
    } catch (e1) {
      log.warn('[efo] Welcome Screen — pełny odrzucony, próbuję minimalny.', { err: (e1 as Error).message });
      await guild
        .editWelcomeScreen({
          enabled: true,
          description: WELCOME.description,
          welcomeChannels: [
            { channel: CH.regulamin, description: 'Zasady + weryfikacja (start)', emoji: '📜' },
            { channel: CH.weryfikacja, description: 'Zweryfikuj się', emoji: '✅' },
          ],
        })
        .then(() => log.info('[efo] Welcome Screen (minimalny) ustawiony.'))
        .catch((e) => log.error('[efo] Welcome Screen nieudany', { err: (e as Error).message }));
    }

    // 2) Onboarding
    const base: GuildOnboardingEditOptions = {
      prompts,
      defaultChannels: [CH.regulamin, CH.weryfikacja], // tylko publiczne (reszta za bramką)
      mode: 0,
      reason: 'E-Forge: Server Guide',
    };
    try {
      await guild.editOnboarding({ ...base, enabled: true });
      log.info('[efo] Onboarding WŁĄCZONY.');
      console.log('\n✅ E-Forge hub: Welcome Screen + Onboarding WŁĄCZONE (prompt produktowy + powiadomienia).\n');
    } catch (e1) {
      log.warn('[efo] Onboarding — włączenie odrzucone, zapis enabled:false.', { err: (e1 as Error).message });
      await guild
        .editOnboarding({ ...base, enabled: false })
        .then(() =>
          console.log(
            `\n✅ Welcome Screen ustawiony.\n⚠️ Onboarding SKONFIGUROWANY, ale NIEwłączony.\n   Powód: ${(e1 as Error).message}\n   → Hub ma ostrą bramkę (mało publicznych kanałów); Discord wymaga ≥5 do pisania dla @everyone.\n   → Włącz w UI (Ustawienia → Onboarding) albo zostaw — bramka bota i tak prowadzi nowych.\n`,
          ),
        )
        .catch((e2) => {
          log.error('[efo] Zapis onboardingu nieudany', { err: (e2 as Error).message });
          code = 1;
        });
    }
  } catch (e) {
    log.error('[efo] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
