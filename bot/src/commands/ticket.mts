// /ticket — system zgłoszeń (Faza 4). Config z panelu (settings 'tickets_config', synchronizowane),
// dane do Supabase 'tickets'. Panel pokazuje listę zgłoszeń.
import {
  ChannelType,
  type ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { cloudInsert, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { closeTicket } from '../tickets/service.mts';

type TicketsConfig = {
  enabled: boolean;
  supportRoleId: string;
  welcome: string;
};

function readConfig(guildId: string): TicketsConfig {
  const raw = getGuildSettings(guildId)['tickets_config'];
  const def: TicketsConfig = {
    enabled: false,
    supportRoleId: '',
    welcome: 'Dzięki za zgłoszenie! Obsługa odezwie się wkrótce.',
  };
  if (!raw) return def;
  try {
    return { ...def, ...(JSON.parse(raw) as Partial<TicketsConfig>) };
  } catch {
    return def;
  }
}

export const data = new SlashCommandBuilder()
  .setName('ticket')
  .setDescription('System zgłoszeń (tickety).')
  .addSubcommand((s) =>
    s
      .setName('otworz')
      .setDescription('Otwórz nowy ticket.')
      .addStringOption((o) =>
        o
          .setName('temat')
          .setDescription('Czego dotyczy zgłoszenie?')
          .setRequired(true)
          .setMaxLength(200),
      ),
  )
  .addSubcommand((s) =>
    s.setName('zamknij').setDescription('Zamknij ten ticket (użyj w wątku ticketu).'),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const sub = interaction.options.getSubcommand();
  const cfg = readConfig(interaction.guildId ?? '');

  if (sub === 'otworz') {
    if (!cfg.enabled) {
      await interaction.reply({
        content: '🎟️ Tickety są wyłączone — włącz je w panelu.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const channel = interaction.channel;
    // Prywatny wątek powstaje TYLKO na zwykłym kanale tekstowym (GuildText). To zawężenie
    // naprawia też typ: `'threads' in channel` obejmowało forum/media, gdzie threads.create()
    // nie przyjmuje type/invitable → TS kolapsował te pola do `undefined` (TS2322).
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: 'Tu nie można otworzyć ticketu — użyj na zwykłym kanale tekstowym.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const temat = interaction.options.getString('temat', true);
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const thread = await channel.threads.create({
        name: `ticket-${interaction.user.username}`.slice(0, 90),
        type: ChannelType.PrivateThread,
        invitable: false,
      });
      await thread.members.add(interaction.user.id).catch(() => {});
      const ping = cfg.supportRoleId ? `<@&${cfg.supportRoleId}> ` : '';
      await thread
        .send(`${ping}${cfg.welcome}\n\n**Temat:** ${temat}\n— <@${interaction.user.id}>`)
        .catch(() => {});

      if (hasCloud()) {
        await cloudInsert('tickets', [
          {
            guild_id: interaction.guildId,
            channel_id: thread.id,
            user_id: interaction.user.id,
            username: interaction.user.username,
            subject: temat,
            status: 'open',
          },
        ]).catch((e) => console.warn('[ticket]', (e as Error).message));
      }

      await interaction.editReply(`✅ Otwarto ticket: <#${thread.id}>`);
    } catch (e) {
      await interaction.editReply(
        `❌ Nie udało się otworzyć ticketu (czy bot ma uprawnienia do prywatnych wątków?). ${(e as Error).message}`,
      );
    }
    return;
  }

  // zamknij
  const channel = interaction.channel;
  if (!channel?.isThread()) {
    await interaction.reply({
      content: 'Użyj tej komendy w wątku ticketu.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await interaction.reply('🔒 Zamykam ticket (transkrypt w drodze)…');
  await closeTicket(channel);
}
