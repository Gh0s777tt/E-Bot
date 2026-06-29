// Ghost Empire — discovery 2 (read-only): customowe emoji + nakładki uprawnień
// kluczowych kategorii (Sub Club / Administracja / bramka) + kanał mod-log.
//   node src/setup/ghost-discover2.mts --guild <ID>

import {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  PermissionFlagsBits as P,
} from 'discord.js';
import { loadEnv } from '../env.mts';
import { log } from '../lib/log.mts';

loadEnv();
const guildArg = process.argv[process.argv.indexOf('--guild') + 1];
const token = process.env.DISCORD_BOT_TOKEN;
if (!token || !guildArg) {
  log.error('Użycie: --guild <ID>');
  process.exit(1);
}

const CATS: [string, string][] = [
  ['SUB CLUB', '1508202730060251246'],
  ['ADMINISTRACJA', '1508177081543168040'],
  ['SPOŁECZNOŚĆ', '1508139240049868980'],
  ['STREAM', '1508139914452013197'],
  ['EVENTY', '1508140704696766724'],
  ['POMOC', '1508177260501274816'],
];

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  try {
    const guild = await (await c.guilds.fetch(guildArg)).fetch();
    await guild.roles.fetch();
    await guild.channels.fetch();

    const emojis = await guild.emojis.fetch().catch(() => null);
    console.log(`\n===== CUSTOMOWE EMOJI (${emojis?.size ?? 0}) =====`);
    if (emojis)
      for (const e of emojis.values())
        console.log(
          `  ${e.animated ? 'a' : ''}:${e.name}: → <${e.animated ? 'a' : ''}:${e.name}:${e.id}>`,
        );

    console.log('\n===== NAKŁADKI KATEGORII =====');
    for (const [label, id] of CATS) {
      const cat = guild.channels.cache.get(id);
      if (!cat || !('permissionOverwrites' in cat)) {
        console.log(`\n[${label}] BRAK`);
        continue;
      }
      console.log(`\n[${label}] ${cat.name}`);
      for (const o of cat.permissionOverwrites.cache.values()) {
        const role = guild.roles.cache.get(o.id);
        const who = role
          ? role.name
          : o.id === guild.roles.everyone.id
            ? '@everyone'
            : `id:${o.id}`;
        const v = o.allow.has(P.ViewChannel) ? '+view' : o.deny.has(P.ViewChannel) ? '-view' : '';
        const s = o.allow.has(P.SendMessages) ? '+send' : o.deny.has(P.SendMessages) ? '-send' : '';
        console.log(`   ${who}  ${v} ${s}`.trimEnd());
      }
    }
  } catch (e) {
    log.error('[disc2] błąd', { err: (e as Error).message });
  } finally {
    await c.destroy();
    process.exit(0);
  }
});
void client.login(token);
