// ════════════════════════════════════════════════════════════════════════════
//  E-Forge (hub) — włączenie graficznej KARTY POWITALNEJ (canvas banner)
// ════════════════════════════════════════════════════════════════════════════
//  Scala z istniejącym welcome_config (nie kasuje message/autorole). Ustawia
//  cardEnabled:true + gradient marki. Bot (już wdrożony) renderuje baner na wejściu.
//    node src/setup/eforge-welcome.mts --guild <ID> [--dry-run]
// ════════════════════════════════════════════════════════════════════════════

import { Client, Events, GatewayIntentBits, type Guild } from 'discord.js';
import { loadEnv } from '../env.mts';
import { cloudGetAllSettings, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { guildKey, setGuildSetting } from '../lib/db.mts';
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

const POWITANIA = '1521070180870918266';
const DEFAULT_MSG =
  '🎉 Witaj {user} na **E-Forge**! Zweryfikuj się w #regulamin i wybierz produkty w #wybierz-role. · Welcome {user} to **E-Forge**!';
const CARD = { from: '#E50914', to: '#0A0A0A', angle: 135, font: 'Poppins', textColor: '#FFFFFF' };

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  let code = 0;
  try {
    const guild: Guild = await (await c.guilds.fetch(guildArg)).fetch();
    const all: Record<string, string> = hasCloud()
      ? await cloudGetAllSettings().catch(() => ({}) as Record<string, string>)
      : {};

    let cur: Record<string, unknown> = {};
    try {
      const raw = all[`g:${guild.id}:welcome_config`] ?? all.welcome_config;
      if (raw) cur = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      /* puste */
    }

    const merged = {
      ...cur,
      enabled: true,
      channelId: (cur.channelId as string) || POWITANIA,
      message: (cur.message as string) || DEFAULT_MSG,
      autoroleId: (cur.autoroleId as string) ?? '',
      cardEnabled: true,
      card: { ...(cur.card as object), ...CARD },
    };
    const cfg = JSON.stringify(merged);

    if (DRY) {
      console.log('welcome_config →', cfg);
      await c.destroy();
      process.exit(0);
    }

    setGuildSetting(guild.id, 'welcome_config', cfg);
    if (hasCloud()) await cloudSetSetting(guildKey(guild.id, 'welcome_config'), cfg).catch(() => {});

    log.info('[efw] GOTOWE.', { kanał: merged.channelId, karta: true });
    console.log(
      `\n✅ E-Forge hub: karta powitalna WŁĄCZONA (gradient marki) → #powitania.\n` +
        `   Bot renderuje graficzny baner przy każdym wejściu (kod już wdrożony, działa od następnego membera).\n`,
    );
  } catch (e) {
    log.error('[efw] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
