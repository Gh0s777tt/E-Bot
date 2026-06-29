// ════════════════════════════════════════════════════════════════════════════
//  Ghost Empire — partia 3: wpięcie modułów + naprawa bramki + panele
// ════════════════════════════════════════════════════════════════════════════
//  • Weryfikacja: roleId=Zweryfikowany, tryb przycisk + panel w #regulamin; rola
//    odsłania kategorie społeczności (SPOŁECZNOŚĆ/STREAM/EVENTY/POMOC).
//  • Tempvoice → ➕ Creator Channel; Tickety → support+kategorie+panel w #tt-pomoc;
//    Starboard → #najlepsze-momenty; AI-pomoc → #komendy-botów; Sugestie → nowy #propozycje.
//  Scala z obecnymi configami. Idempotentne.
//    node src/setup/ghost-empire-wire.mts --guild <ID> [--dry-run]
// ════════════════════════════════════════════════════════════════════════════

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  ComponentType,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  type Guild,
  OverwriteType,
  PermissionFlagsBits as P,
  type TextChannel,
} from 'discord.js';
import { loadEnv } from '../env.mts';
import { cloudGetAllSettings, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { guildKey, setGuildSetting } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { verifyRow } from '../security/verification.mts';

loadEnv();
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const guildArg = argv[argv.indexOf('--guild') + 1];
const token = process.env.DISCORD_BOT_TOKEN;
if (!token || !guildArg) {
  log.error('Użycie: --guild <ID>');
  process.exit(1);
}

const MARK = 'Ghost Empire • setup';
const BRAND = 0x8b1a1a;

const R = {
  verified: '1508615260117139536',
  support: '1508144978965303486',
  mod: '1508144939404366097',
  admin: '1508144899780776096',
};
const CH = {
  regulamin: '1507036286941401251',
  ttPomoc: '1508906936316465312',
  najlepszeMomenty: '1508140405928099981',
  creatorHub: '1508842476335534120',
  tempCat: '1508850132651741355',
  komendyBotow: '1508139747107799070',
  logiSerwera: '1513876844372299977',
  spolecznoscCat: '1508139240049868980',
};
const COMMUNITY_CATS = [
  '1508139240049868980', // SPOŁECZNOŚĆ
  '1508139914452013197', // STREAM
  '1508140704696766724', // EVENTY NAGRODY
  '1508177260501274816', // POMOC
];

function merge(raw: string | undefined, patch: Record<string, unknown>): string {
  let cur: Record<string, unknown> = {};
  try {
    if (raw) cur = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    /* puste */
  }
  return JSON.stringify({ ...cur, ...patch });
}

const KNOWLEDGE = [
  'Ghost Empire to serwer społeczności streamera Gh0s77tt (Twitch/Kick/YouTube/Rumble).',
  'Dostęp: kliknij „Zweryfikuj się" w #regulamin, by odblokować serwer.',
  'Role: w #auto-role wybierz gry (odblokowują kanały gry), zodiak, powiadomienia, płeć/wiek.',
  'Poziomy: zdobywasz XP za czat/voice — awanse dają rangi Ghostling→Gh0st God.',
  'Ekonomia: Ghost Tokeny (GT) za aktywność, połączone z platformą ghost-empire-web.',
  'Pomoc: otwórz ticket w #tt-pomoc. Streamy: powiadomienia w #live-now.',
].join('\n');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  let code = 0;
  try {
    const guild: Guild = await (await c.guilds.fetch(guildArg)).fetch();
    await guild.channels.fetch();
    const all: Record<string, string> = hasCloud()
      ? await cloudGetAllSettings().catch(() => ({}) as Record<string, string>)
      : {};
    const gk = (k: string) => all[`g:${guild.id}:${k}`] ?? all[k];

    // ── Sugestie: znajdź lub utwórz #propozycje w SPOŁECZNOŚCI ──
    let sugCh = guild.channels.cache.find(
      (x) => x.type === ChannelType.GuildText && /propozycje|sugestie/i.test(x.name),
    );
    if (!sugCh && !DRY) {
      sugCh = await guild.channels.create({
        name: '💡・propozycje',
        type: ChannelType.GuildText,
        parent: CH.spolecznoscCat,
        topic: 'Propozycje i pomysły — /suggest. Społeczność głosuje 👍/👎.',
        reason: 'Ghost Empire: kanał sugestii',
      });
    }

    const patches: Record<string, string> = {
      verification_config: merge(gk('verification_config'), {
        enabled: true,
        roleId: R.verified,
        mode: 'button',
        message:
          '🔐 Witaj w **Ghost Empire**! Kliknij poniżej, aby się zweryfikować i odblokować cały serwer.',
        buttonLabel: 'Zweryfikuj się ✅',
        minAccountAgeDays: 0,
      }),
      tempvoice_config: merge(gk('tempvoice_config'), {
        enabled: true,
        hubChannelId: CH.creatorHub,
        categoryId: CH.tempCat,
        nameTemplate: '🔊 {user}',
      }),
      tickets_config: merge(gk('tickets_config'), {
        enabled: true,
        supportRoleId: R.support,
        logChannelId: CH.logiSerwera,
        panelMessage: '🎫 **Pomoc Ghost Empire** — wybierz kategorię, aby otworzyć ticket.',
        ratingEnabled: true,
        slaHours: 48,
        categories: [
          {
            id: 'pomoc',
            label: 'Pomoc',
            emoji: '❓',
            style: 'primary',
            supportRoleId: R.support,
            welcome: 'Opisz swój problem. {user}',
          },
          {
            id: 'wspolpraca',
            label: 'Współpraca',
            emoji: '🤝',
            style: 'success',
            supportRoleId: R.admin,
            welcome: 'Opisz propozycję współpracy. {user}',
          },
          {
            id: 'zglos',
            label: 'Zgłoś gracza',
            emoji: '🚨',
            style: 'danger',
            supportRoleId: R.mod,
            welcome: 'Kogo i za co zgłaszasz? Podaj dowody. {user}',
          },
          {
            id: 'sub',
            label: 'Sub / VIP',
            emoji: '💎',
            style: 'secondary',
            supportRoleId: R.support,
            welcome: 'W czym pomóc? {user}',
          },
        ],
      }),
      starboard_config: merge(gk('starboard_config'), {
        enabled: true,
        channelId: CH.najlepszeMomenty,
        threshold: 4,
        emoji: '⭐',
      }),
      aihelp_config: merge(gk('aihelp_config'), {
        enabled: true,
        channelId: CH.komendyBotow,
        knowledge: KNOWLEDGE,
      }),
      suggestions_config: merge(gk('suggestions_config'), {
        enabled: true,
        channelId: sugCh?.id ?? '',
      }),
    };

    if (DRY) {
      console.log('Configi:', Object.keys(patches).join(', '));
      console.log('Sugestie kanał:', sugCh ? sugCh.name : '(utworzę)');
      console.log('Bramka: dodam Zweryfikowany→view na', COMMUNITY_CATS.length, 'kategoriach');
      console.log('Panele: weryfikacja→#regulamin, tickety→#tt-pomoc');
      await c.destroy();
      process.exit(0);
    }

    let cfg = 0;
    for (const [k, v] of Object.entries(patches)) {
      setGuildSetting(guild.id, k, v);
      if (hasCloud()) await cloudSetSetting(guildKey(guild.id, k), v).catch(() => {});
      cfg++;
    }

    // ── Bramka: rola Zweryfikowany odsłania kategorie społeczności ──
    let gated = 0;
    for (const catId of COMMUNITY_CATS) {
      const cat = guild.channels.cache.get(catId);
      if (cat && 'permissionOverwrites' in cat) {
        await cat.permissionOverwrites
          .edit(
            R.verified,
            { ViewChannel: true },
            { reason: 'Ghost Empire: dostęp dla zweryfikowanych' },
          )
          .then(() => gated++)
          .catch((e) => log.warn(`[gew] gate ${catId}`, { err: (e as Error).message }));
      }
    }

    // ── Panel weryfikacji w #regulamin ──
    const reg = guild.channels.cache.get(CH.regulamin);
    if (reg?.isTextBased()) {
      const recent = await reg.messages.fetch({ limit: 20 }).catch(() => null);
      const has = recent?.some(
        (m) =>
          m.author.id === c.user.id &&
          m.components.some(
            (r) =>
              r.type === ComponentType.ActionRow &&
              r.components.some(
                (x) => x.type === ComponentType.Button && x.customId === 'verify:go',
              ),
          ),
      );
      if (!has) {
        const e = new EmbedBuilder()
          .setColor(BRAND)
          .setTitle('🔐 Weryfikacja')
          .setDescription(JSON.parse(patches.verification_config).message as string)
          .setFooter({ text: MARK });
        await (reg as TextChannel).send({
          embeds: [e],
          components: [verifyRow('Zweryfikuj się ✅')],
        });
      }
    }

    // ── Panel ticketów w #tt-pomoc ──
    const tp = guild.channels.cache.get(CH.ttPomoc);
    if (tp?.isTextBased()) {
      const cats = (JSON.parse(patches.tickets_config).categories ?? []) as {
        id: string;
        label: string;
        emoji: string;
        style: string;
      }[];
      const recent = await tp.messages.fetch({ limit: 20 }).catch(() => null);
      const has = recent?.some(
        (m) =>
          m.author.id === c.user.id &&
          m.components.some(
            (r) =>
              r.type === ComponentType.ActionRow &&
              r.components.some(
                (x) => x.type === ComponentType.Button && x.customId?.startsWith('ticket:new'),
              ),
          ),
      );
      if (!has) {
        const STYLE: Record<string, ButtonStyle> = {
          primary: ButtonStyle.Primary,
          secondary: ButtonStyle.Secondary,
          success: ButtonStyle.Success,
          danger: ButtonStyle.Danger,
        };
        const row = new ActionRowBuilder<ButtonBuilder>();
        for (const cat of cats.slice(0, 5)) {
          const b = new ButtonBuilder()
            .setCustomId(`ticket:new:${cat.id}`)
            .setLabel(cat.label)
            .setStyle(STYLE[cat.style] ?? ButtonStyle.Primary);
          try {
            b.setEmoji(cat.emoji);
          } catch {
            /* skip */
          }
          row.addComponents(b);
        }
        const e = new EmbedBuilder()
          .setColor(BRAND)
          .setTitle('🎫 Pomoc Ghost Empire')
          .setDescription(JSON.parse(patches.tickets_config).panelMessage as string)
          .setFooter({ text: MARK });
        await (tp as TextChannel).send({ embeds: [e], components: [row] });
      }
    }

    log.info('[gew] GOTOWE.', { configi: cfg, bramka_kategorii: gated, sugestie: sugCh?.name });
    console.log(
      `\n✅ Ghost Empire (partia 3): wpięto ${cfg} modułów, bramka na ${gated} kat., panele weryfikacji+ticketów, sugestie=${sugCh?.name ?? '-'}.\n`,
    );
  } catch (e) {
    log.error('[gew] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
