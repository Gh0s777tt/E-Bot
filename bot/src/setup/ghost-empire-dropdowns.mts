// ════════════════════════════════════════════════════════════════════════════
//  Ghost Empire — wszystkie auto-role jako ROZWIJANE MENU (rsel, stateless)
// ════════════════════════════════════════════════════════════════════════════
//  Usuwa stare panele (rolemenu gier + reakcje) z #auto-role i publikuje 5 dropdownów:
//  Gry · Zodiak · Powiadomienia · Płeć · Wiek (z customowymi emoji serwera).
//  WYMAGA: handler engagement/roleselect.mts wpięty w index.mts → redeploy bota.
//    node src/setup/ghost-empire-dropdowns.mts --guild <ID>
// ════════════════════════════════════════════════════════════════════════════

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
import { cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { setSetting } from '../lib/db.mts';
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

const BRAND = 0x8b1a1a;
const AUTO_ROLE = '1508138689501597716';
type Emo = string | { id: string; name: string; animated?: boolean };
const ce = (id: string, name: string, animated = false) => ({ id, name, animated });

// [label, roleId, emoji?]
type Opt = [string, string, Emo?];
const GAMES: Opt[] = [
  ['CS2', '1508147352064622705', ce('1508556004009316433', 'cs')],
  ['GTA RP', '1508147381881933944', ce('1508550415124398173', '2934gtavi')],
  ['Valorant', '1508147410055073945', ce('1508549863942656203', 'valorant', true)],
  ['League of Legends', '1508147438404243536', ce('1508555834957758555', '_lol_')],
  ['Fortnite', '1508147464002207854', ce('1508550361286185030', '1537gamesfortnite')],
  ['Warzone', '1508147490417934596', ce('1508550037779644548', 'COD_Modern_Warfare')],
  ['ReadSec', '1508147515961249894'],
  ['Warframe', '1508147542888681666', ce('1508556482701164666', 'Warframe39')],
  ['Cyberpunk 2077', '1508147568335654992'],
  ['Minecraft', '1508148110302642257', ce('1508555568342896821', '334930minecraft')],
  ['Hytale', '1508148154686767256', ce('1508555566782353408', '830638hytale')],
  ['Deadlock', '1508148181681180722', ce('1508550085665882122', 'logodeadlock')],
  ['Payday 3', '1508148258017509539', ce('1508555564907495528', 'payday')],
  ['Subnautica', '1508148397079789738', ce('1508555563326509266', '82727subnauticasoldier')],
  ['Dota 2', '1508148490994188348', ce('1508555560788951171', '990808dota2')],
  ['Diablo', '1508148512812957859', ce('1508550028199858256', 'Diablo_IV58')],
  ['Path of Exile', '1508149086925361445', ce('1508555558758645890', '69901poe')],
  ['ARC Riders', '1508149176091807916', ce('1508555557038985459', '559058arcraiders')],
  ['Rust', '1508149228998889665', ce('1508555555416047716', '1355rust')],
  ['Ready or Not', '1508150282742403275', ce('1508555552962121778', '2022readyornot')],
  ['World of Tanks', '1508150487419981914', ce('1508555550869295104', '4597wot')],
  ['PUBG', '1508150546429907147', ce('1508555365988433960', '24367pubgsteam')],
];
const ZODIAK: Opt[] = [
  ['Baran', '1508573375205871657', ce('1508570487578689576', '5637zodiacaries', true)],
  ['Byk', '1508573458563596559', ce('1508570574417563850', '9780zodiactaurus', true)],
  ['Bliźnięta', '1508573552411017277', ce('1508570454238040255', '4843zodiacgemini', true)],
  ['Rak', '1508573598418469056', ce('1508570546382704751', '9634zodiaccancer', true)],
  ['Lew', '1508573647630106754', ce('1508570544361046107', '9624zodiacleo', true)],
  ['Panna', '1508573723819638986', ce('1508570483296305283', '5003zodiacvirgo', true)],
  ['Waga', '1508573759135682600', ce('1508570426606096595', '2220zodiaclibra', true)],
  ['Skorpion', '1508612219976421537', ce('1508570420062978228', '1384zodiacscorpio', true)],
  ['Strzelec', '1508612341070168204', ce('1508570458621083779', '3882zodiacsagittarius', true)],
  ['Koziorożec', '1508612448553537646', ce('1508570515198185654', '7821zodiaccapricorn', true)],
  ['Wodnik', '1508612483806662797', ce('1508570541483884574', '9163zodiacaquarius', true)],
  ['Ryby', '1508612550785503352', ce('1508570462580510831', '4754zodiacpisces', true)],
];
const NOTIF: Opt[] = [
  ['Live Notifs', '1508146857379893520', '🔔'],
  ['Giveaway', '1508147009159430205', '🎁'],
  ['Eventy', '1508147044500377651', '🏆'],
  ['Premiery', '1508147069825847459', '📅'],
  ['News', '1508147097667637248', '📰'],
  ['No Pings', '1508147129254940892', '🔇'],
];
const PLEC: Opt[] = [
  ['Chłopak', '1508612781052661810', ce('1508550013674983555', 'boy')],
  ['Dziewczyna', '1508612878415040522', ce('1508549992527429763', '57772femalesymbol')],
];
const WIEK: Opt[] = [
  ['+18', '1508613011953291375', ce('1508549960940126208', 'age_18_plus78', true)],
  ['-18', '1508613046418018315', ce('1508549945500635167', 'age_18_less60', true)],
];

const GROUPS: {
  id: string;
  title: string;
  desc: string;
  ph: string;
  exclusive: boolean;
  opts: Opt[];
}[] = [
  {
    id: 'games',
    title: '🎮 Gry',
    desc: 'Wybierz gry, w które grasz — **odblokujesz ich kanały**.',
    ph: 'Wybierz gry…',
    exclusive: false,
    opts: GAMES,
  },
  {
    id: 'zodiak',
    title: '♈ Znak zodiaku',
    desc: 'Wybierz swój znak zodiaku.',
    ph: 'Wybierz znak…',
    exclusive: true,
    opts: ZODIAK,
  },
  {
    id: 'notif',
    title: '🔔 Powiadomienia',
    desc: 'Wybierz, o czym chcesz dostawać pingi.',
    ph: 'Wybierz powiadomienia…',
    exclusive: false,
    opts: NOTIF,
  },
  {
    id: 'plec',
    title: '👤 Płeć',
    desc: 'Wybierz swoją płeć.',
    ph: 'Wybierz…',
    exclusive: true,
    opts: PLEC,
  },
  {
    id: 'wiek',
    title: '🔞 Wiek',
    desc: 'Wybierz swój przedział wiekowy.',
    ph: 'Wybierz…',
    exclusive: true,
    opts: WIEK,
  },
];

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  let code = 0;
  try {
    const guild: Guild = await (await c.guilds.fetch(guildArg)).fetch();
    const ch = guild.channels.cache.get(AUTO_ROLE) ?? (await guild.channels.fetch(AUTO_ROLE));
    if (!ch?.isTextBased()) {
      log.error('[ged] #auto-role nie znaleziony.');
      await c.destroy();
      process.exit(1);
    }
    const channel = ch as TextChannel;

    if (DRY) {
      console.log('Dropdowny:', GROUPS.map((g) => `${g.title}(${g.opts.length})`).join(' · '));
      await c.destroy();
      process.exit(0);
    }

    // Usuń stare wiadomości bota w #auto-role (rolemenu gier + panele reakcji)
    const recent = await channel.messages.fetch({ limit: 50 }).catch(() => null);
    let del = 0;
    if (recent)
      for (const m of recent.values())
        if (m.author.id === c.user.id) {
          await m.delete().catch(() => {});
          del++;
        }

    // Wyczyść reaction_roles (globalne) — panele reakcji usunięte
    setSetting('reaction_roles', '[]');
    if (hasCloud()) await cloudSetSetting('reaction_roles', '[]').catch(() => {});

    // Intro
    await channel
      .send({
        embeds: [
          new EmbedBuilder()
            .setColor(BRAND)
            .setTitle('🎭 Wybierz swoje role')
            .setDescription(
              'Użyj rozwijanych menu poniżej, aby przypisać sobie role. Gry **odblokowują kanały**, reszta to oznaczenia i powiadomienia. Możesz zmieniać w każdej chwili.',
            )
            .setFooter({ text: 'Ghost Empire' }),
        ],
      })
      .catch(() => {});

    // 5 dropdownów
    let posted = 0;
    for (const g of GROUPS) {
      const menu = new StringSelectMenuBuilder()
        .setCustomId(`rsel:${g.id}`)
        .setPlaceholder(g.ph)
        .setMinValues(0)
        .setMaxValues(g.exclusive ? 1 : g.opts.length);
      const options: SelectMenuComponentOptionData[] = g.opts.map(([label, value, emoji]) => ({
        label,
        value,
        ...(emoji ? { emoji } : {}),
      }));
      menu.addOptions(options);
      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(BRAND)
            .setTitle(g.title)
            .setDescription(g.desc)
            .setFooter({ text: 'Ghost Empire' }),
        ],
        components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)],
      });
      posted++;
    }

    log.info('[ged] GOTOWE.', { usunięto: del, dropdowny: posted });
    console.log(
      `\n✅ Ghost Empire: usunięto ${del} starych wiadomości, opublikowano ${posted} rozwijanych menu w #auto-role.\n   ⚠️ Zadziałają po REDEPLOYU bota (nowy handler roleselect).\n`,
    );
  } catch (e) {
    log.error('[ged] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
