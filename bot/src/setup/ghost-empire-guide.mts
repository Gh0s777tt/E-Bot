// Ghost Empire — natywny Server Guide / Onboarding (Discord API).
// Prompty nadają role (gry / powiadomienia). Włączenie onboardingu ma twarde wymogi
// Discorda (≥7 domyślnych kanałów, ≥5 „do pisania" dla @everyone) — jeśli odrzuci przez
// bramkę, zapisujemy prompty z enabled:false (dokończenie w UI).
//   node src/setup/ghost-empire-guide.mts --guild <ID> [--dry-run]

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
const guildArg = argv[argv.indexOf('--guild') + 1];
const token = process.env.DISCORD_BOT_TOKEN;
if (!token || !guildArg) {
  log.error('Użycie: --guild <ID>');
  process.exit(1);
}

const DEFAULT_CH = [
  '1508138516033306856', // witaj
  '1507036286941401251', // regulamin
  '1508138609625272460', // ogłoszenia
  '1508138689501597716', // auto-role
  '1508138817331396659', // faq
  '1508138984273088532', // mapa
  '1508140908959498321', // live-now
];
const GAMES: [string, string][] = [
  ['CS2', '1508147352064622705'],
  ['Valorant', '1508147410055073945'],
  ['GTA RP', '1508147381881933944'],
  ['League of Legends', '1508147438404243536'],
  ['Fortnite', '1508147464002207854'],
  ['Warzone', '1508147490417934596'],
  ['Minecraft', '1508148110302642257'],
  ['Rust', '1508149228998889665'],
  ['Dota 2', '1508148490994188348'],
  ['Cyberpunk 2077', '1508147568335654992'],
];
const NOTIF: [string, string, string][] = [
  ['Streamy na żywo', '1508146857379893520', '🔔'],
  ['Giveawaye', '1508147009159430205', '🎁'],
  ['Eventy', '1508147044500377651', '🏆'],
  ['News', '1508147097667637248', '📰'],
];

const prompts: GuildOnboardingPromptData[] = [
  {
    title: '🎮 W co grasz?',
    type: GuildOnboardingPromptType.Dropdown,
    singleSelect: false,
    required: false,
    inOnboarding: true,
    options: GAMES.map(([title, roleId]) => ({ title, roles: [roleId] })),
  },
  {
    title: '🔔 Co Cię interesuje?',
    type: GuildOnboardingPromptType.MultipleChoice,
    singleSelect: false,
    required: false,
    inOnboarding: true,
    options: NOTIF.map(([title, roleId, emoji]) => ({ title, roles: [roleId], emoji })),
  },
];

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  let code = 0;
  try {
    const guild: Guild = await (await c.guilds.fetch(guildArg)).fetch();

    if (DRY) {
      console.log(`Prompty: 🎮 gry(${GAMES.length}), 🔔 powiadomienia(${NOTIF.length})`);
      console.log('Domyślne kanały:', DEFAULT_CH.length);
      await c.destroy();
      process.exit(0);
    }

    const base: GuildOnboardingEditOptions = {
      prompts,
      defaultChannels: DEFAULT_CH,
      mode: 0, // OnboardingDefault
      reason: 'Ghost Empire: Server Guide',
    };
    try {
      await guild.editOnboarding({ ...base, enabled: true });
      log.info('[ggd] Onboarding WŁĄCZONY.');
      console.log(
        '\n✅ Ghost Empire: Server Guide / Onboarding WŁĄCZONY (prompty: gry + powiadomienia).\n',
      );
    } catch (e1) {
      log.warn('[ggd] Włączenie odrzucone — zapisuję prompty z enabled:false.', {
        err: (e1 as Error).message,
      });
      try {
        await guild.editOnboarding({ ...base, enabled: false });
        console.log(
          `\n⚠️ Onboarding SKONFIGUROWANY, ale NIEwłączony.\n   Powód: ${(e1 as Error).message}\n   → Discord wymaga ≥5 kanałów „do pisania" dla @everyone, co kłóci się z bramką.\n   → Dokończ w: Ustawienia serwera → Onboarding → Włącz (albo zostaw bramkę bota i pomiń natywny onboarding).\n`,
        );
      } catch (e2) {
        log.error('[ggd] Zapis promptów też nieudany', { err: (e2 as Error).message });
        console.log(`\n❌ Nie udało się zapisać onboardingu: ${(e2 as Error).message}\n`);
        code = 1;
      }
    }
  } catch (e) {
    log.error('[ggd] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
