// Ghost Empire — partia 4: dostrojenie ekonomii (economy_config). Sklep (economy_shop)
// zostaje do uzupełnienia przez właściciela (/shop / panel) — to decyzja, co sprzedawać.
//   node src/setup/ghost-empire-economy.mts --guild <ID> [--dry-run]

import { Client, Events, GatewayIntentBits } from 'discord.js';
import { loadEnv } from '../env.mts';
import { cloudGetAllSettings, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { guildKey, setGuildSetting } from '../lib/db.mts';
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

const ECO = {
  enabled: true,
  currency: '🪙 GT',
  startBalance: 500,
  dailyAmount: 500,
  dailyStreakBonus: 100,
  workMin: 100,
  workMax: 600,
  workCooldownMin: 60,
  robEnabled: true,
  robChance: 35,
  robCooldownMin: 180,
  robMaxPercent: 25,
  gambleEnabled: true,
  gambleMax: 25000,
  bankInterestPct: 1,
  payTaxPct: 0,
  levelUpMoney: 250,
};

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  let code = 0;
  try {
    const guild = await (await c.guilds.fetch(guildArg)).fetch();
    const all: Record<string, string> = hasCloud()
      ? await cloudGetAllSettings().catch(() => ({}) as Record<string, string>)
      : {};
    let cur: Record<string, unknown> = {};
    try {
      const raw = all[`g:${guild.id}:economy_config`] ?? all.economy_config;
      if (raw) cur = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      /* puste */
    }
    // Dopełnij braki, ale zachowaj świadome ustawienia właściciela (cur ma pierwszeństwo).
    const final = { ...ECO, ...cur, enabled: true };
    const json = JSON.stringify(final);

    if (DRY) {
      console.log('economy_config (final):', json);
      await c.destroy();
      process.exit(0);
    }
    setGuildSetting(guild.id, 'economy_config', json);
    if (hasCloud())
      await cloudSetSetting(guildKey(guild.id, 'economy_config'), json).catch(() => {});
    log.info('[gee] economy_config zapisany.', {
      currency: final.currency,
      daily: final.dailyAmount,
      levelUp: final.levelUpMoney,
    });
    console.log(
      `\n✅ Ghost Empire (partia 4): ekonomia dostrojona (waluta ${final.currency}, daily ${final.dailyAmount}, level-up ${final.levelUpMoney} GT). Sklep dodaj /shop lub w panelu.\n`,
    );
  } catch (e) {
    log.error('[gee] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
