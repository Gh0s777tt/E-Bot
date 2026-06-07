// Tor K — aplikacje/rekrutacja (Appy). /applypanel publikuje przycisk → modal z pytaniami →
// embed do kanału recenzji z Akceptuj/Odrzuć → nadanie roli + DM. Config 'applications_config'.
import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  ModalBuilder,
  type ModalSubmitInteraction,
  PermissionFlagsBits,
  type TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { getSettings } from '../lib/db.mts';

type Cfg = {
  on: boolean;
  reviewChannelId: string;
  roleId: string;
  questions: string[];
  panelMessage: string;
};
function cfg(): Cfg {
  const raw = getSettings()['applications_config'];
  try {
    const c = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    return {
      on: !!c.enabled,
      reviewChannelId: String(c.reviewChannelId || ''),
      roleId: String(c.roleId || ''),
      questions: Array.isArray(c.questions)
        ? (c.questions as string[]).filter(Boolean).slice(0, 5)
        : [],
      panelMessage: String(c.panelMessage || '📋 Aplikuj do ekipy — kliknij poniżej.'),
    };
  } catch {
    return { on: false, reviewChannelId: '', roleId: '', questions: [], panelMessage: '' };
  }
}

export function applyEnabled(): boolean {
  const c = cfg();
  return c.on && !!c.reviewChannelId;
}
export function applyPanelMessage(): string {
  return cfg().panelMessage;
}
export function applyPanelRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('app:start')
      .setLabel('Aplikuj')
      .setEmoji('📋')
      .setStyle(ButtonStyle.Primary),
  );
}

const questionsOrDefault = (c: Cfg): string[] =>
  c.questions.length ? c.questions : ['Dlaczego chcesz dołączyć?', 'Co możesz wnieść?'];

export async function handleApplicationButton(interaction: ButtonInteraction): Promise<void> {
  const id = interaction.customId;

  if (id === 'app:start') {
    const c = cfg();
    if (!c.on || !c.reviewChannelId) {
      await interaction.reply({
        content: '📋 Aplikacje są wyłączone.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const modal = new ModalBuilder().setCustomId('app:submit').setTitle('Aplikacja');
    questionsOrDefault(c)
      .slice(0, 5)
      .forEach((q, i) => {
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId(`q${i}`)
              .setLabel(q.slice(0, 45))
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true)
              .setMaxLength(500),
          ),
        );
      });
    await interaction.showModal(modal);
    return;
  }

  if (id.startsWith('app:accept:') || id.startsWith('app:deny:')) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({
        content: '⛔ Tylko obsługa może rozpatrywać aplikacje.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const accept = id.startsWith('app:accept:');
    const uid = id.split(':')[2] ?? '';
    const c = cfg();
    if (accept && c.roleId && interaction.guild) {
      const m = await interaction.guild.members.fetch(uid).catch(() => null);
      if (m) await m.roles.add(c.roleId).catch(() => {});
    }
    const user = await interaction.client.users.fetch(uid).catch(() => null);
    if (user) {
      await user
        .send(
          accept
            ? `✅ Twoja aplikacja na **${interaction.guild?.name}** została zaakceptowana!`
            : `❌ Twoja aplikacja na **${interaction.guild?.name}** została odrzucona.`,
        )
        .catch(() => {});
    }
    const old = interaction.message.embeds[0];
    const embed = EmbedBuilder.from(old)
      .setColor(accept ? 0x22c55e : 0x6b7280)
      .setFooter({
        text: `${accept ? '✅ Zaakceptowano' : '❌ Odrzucono'} przez ${interaction.user.username}`,
      });
    await interaction.update({ embeds: [embed], components: [] });
  }
}

export async function handleApplicationModal(interaction: ModalSubmitInteraction): Promise<void> {
  if (interaction.customId !== 'app:submit') return;
  const c = cfg();
  if (!c.on || !c.reviewChannelId || !interaction.guild) {
    await interaction.reply({
      content: '📋 Aplikacje są wyłączone.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const fields = questionsOrDefault(c)
    .slice(0, 5)
    .map((q, i) => ({
      name: q.slice(0, 256),
      value: (interaction.fields.getTextInputValue(`q${i}`) || '—').slice(0, 1024),
    }));
  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle('📋 Nowa aplikacja')
    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
    .addFields(fields)
    .setFooter({ text: `ID: ${interaction.user.id}` })
    .setTimestamp(new Date());
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`app:accept:${interaction.user.id}`)
      .setLabel('Akceptuj')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`app:deny:${interaction.user.id}`)
      .setLabel('Odrzuć')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Danger),
  );
  const ch = await interaction.guild.channels.fetch(c.reviewChannelId).catch(() => null);
  if (ch?.isTextBased() && 'send' in ch) {
    await (ch as TextChannel).send({ embeds: [embed], components: [row] }).catch(() => {});
  }
  await interaction.reply({
    content: '✅ Aplikacja wysłana! Czekaj na decyzję obsługi.',
    flags: MessageFlags.Ephemeral,
  });
}
