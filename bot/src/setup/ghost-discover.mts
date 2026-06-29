// Ghost Empire — discovery (read-only): role (id+pozycja), kanały-cele wpięć,
// kategorie gier + sprawdzenie, czy mają nakładki dla ról (czy menu ról wystarczy).
//   node src/setup/ghost-discover.mts --guild <ID>

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

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  try {
    const guild = await (await c.guilds.fetch(guildArg)).fetch();
    await guild.roles.fetch();
    await guild.channels.fetch();

    console.log('\n===== ROLE (pos | id | nazwa) =====');
    const roles = [...guild.roles.cache.values()]
      .filter((r) => r.name !== '@everyone')
      .sort((a, b) => b.position - a.position);
    for (const r of roles) console.log(`${r.position}\t${r.id}\t${r.name}`);

    const cats = [...guild.channels.cache.values()]
      .filter((c) => c.type === ChannelType.GuildCategory)
      .sort((a, b) => a.position - b.position);
    const childrenOf = (pid: string | null) =>
      [...guild.channels.cache.values()]
        .filter((c) => c.type !== ChannelType.GuildCategory && !c.isThread() && c.parentId === pid)
        .sort((a, b) => ('position' in a && 'position' in b ? a.position - b.position : 0));

    // Kanały-cele wpięć: kategorie NIE-growe + sieroty. Growe tylko wypiszę jako nazwa+id.
    const isGameCat = (name: string) =>
      /━━━/.test(name) &&
      !/ɪɴꜰᴏʀᴍᴀᴄᴊᴇ|ꜱᴘᴏᴌᴇᴄᴢ|ꜱᴛʀᴇᴀᴍ|ꜱᴜʙ ᴄʟᴜʙ|ᴇᴠᴇɴᴛ|ᴘᴏᴍᴏᴄ|ᴀᴅᴍɪɴɪꜱᴛʀᴀᴄᴊᴀ/.test(name);

    console.log('\n===== KANAŁY (cele wpięć) =====');
    const orphans = childrenOf(null);
    if (orphans.length) {
      console.log('[BEZ KATEGORII]');
      for (const ch of orphans) console.log(`  ${ch.id}\t${ChannelType[ch.type]}\t${ch.name}`);
    }
    const gameCats: string[] = [];
    for (const cat of cats) {
      if (isGameCat(cat.name)) {
        gameCats.push(`${cat.id}\t${cat.name}`);
        continue;
      }
      console.log(`\n[${cat.id}] ${cat.name}`);
      for (const ch of childrenOf(cat.id))
        console.log(`  ${ch.id}\t${ChannelType[ch.type]}\t${ch.name}`);
    }

    console.log(`\n===== KATEGORIE GIER (${gameCats.length}) =====`);
    for (const g of gameCats) console.log(`  ${g}`);

    // Czy kategorie gier mają nakładkę roli (allow ViewChannel dla jakiejś roli != @everyone)?
    const sampleGameCat = cats.find((c) => isGameCat(c.name));
    if (sampleGameCat && 'permissionOverwrites' in sampleGameCat) {
      console.log(`\n===== PRÓBKA nakładek kategorii gry „${sampleGameCat.name}" =====`);
      for (const o of sampleGameCat.permissionOverwrites.cache.values()) {
        const role = guild.roles.cache.get(o.id);
        const tag = role ? `rola:${role.name}` : `id:${o.id}`;
        console.log(
          `  ${tag}  allowView=${o.allow.has(P.ViewChannel)} denyView=${o.deny.has(P.ViewChannel)}`,
        );
      }
    }
  } catch (e) {
    log.error('[discover] błąd', { err: (e as Error).message });
  } finally {
    await c.destroy();
    process.exit(0);
  }
});
void client.login(token);
