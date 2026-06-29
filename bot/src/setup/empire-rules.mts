// ════════════════════════════════════════════════════════════════════════════
//  E-Forge — promocja wymaganego kanału „rules" Discorda na jedyny kanał zasad
// ════════════════════════════════════════════════════════════════════════════
//  Discord (Community) trzyma własny kanał `rules` jako wymagany i nie pozwala
//  przepiąć zasad na #regulamin (bo ten jest za bramką). Zamiast walczyć — robimy
//  z TEGO kanału ładny, publiczny kanał zasad i usuwamy zdublowany #regulamin.
//   • usuwa istniejący „📜 regulamin・rules" (mój, za bramką),
//   • zmienia nazwę auto-`rules` → „📜 regulamin・rules", przenosi do 🏛️ E-Forge (góra),
//   • ustawia publiczny + tylko-do-odczytu, wkleja dwujęzyczny regulamin.
//
//    node src/setup/empire-rules.mts --guild <ID> [--dry-run]
// ════════════════════════════════════════════════════════════════════════════

import {
  ChannelType,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  type Guild,
  OverwriteType,
  PermissionFlagsBits as P,
  type TextChannel,
} from 'discord.js';
import { loadEnv } from '../env.mts';
import { log } from '../lib/log.mts';

loadEnv();
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const guildArg = argv[argv.indexOf('--guild') + 1];
const token = process.env.DISCORD_BOT_TOKEN;
if (!token || !guildArg) {
  log.error('Użycie: node src/setup/empire-rules.mts --guild <ID>');
  process.exit(1);
}

const MARK = 'E-Forge • auto-setup';
const RULES_NAME = '📜 regulamin・rules';
const INFO_CAT = '🏛️ E-Forge';
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

function rulesEmbed(): EmbedBuilder {
  const pl = [
    'Witaj na wspólnym serwerze ekosystemu **E-Forge**. Przebywając tu, akceptujesz zasady:',
    '**1.** Szanuj innych — zero hejtu i dyskryminacji.',
    '**2.** Bez spamu, floodu i nadmiernego pingowania.',
    '**3.** Zakaz treści NSFW, nielegalnych i szkodliwych.',
    '**4.** Zakaz reklam bez zgody administracji.',
    '**5.** Trzymaj tematykę kanałów (dyskusję o projekcie w jego kategorii).',
    '**6.** Pomoc: opisuj problem konkretnie (produkt, wersja, kroki, log).',
    '**7.** Słuchaj administracji i moderacji. Obowiązuje [ToS Discord](https://discord.com/terms) i wiek 13+.',
    '',
    '➡️ Aby uzyskać dostęp do serwera, przejdź weryfikację w **#weryfikacja**.',
  ].join('\n');
  const en = [
    'Welcome to the shared **E-Forge** ecosystem server. By staying here you accept the rules:',
    '**1.** Respect others — no hate or discrimination.',
    '**2.** No spam, flooding or excessive pinging.',
    '**3.** No NSFW, illegal or harmful content.',
    '**4.** No advertising without staff permission.',
    '**5.** Keep channels on-topic (discuss a project in its category).',
    '**6.** Support: describe issues precisely (product, version, steps, log).',
    '**7.** Follow staff. [Discord ToS](https://discord.com/terms) and 13+ apply.',
    '',
    '➡️ To access the server, verify in **#weryfikacja**.',
  ].join('\n');
  return new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle('📜 Regulamin · Rules')
    .setDescription(`${pl}\n\n━━━━━━━━━━━━━━━\n🇬🇧 **English**\n${en}`)
    .setFooter({ text: MARK });
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  log.info(`[rules] Zalogowano jako ${c.user.tag}.`);
  let code = 0;
  try {
    const guild: Guild = await (await c.guilds.fetch(guildArg)).fetch();
    await guild.channels.fetch();

    const infoCat = guild.channels.cache.find(
      (x) => x.type === ChannelType.GuildCategory && norm(x.name) === norm(INFO_CAT),
    );
    // mój gated regulamin (w kategorii) vs auto-rules (orphan, = rulesChannelId)
    const mine = guild.channels.cache.find(
      (x): x is TextChannel =>
        x.type === ChannelType.GuildText && norm(x.name) === norm(RULES_NAME) && !!x.parentId,
    );
    const auto = guild.channels.cache.find(
      (x): x is TextChannel =>
        x.type === ChannelType.GuildText && x.name.toLowerCase() === 'rules' && !x.parentId,
    );

    log.info('[rules] Plan', {
      autoRules: auto ? `${auto.name} (${auto.id})` : 'BRAK',
      rulesChannelId: guild.rulesChannelId,
      usuwam_moj_regulamin: mine ? mine.id : 'brak',
      kategoria_info: infoCat ? infoCat.id : 'BRAK',
    });
    if (!auto) {
      log.error('[rules] Nie znaleziono auto-kanału `rules` — nic do zrobienia.');
      await c.destroy();
      process.exit(1);
    }
    if (DRY) {
      log.info('[rules] PODGLĄD (--dry-run) — bez zmian.');
      await c.destroy();
      process.exit(0);
    }

    // 1) usuń mój zdublowany #regulamin (za bramką)
    if (mine) {
      await mine
        .delete('E-Forge: scalenie z wymaganym kanałem zasad Community')
        .catch((e) =>
          log.warn('[rules] nie usunięto mojego #regulamin', { err: (e as Error).message }),
        );
    }

    // 2) nazwa + przeniesienie do kategorii info (na górę)
    await auto.setName(RULES_NAME).catch(() => {});
    if (infoCat) {
      await auto.setParent(infoCat.id, { lockPermissions: false, reason: 'E-Forge: kanał zasad' });
      await auto.setPosition(0).catch(() => {});
    }

    // 3) publiczny + tylko-do-odczytu (widoczny przed weryfikacją, jak wymaga Community)
    await auto.permissionOverwrites.set(
      [
        {
          id: c.user.id,
          type: OverwriteType.Member,
          allow: [P.ViewChannel, P.SendMessages, P.ManageMessages],
        },
        {
          id: guild.roles.everyone.id,
          type: OverwriteType.Role,
          allow: [P.ViewChannel],
          deny: [
            P.SendMessages,
            P.SendMessagesInThreads,
            P.CreatePublicThreads,
            P.CreatePrivateThreads,
          ],
        },
      ],
      'E-Forge: publiczny kanał zasad (read-only)',
    );

    // 4) wklej regulamin (idempotentnie — tylko gdy brak)
    const recent = await auto.messages.fetch({ limit: 15 }).catch(() => null);
    const has = recent?.some(
      (m) => m.author.id === c.user.id && m.embeds.some((e) => e.footer?.text?.includes(MARK)),
    );
    if (!has) await auto.send({ embeds: [rulesEmbed()] }).catch(() => {});

    const fresh = await guild.fetch();
    log.info('[rules] GOTOWE.', {
      kanał_zasad: auto.id,
      rulesChannelId_po: fresh.rulesChannelId,
      ten_sam: fresh.rulesChannelId === auto.id,
    });
    console.log(
      `\n✅ Kanał zasad scalony: „${RULES_NAME}" (publiczny, read-only) jest teraz jedynym kanałem zasad Community.\n`,
    );
  } catch (e) {
    log.error('[rules] Krytyczny błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
