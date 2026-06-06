import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
  type ChatInputCommandInteraction,
} from 'discord.js';
import {
  getConfig,
  saveConfig,
  missingPerms,
  PROT_LABELS,
  PUNISHMENT_LABELS,
  type ProtKey,
  type Punishment,
} from '../security/antinuke.mts';

const PROT_KEYS = Object.keys(PROT_LABELS) as ProtKey[];

export const data = new SlashCommandBuilder()
  .setName('antinuke')
  .setDescription('Ochrona serwera przed nukowaniem.')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((s) => s.setName('status').setDescription('Pokaż aktualną konfigurację.'))
  .addSubcommand((s) =>
    s.setName('toggle').setDescription('Włącz/wyłącz cały system.').addBooleanOption((o) => o.setName('enabled').setDescription('Włączony?').setRequired(true)),
  )
  .addSubcommand((s) =>
    s.setName('setlog').setDescription('Kanał logów incydentów.').addChannelOption((o) => o.setName('channel').setDescription('Kanał').setRequired(true)),
  )
  .addSubcommand((s) =>
    s
      .setName('punishment')
      .setDescription('Kara dla sprawcy.')
      .addStringOption((o) =>
        o
          .setName('type')
          .setDescription('Rodzaj kary')
          .setRequired(true)
          .addChoices(...(Object.entries(PUNISHMENT_LABELS).map(([value, name]) => ({ name, value })))),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('protection')
      .setDescription('Konfiguruj pojedynczą ochronę.')
      .addStringOption((o) =>
        o
          .setName('name')
          .setDescription('Ochrona')
          .setRequired(true)
          .addChoices(...PROT_KEYS.map((k) => ({ name: PROT_LABELS[k], value: k }))),
      )
      .addBooleanOption((o) => o.setName('enabled').setDescription('Włączona?').setRequired(true))
      .addIntegerOption((o) => o.setName('count').setDescription('Liczba akcji progu').setMinValue(1).setMaxValue(50))
      .addIntegerOption((o) => o.setName('window').setDescription('Okno czasu (s)').setMinValue(1).setMaxValue(300)),
  )
  .addSubcommand((s) =>
    s
      .setName('whitelist')
      .setDescription('Dodaj/usuń zaufanego użytkownika lub rolę.')
      .addStringOption((o) =>
        o.setName('action').setDescription('Akcja').setRequired(true).addChoices({ name: 'Dodaj', value: 'add' }, { name: 'Usuń', value: 'remove' }),
      )
      .addMentionableOption((o) => o.setName('target').setDescription('Użytkownik lub rola').setRequired(true)),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.inGuild()) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  const sub = interaction.options.getSubcommand();
  const cfg = getConfig();

  if (sub === 'status') {
    const lines = PROT_KEYS.map((k) => {
      const p = cfg.protections[k];
      return `${p.enabled ? '🟢' : '⚪'} **${PROT_LABELS[k]}** — ${p.count}/${p.windowSec}s`;
    }).join('\n');
    const miss = interaction.guild ? missingPerms(interaction.guild) : [];
    const embed = new EmbedBuilder()
      .setColor(cfg.enabled ? 0x2ecc71 : 0xe50914)
      .setTitle('🛡️ Anti-Nuke — status')
      .setDescription(
        `System: **${cfg.enabled ? 'WŁĄCZONY' : 'wyłączony'}**\n` +
          `Kara: **${PUNISHMENT_LABELS[cfg.punishment]}**\n` +
          `Logi: ${cfg.logChannelId ? `<#${cfg.logChannelId}>` : '— (ustaw /antinuke setlog)'}\n\n${lines}`,
      )
      .setFooter({
        text:
          `Whitelist: ${cfg.whitelistUsers.length} użytk., ${cfg.whitelistRoles.length} ról` +
          (miss.length ? ` · ⚠️ brak uprawnień: ${miss.join(', ')}` : ''),
      });
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    return;
  }

  if (sub === 'toggle') {
    cfg.enabled = interaction.options.getBoolean('enabled', true);
    saveConfig(cfg);
    await interaction.reply({ content: `Anti-Nuke **${cfg.enabled ? 'włączony' : 'wyłączony'}**.`, flags: MessageFlags.Ephemeral });
    return;
  }

  if (sub === 'setlog') {
    const ch = interaction.options.getChannel('channel', true);
    cfg.logChannelId = ch.id;
    saveConfig(cfg);
    await interaction.reply({ content: `Kanał logów: <#${ch.id}>.`, flags: MessageFlags.Ephemeral });
    return;
  }

  if (sub === 'punishment') {
    cfg.punishment = interaction.options.getString('type', true) as Punishment;
    saveConfig(cfg);
    await interaction.reply({ content: `Kara ustawiona: **${PUNISHMENT_LABELS[cfg.punishment]}**.`, flags: MessageFlags.Ephemeral });
    return;
  }

  if (sub === 'protection') {
    const name = interaction.options.getString('name', true) as ProtKey;
    const p = cfg.protections[name];
    p.enabled = interaction.options.getBoolean('enabled', true);
    const count = interaction.options.getInteger('count');
    const win = interaction.options.getInteger('window');
    if (count) p.count = count;
    if (win) p.windowSec = win;
    saveConfig(cfg);
    await interaction.reply({
      content: `**${PROT_LABELS[name]}**: ${p.enabled ? '🟢 wł.' : '⚪ wył.'} (${p.count}/${p.windowSec}s).`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (sub === 'whitelist') {
    const action = interaction.options.getString('action', true);
    const target = interaction.options.getMentionable('target', true) as { id: string };
    // Rola ma .permissions, użytkownik/member nie w tej samej formie — rozróżniamy po obecności pola 'managed' (rola) lub 'user'
    const isRole = 'permissions' in (target as object) && !('user' in (target as object));
    const list = isRole ? cfg.whitelistRoles : cfg.whitelistUsers;
    const idx = list.indexOf(target.id);
    if (action === 'add') {
      if (idx === -1) list.push(target.id);
    } else if (idx !== -1) {
      list.splice(idx, 1);
    }
    saveConfig(cfg);
    await interaction.reply({
      content: `Whitelist (${isRole ? 'rola' : 'użytkownik'}) ${action === 'add' ? 'dodano' : 'usunięto'}: <${isRole ? '@&' : '@'}${target.id}>.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
}
