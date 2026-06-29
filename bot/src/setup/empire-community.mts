// ════════════════════════════════════════════════════════════════════════════
//  E-Forge — sprzątanie po włączeniu Community (kanały zasad / aktualizacji)
// ════════════════════════════════════════════════════════════════════════════
//  Discord przy włączaniu Community dodaje domyślne kanały „rules" i „moderator-only".
//  Ten skrypt:
//   1) ustawia kanał ZASAD → #regulamin・rules, a kanał AKTUALIZACJI społeczności →
//      zostawiony „moderator-only" (przeniesiony do kategorii MODERACJA, perms zsync.),
//   2) usuwa ZBĘDNE duplikaty/puste kanały domyślne (rules + nadmiarowy moderator-only).
//  Re-pointing robimy PRZED usuwaniem (Discord nie pozwala usunąć aktywnego rules/updates).
//
//    node src/setup/empire-community.mts --guild <ID> [--dry-run]
// ════════════════════════════════════════════════════════════════════════════

import {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  type Guild,
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
  log.error('Użycie: node src/setup/empire-community.mts --guild <ID>');
  process.exit(1);
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '-');
const REGULAMIN = '📜 regulamin・rules';
const MOD_CAT = '🛡️ MODERACJA │ MODERATION';

function textByName(g: Guild, name: string): TextChannel | null {
  const t = norm(name);
  const c = g.channels.cache.find((x) => x.type === ChannelType.GuildText && norm(x.name) === t);
  return (c as TextChannel) ?? null;
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  log.info(`[community] Zalogowano jako ${c.user.tag}.`);
  let code = 0;
  try {
    const guild = await (await c.guilds.fetch(guildArg)).fetch();
    await guild.channels.fetch();

    const regulamin = textByName(guild, REGULAMIN);
    const modCat = guild.channels.cache.find(
      (x) => x.type === ChannelType.GuildCategory && norm(x.name) === norm(MOD_CAT),
    );
    if (!regulamin) {
      log.error('[community] Brak #regulamin・rules — uruchom najpierw empire-hub.');
      await c.destroy();
      process.exit(1);
    }

    // Kanały domyślne Discorda (bez kategorii): rules + moderator-only
    const orphanText = [...guild.channels.cache.values()].filter(
      (x): x is TextChannel => x.type === ChannelType.GuildText && !x.parentId,
    );
    const rulesCh = orphanText.filter((x) => x.name.toLowerCase() === 'rules');
    const modCh = orphanText.filter((x) => x.name.toLowerCase() === 'moderator-only');

    // Zostaw kanał aktualizacji: ten wskazany przez Discord (publicUpdatesChannelId) lub pierwszy.
    const keptUpdates =
      modCh.find((x) => x.id === guild.publicUpdatesChannelId) ?? modCh[0] ?? null;

    const toDelete = [...rulesCh, ...modCh.filter((x) => x.id !== keptUpdates?.id)];

    log.info('[community] Plan', {
      regulamin: regulamin.name,
      zasady_na: '#regulamin',
      aktualizacje_na: keptUpdates ? keptUpdates.name : '(brak moderator-only)',
      przenoszę_do_MODERACJI: !!modCat && !!keptUpdates,
      usuwam: toDelete.map((x) => `${x.name} (${x.id})`),
    });

    if (DRY) {
      log.info('[community] PODGLĄD (--dry-run) — bez zmian.');
      await c.destroy();
      process.exit(0);
    }

    // 1) Re-pointing ustawień Community (PRZED usuwaniem)
    await guild.edit({
      rulesChannel: regulamin.id,
      publicUpdatesChannel: keptUpdates?.id ?? guild.publicUpdatesChannelId ?? null,
    });
    log.info('[community] Ustawiono: zasady → #regulamin, aktualizacje → zostawiony kanał.');

    // 2) Zostawiony kanał aktualizacji → kategoria MODERACJA + sync perms + nazwa
    if (keptUpdates && modCat) {
      await keptUpdates.setParent(modCat.id, {
        lockPermissions: true,
        reason: 'E-Forge: porządki Community',
      });
      await keptUpdates.setName('📢 community-updates').catch(() => {});
      log.info('[community] Kanał aktualizacji przeniesiony do MODERACJI (mod-only).');
    }

    // Odśwież stan — przepięcie rulesChannel/updates musi się rozpropagować przed usuwaniem.
    const fresh = await guild.fetch();
    log.info('[community] Po przepięciu', {
      rulesChannelId: fresh.rulesChannelId,
      publicUpdatesChannelId: fresh.publicUpdatesChannelId,
      regulaminId: regulamin.id,
    });

    // 3) Usuń zbędne puste kanały domyślne (pomijając te wciąż wymagane przez Community)
    let del = 0;
    for (const ch of toDelete) {
      if (ch.id === fresh.rulesChannelId || ch.id === fresh.publicUpdatesChannelId) {
        log.warn(
          `[community] „${ch.name}" wciąż wymagany przez Community — pomijam (zmień ręcznie w Ustawienia serwera → Kanały, potem usuń).`,
        );
        continue;
      }
      try {
        await ch.delete('E-Forge: usunięcie zbędnego domyślnego kanału Community');
        del++;
      } catch (e) {
        log.warn(`[community] Nie usunięto „${ch.name}"`, { err: (e as Error).message });
      }
    }

    log.info('[community] GOTOWE.', { usunięto: del });
    console.log(
      `\n✅ Sprzątanie Community: zasady→#regulamin, 1× kanał aktualizacji w MODERACJI, usunięto ${del} zbędnych kanałów.\n`,
    );
  } catch (e) {
    log.error('[community] Krytyczny błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
