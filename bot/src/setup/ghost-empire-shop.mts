// ════════════════════════════════════════════════════════════════════════════
//  Ghost Empire — partia C: sklep GT (economy_shop)
// ════════════════════════════════════════════════════════════════════════════
//  Bezpieczny zestaw: efekty (lootbox / xp2 / shield) + kosmetyczne role-kolory
//  (tworzone od zera, bez kolizji z rolami sub/VIP). Idempotentne: pomija istniejące
//  itemy (po nazwie) i istniejące role-kolory. node ... --guild <ID> [--dry-run]
// ════════════════════════════════════════════════════════════════════════════

import { Client, Events, GatewayIntentBits, type Guild, PermissionsBitField } from 'discord.js';
import { loadEnv } from '../env.mts';
import { cloudInsert, cloudSelect, hasCloud } from '../lib/cloud.mts';
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

// Role-kolory do utworzenia: [nazwa, kolor, cena]
const COLORS: [string, number, number][] = [
  ['🔴 Krwawa Czerwień', 0xe74c3c, 10000],
  ['🟣 Widmowy Fiolet', 0x9b59b6, 10000],
  ['🔵 Mroźny Błękit', 0x3498db, 10000],
  ['🟢 Toksyczna Zieleń', 0x2ecc71, 10000],
  ['🟡 Złoto Imperium', 0xf1c40f, 12000],
  ['🌸 Upiorny Róż', 0xe91e63, 10000],
];
// Itemy efektowe: [nazwa, opis, cena, effect]
const EFFECTS: [string, string, number, string][] = [
  ['🎟️ Lootbox', 'Otwórz i zgarnij losową nagrodę GT!', 2500, 'lootbox'],
  ['⚡ XP Boost x2', 'Podwójny XP na czas — szybsze awanse.', 5000, 'xp2'],
  ['🛡️ Tarcza', 'Ochrona przed /rob — nikt Cię nie okradnie.', 3000, 'shield'],
];

type ShopRow = {
  guild_id: string;
  name: string;
  description: string;
  price: number;
  role_id: string | null;
  stock: number | null;
  effect: string | null;
};

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  let code = 0;
  try {
    const guild: Guild = await (await c.guilds.fetch(guildArg)).fetch();
    await guild.roles.fetch();
    if (!hasCloud()) {
      log.error('[ges] Brak Supabase — sklep wymaga chmury.');
      await c.destroy();
      process.exit(1);
    }

    // Istniejące itemy (dedup po nazwie)
    const existing = await cloudSelect<{ name: string }>(
      'economy_shop',
      `select=name&guild_id=eq.${guild.id}`,
    );
    const have = new Set(existing.map((r) => r.name.toLowerCase()));

    const rows: ShopRow[] = [];

    // Efekty
    for (const [name, description, price, effect] of EFFECTS) {
      if (have.has(name.toLowerCase())) continue;
      rows.push({
        guild_id: guild.id,
        name,
        description,
        price,
        role_id: null,
        stock: null,
        effect,
      });
    }

    // Role-kolory (find-or-create rola, potem item)
    let rolesCreated = 0;
    for (const [name, color, price] of COLORS) {
      if (have.has(name.toLowerCase())) continue;
      let role = guild.roles.cache.find((r) => r.name === name);
      if (!role && !DRY) {
        role = await guild.roles.create({
          name,
          colors: { primaryColor: color },
          hoist: false,
          mentionable: false,
          permissions: new PermissionsBitField(0n),
          reason: 'Ghost Empire: kosmetyczna rola-kolor (sklep)',
        });
        rolesCreated++;
      }
      rows.push({
        guild_id: guild.id,
        name,
        description: 'Kosmetyczny kolor nicku.',
        price,
        role_id: role?.id ?? null,
        stock: null,
        effect: null,
      });
    }

    if (DRY) {
      console.log(
        'Nowe itemy:',
        rows.map((r) => `${r.name} (${r.price})`).join(', ') || '(brak — wszystko już jest)',
      );
      await c.destroy();
      process.exit(0);
    }

    if (rows.length) await cloudInsert('economy_shop', rows);
    log.info('[ges] GOTOWE.', { itemy: rows.length, role_kolory: rolesCreated });
    console.log(
      `\n✅ Ghost Empire (partia C): dodano ${rows.length} itemów do sklepu (w tym ${rolesCreated} nowych ról-kolorów). Sprawdź /shop.\n`,
    );
  } catch (e) {
    log.error('[ges] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
