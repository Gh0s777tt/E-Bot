// E-Forge (hub) — menu ról produktów jako rozwijane menu (rsel, stateless).
// Wymaga handlera roleselect (już na main). node ... --guild <ID> [--dry-run]

import {
  ActionRowBuilder,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  type Guild,
  type SelectMenuComponentOptionData,
  StringSelectMenuBuilder,
  type TextChannel,
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

const BRAND = 0xe50914;
const WYBIERZ_ROLE = '1521070182015963226';
const OPTS: [string, string, string][] = [
  ['E-Forge (platforma)', '1521075998035279903', '🏭'],
  ['E-Bot', '1521070137795674113', '🤖'],
  ['E-Logistic', '1521070136881320078', '🚚'],
  ['WatchNet', '1521070139142045696', '🛰️'],
  ['E-Tacho', '1521070140135968799', '⏱️'],
  ['E-Scaner', '1521070141020962857', '📄'],
  ['E-OS', '1521070142157492305', '🦀'],
  ['Minecraft / Nemesis', '1521070143331893421', '⛏️'],
  ['Ogłoszenia', '1521070144053313629', '🔔'],
];

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  let code = 0;
  try {
    const guild: Guild = await (await c.guilds.fetch(guildArg)).fetch();
    const ch = guild.channels.cache.get(WYBIERZ_ROLE) ?? (await guild.channels.fetch(WYBIERZ_ROLE));
    if (!ch?.isTextBased()) {
      log.error('[efr] #wybierz-role nie znaleziony.');
      await c.destroy();
      process.exit(1);
    }
    const channel = ch as TextChannel;

    if (DRY) {
      console.log('Dropdown produktów:', OPTS.length, 'opcji');
      await c.destroy();
      process.exit(0);
    }

    // Usuń stare wiadomości bota (rolemenu produktów) w #wybierz-role
    const recent = await channel.messages.fetch({ limit: 30 }).catch(() => null);
    let del = 0;
    if (recent)
      for (const m of recent.values())
        if (m.author.id === c.user.id) {
          await m.delete().catch(() => {});
          del++;
        }

    const menu = new StringSelectMenuBuilder()
      .setCustomId('rsel:produkty')
      .setPlaceholder('Wybierz produkty…')
      .setMinValues(0)
      .setMaxValues(OPTS.length);
    const options: SelectMenuComponentOptionData[] = OPTS.map(([label, value, emoji]) => ({ label, value, emoji }));
    menu.addOptions(options);

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(BRAND)
          .setTitle('🎭 Wybierz role produktów')
          .setDescription('Zaznacz produkty, które Cię interesują — zyskasz dostęp do dyskusji i powiadomień o nowościach.')
          .setFooter({ text: 'E-Forge' }),
      ],
      components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)],
    });

    log.info('[efr] GOTOWE.', { usunięto: del, opcji: OPTS.length });
    console.log(`\n✅ E-Forge hub: dropdown ról produktów (${OPTS.length}) w #wybierz-role (usunięto ${del} starych).\n   ⚠️ Działa po deployu handlera roleselect (już na main).\n`);
  } catch (e) {
    log.error('[efr] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
