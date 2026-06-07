// Faza 7 / F5 — obsługa przycisków/modalu ticketów (panel → modal → wątek; close; ocena).
import {
  ActionRowBuilder,
  type ButtonInteraction,
  MessageFlags,
  ModalBuilder,
  type ModalSubmitInteraction,
  PermissionFlagsBits,
  type TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { cloudUpdate, hasCloud } from '../lib/cloud.mts';
import { closeTicket, openTicket, ticketConfig } from './service.mts';

export async function handleTicketButton(interaction: ButtonInteraction): Promise<void> {
  const id = interaction.customId;

  if (id === 'ticket:new' || id.startsWith('ticket:new:')) {
    if (!ticketConfig().enabled) {
      await interaction.reply({
        content: '🎟️ Tickety są wyłączone.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const catId = id.startsWith('ticket:new:') ? id.slice('ticket:new:'.length) : '';
    const modal = new ModalBuilder()
      .setCustomId(catId ? `ticketModal:${catId}` : 'ticketModal')
      .setTitle('Nowy ticket');
    const input = new TextInputBuilder()
      .setCustomId('subject')
      .setLabel('Czego dotyczy zgłoszenie?')
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(200)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
    await interaction.showModal(modal);
    return;
  }

  if (id === 'ticket:claim') {
    const ch = interaction.channel;
    if (!ch?.isThread()) {
      await interaction.reply({
        content: 'To nie jest wątek ticketu.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const cfg = ticketConfig();
    const gm = await interaction.guild?.members.fetch(interaction.user.id).catch(() => null);
    const supportRoleIds = [
      cfg.supportRoleId,
      ...(cfg.categories ?? []).map((c) => c.supportRoleId),
    ].filter(Boolean);
    const allowed =
      !!gm?.permissions.has(PermissionFlagsBits.ManageThreads) ||
      supportRoleIds.some((rid) => !!gm?.roles.cache.has(rid));
    if (!allowed) {
      await interaction.reply({
        content: '⛔ Tylko obsługa może przejąć ticket.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    if (hasCloud()) {
      await cloudUpdate('tickets', `channel_id=eq.${ch.id}`, {
        claimed_by: interaction.user.id,
        status: 'claimed',
      }).catch(() => {});
    }
    await interaction.reply(`🙋 <@${interaction.user.id}> przejął(ęła) ten ticket.`);
    return;
  }

  if (id === 'ticket:close') {
    const ch = interaction.channel;
    if (!ch?.isThread()) {
      await interaction.reply({
        content: 'To nie jest wątek ticketu.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    await interaction.reply('🔒 Zamykam ticket…');
    await closeTicket(ch);
    return;
  }

  if (id.startsWith('ticket:rate:')) {
    const parts = id.split(':');
    const channelId = parts[2];
    const score = Number(parts[3]);
    if (hasCloud() && channelId) {
      await cloudUpdate('tickets', `channel_id=eq.${channelId}`, { rating: score }).catch(() => {});
    }
    await interaction.reply({
      content: `Dziękujemy za ocenę: ${'⭐'.repeat(Math.max(1, Math.min(5, score)))}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleTicketModal(interaction: ModalSubmitInteraction): Promise<void> {
  if (!interaction.customId.startsWith('ticketModal')) return;
  const catId = interaction.customId.startsWith('ticketModal:')
    ? interaction.customId.slice('ticketModal:'.length)
    : '';
  const subject = interaction.fields.getTextInputValue('subject');
  const ch = interaction.channel;
  if (!ch || !('threads' in ch)) {
    await interaction.reply({
      content: 'Tu nie można otworzyć ticketu.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const thread = await openTicket(ch as TextChannel, interaction.user, subject, catId || undefined);
  await interaction.editReply(
    thread ? `✅ Otwarto ticket: <#${thread.id}>` : '❌ Nie udało się otworzyć ticketu.',
  );
}
