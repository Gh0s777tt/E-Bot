// /pricealert — osobiste alerty cenowe gier (DM, gdy cena spadnie do Twojego progu). Bez nowej tabeli:
// targety w ustawieniu serwera 'g:<id>:price_targets' (mapa userId → [{title, target}]). Poller
// pricetracker wysyła DM przy spadku (integracja w osobnym kroku). Czyste operacje na mapie w pricetracker.mts.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { addTarget, removeTarget, type TargetMap, targetsKey } from '../gaming/pricetracker.mts';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';

export const data = new SlashCommandBuilder()
  .setName('pricealert')
  .setDescription('Osobiste alerty cenowe gier (DM, gdy cena spadnie do Twojego progu).')
  .addSubcommand((s) =>
    s
      .setName('add')
      .setDescription('Dodaj alert na grę')
      .addStringOption((o) =>
        o.setName('gra').setDescription('Tytuł gry').setRequired(true).setMaxLength(200),
      )
      .addNumberOption((o) =>
        o
          .setName('cena')
          .setDescription('Próg ceny w zł (np. 49.99)')
          .setRequired(true)
          .setMinValue(0)
          .setMaxValue(100000),
      ),
  )
  .addSubcommand((s) => s.setName('list').setDescription('Pokaż swoje alerty cenowe'))
  .addSubcommand((s) =>
    s
      .setName('remove')
      .setDescription('Usuń alert na grę')
      .addStringOption((o) =>
        o.setName('gra').setDescription('Tytuł gry').setRequired(true).setMaxLength(200),
      ),
  );

async function loadMap(guildId: string): Promise<TargetMap> {
  try {
    return JSON.parse((await cloudGetSetting(targetsKey(guildId))) || '{}') as TargetMap;
  } catch {
    return {};
  }
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (!hasCloud()) {
    await interaction.reply({
      content: '❌ Alerty cenowe wymagają chmury (Supabase).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const sub = interaction.options.getSubcommand();
  const uid = interaction.user.id;
  const gid = interaction.guildId;

  if (sub === 'list') {
    const list = (await loadMap(gid))[uid] ?? [];
    if (!list.length) {
      await interaction.reply({
        content: '🔔 Nie masz alertów cenowych. Dodaj: `/pricealert add`.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const embed = new EmbedBuilder()
      .setColor(0xe50914)
      .setTitle('🔔 Twoje alerty cenowe')
      .setDescription(
        list
          .map((t) => `• **${t.title}** — ≤ ${t.target.toFixed(2)} zł`)
          .join('\n')
          .slice(0, 4000),
      );
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    return;
  }

  const title = interaction.options.getString('gra', true).trim();

  if (sub === 'add') {
    const target = interaction.options.getNumber('cena', true);
    const map = addTarget(await loadMap(gid), uid, title, target);
    await cloudSetSetting(targetsKey(gid), JSON.stringify(map)).catch(() => {});
    await interaction.reply({
      content: `🔔 Alert ustawiony: **${title}** ≤ ${target.toFixed(2)} zł — dostaniesz DM, gdy cena spadnie.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // remove
  const map = removeTarget(await loadMap(gid), uid, title);
  await cloudSetSetting(targetsKey(gid), JSON.stringify(map)).catch(() => {});
  await interaction.reply({
    content: `🗑️ Usunięto alert: **${title}**`,
    flags: MessageFlags.Ephemeral,
  });
}
