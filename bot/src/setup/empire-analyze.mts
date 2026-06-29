// E-Forge — analiza serwera (read-only): meta, role, uprawnienia bota, istniejące
// configi modułów (z Supabase) + status połączenia ekonomii z platformą.
//   node src/setup/empire-analyze.mts --guild <ID>

import { Client, Events, GatewayIntentBits, PermissionFlagsBits as P } from 'discord.js';
import { loadEnv } from '../env.mts';
import { cloudGetAllSettings, hasCloud } from '../lib/cloud.mts';
import { log } from '../lib/log.mts';

loadEnv();
const guildArg = process.argv[process.argv.indexOf('--guild') + 1];
const token = process.env.DISCORD_BOT_TOKEN;
if (!token || !guildArg) {
  log.error('Użycie: node src/setup/empire-analyze.mts --guild <ID>');
  process.exit(1);
}

const FEATURE_CONFIGS = [
  'economy_config',
  'leveling_config',
  'welcome_config',
  'verification_config',
  'tickets_config',
  'automod_config',
  'antinuke',
  'antiraid_config',
  'logging_config',
  'starboard_config',
  'tempvoice_config',
  'suggestions_config',
  'rolemenu_config',
  'aihelp_config',
  'counters_config',
  'reaction_roles',
  'birthday_config',
  'applications_config',
];

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
client.once(Events.ClientReady, async (c) => {
  let code = 0;
  try {
    const guild = await (await c.guilds.fetch(guildArg)).fetch();
    await guild.roles.fetch();
    await guild.channels.fetch();
    let memberFetch = true;
    await guild.members.fetch().catch(() => {
      memberFetch = false;
    });
    const me = await guild.members.fetchMe();

    console.log('\n══════════ SERWER ══════════');
    console.log(`Nazwa:        ${guild.name}`);
    console.log(`ID:           ${guild.id}`);
    console.log(`Członków:     ${guild.memberCount}`);
    console.log(`Właściciel:   ${guild.ownerId}`);
    console.log(`Community:    ${guild.features.includes('COMMUNITY') ? 'TAK' : 'nie'}`);
    console.log(
      `Boost level:  ${guild.premiumTier} (${guild.premiumSubscriptionCount ?? 0} boostów)`,
    );
    console.log(`Kanałów:      ${guild.channels.cache.size}  ·  Ról: ${guild.roles.cache.size}`);

    console.log('\n══════════ BOT (E-Bot) ══════════');
    console.log(`Administrator: ${me.permissions.has(P.Administrator) ? 'TAK ✅' : 'NIE ⚠️'}`);
    console.log(
      `Najwyższa rola bota: ${me.roles.highest.name} (poz. ${me.roles.highest.position})`,
    );
    const need: [bigint, string][] = [
      [P.ManageChannels, 'Zarządzanie kanałami'],
      [P.ManageRoles, 'Zarządzanie rolami'],
      [P.ManageGuild, 'Zarządzanie serwerem'],
      [P.BanMembers, 'Banowanie'],
      [P.ModerateMembers, 'Timeout'],
    ];
    const missing = need.filter(([p]) => !me.permissions.has(p)).map(([, n]) => n);
    if (missing.length) console.log(`Brakuje: ${missing.join(', ')}`);

    console.log('\n══════════ ROLE (od góry) ══════════');
    const roles = [...guild.roles.cache.values()]
      .filter((r) => r.name !== '@everyone')
      .sort((a, b) => b.position - a.position);
    for (const r of roles) {
      const cnt = memberFetch ? `${r.members.size} os.` : '—';
      console.log(
        `  ${r.managed ? '[bot/integ] ' : ''}${r.name}  ·  ${cnt}${r.hoist ? '  ·  wyróżniona' : ''}`,
      );
    }

    console.log('\n══════════ KONFIGURACJA BOTA (Supabase) ══════════');
    if (!hasCloud()) {
      console.log('Brak Supabase w .env — nie mogę odczytać configów.');
    } else {
      const all = await cloudGetAllSettings().catch(() => ({}) as Record<string, string>);
      const prefix = `g:${guild.id}:`;
      for (const key of FEATURE_CONFIGS) {
        const raw = all[`${prefix}${key}`] ?? all[key];
        let state = '— (nie ustawiony)';
        if (raw) {
          try {
            const o = JSON.parse(raw) as Record<string, unknown>;
            state = `enabled=${o.enabled ?? o.on ?? '?'}`;
          } catch {
            state = 'ustawiony';
          }
        }
        console.log(`  ${key.padEnd(22)} ${state}`);
      }
      // globalne istotne
      console.log('\n  — globalne —');
      for (const key of ['ai_config', 'live_config', 'notify_channel_id']) {
        const raw = all[key];
        console.log(`  ${key.padEnd(22)} ${raw ? raw.slice(0, 50) : '— (brak)'}`);
      }
    }

    console.log('\n══════════ EKONOMIA / PLATFORMA (env) ══════════');
    const ghostOn =
      (process.env.GHOST_ECONOMY === '1' || process.env.GHOST_ECONOMY === 'true') &&
      !!process.env.GHOST_BOT_SECRET;
    console.log(`GHOST_ECONOMY:    ${process.env.GHOST_ECONOMY ?? '(brak)'}`);
    console.log(`GHOST_BOT_SECRET: ${process.env.GHOST_BOT_SECRET ? 'SET ✅' : '(brak)'}`);
    console.log(`GHOST_API_URL:    ${process.env.GHOST_API_URL ?? '(brak)'}`);
    console.log(
      `→ Ekonomia GT połączona z platformą: ${ghostOn ? 'TAK ✅' : 'NIE ⚠️ (wymaga env + restart)'}`,
    );
    console.log('');
  } catch (e) {
    log.error('[analyze] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
