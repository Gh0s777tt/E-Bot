// E-Forge — audyt (read-only): drzewo kanałów + status bramki @everyone (HIDDEN/SHOWN/OPEN).
// OPEN = brak nakładki @everyone → kanał widoczny dla wszystkich (np. nowy kanał z włączenia Community).
//   node src/setup/empire-audit.mts --guild <ID>

import {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  type GuildBasedChannel,
  PermissionFlagsBits as P,
} from 'discord.js';
import { loadEnv } from '../env.mts';
import { log } from '../lib/log.mts';

loadEnv();
const guildArg = process.argv[process.argv.indexOf('--guild') + 1];
const token = process.env.DISCORD_BOT_TOKEN;
if (!token || !guildArg) {
  log.error('Użycie: node src/setup/empire-audit.mts --guild <ID> (i DISCORD_BOT_TOKEN w .env)');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  const guild = await (await c.guilds.fetch(guildArg)).fetch();
  await guild.channels.fetch();
  const everyone = guild.roles.everyone.id;

  function gate(ch: GuildBasedChannel): string {
    if (!('permissionOverwrites' in ch)) return '—';
    const ow = ch.permissionOverwrites.cache.get(everyone);
    if (!ow) return 'OPEN ⚠️';
    if (ow.deny.has(P.ViewChannel)) return 'HIDDEN 🔒';
    if (ow.allow.has(P.ViewChannel)) return 'SHOWN 👁️';
    return 'OPEN ⚠️';
  }
  const all = [...guild.channels.cache.values()];
  type Positioned = Extract<GuildBasedChannel, { position: number }>; // bez wątków (te nie mają position)
  const cats = all
    .filter((c): c is Positioned => c.type === ChannelType.GuildCategory)
    .sort((a, b) => a.position - b.position);
  const childrenOf = (pid: string | null) =>
    all
      .filter(
        (c): c is Positioned =>
          c.type !== ChannelType.GuildCategory && !c.isThread() && c.parentId === pid,
      )
      .sort((a, b) => a.position - b.position);

  const orphans = childrenOf(null);
  if (orphans.length) {
    console.log('\n=== BEZ KATEGORII ===');
    for (const ch of orphans) console.log(`  [${gate(ch)}] ${ch.name}  (${ChannelType[ch.type]})`);
  }
  for (const cat of cats) {
    console.log(`\n[${gate(cat)}] 📁 ${cat.name}`);
    for (const ch of childrenOf(cat.id)) console.log(`     [${gate(ch)}] ${ch.name}`);
  }
  console.log(`\nRAZEM kanałów: ${all.length} (kategorii: ${cats.length})`);
  console.log(`Community: ${guild.features.includes('COMMUNITY') ? 'TAK' : 'nie'}`);
  await c.destroy();
  process.exit(0);
});
void client.login(token);
