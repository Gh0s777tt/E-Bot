// TempVoice 2.0 (Etap H) — kanały głosowe na żądanie + PANEL z przyciskami w czacie kanału:
// ✏️ nazwa · 👥 limit · 🔒 zamknij/otwórz · 👻 ukryj/pokaż · 👢 wyrzuć · 👑 przejmij · 🔁 przekaż.
// Właściciel śledzony w pamięci (kanały są ulotne). Routing: 'tv:' (button/modal/user-select).

import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  ChannelType,
  type Client,
  EmbedBuilder,
  Events,
  type Interaction,
  MessageFlags,
  ModalBuilder,
  type ModalSubmitInteraction,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
  type UserSelectMenuInteraction,
  type VoiceChannel,
} from 'discord.js';
import { type Locale, resolveGuildLocale, resolveLocale, t } from '../i18n/index.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';

const ACCENT = 0xe50914;
const temp = new Set<string>(); // id kanałów utworzonych przez bota
const owners = new Map<string, string>(); // channelId -> ownerId

// Etap K — config per-serwer: świeży odczyt (hub-channel ID i tak per-serwer), fallback global.
function cfg(guildId: string): { on: boolean; hubId: string; categoryId: string; nameTpl: string } {
  const raw = getGuildSettings(guildId).tempvoice_config;
  try {
    const c = raw
      ? (JSON.parse(raw) as {
          enabled?: boolean;
          hubChannelId?: string;
          categoryId?: string;
          nameTemplate?: string;
        })
      : {};
    return {
      on: !!c.enabled,
      hubId: c.hubChannelId || '',
      categoryId: c.categoryId || '',
      nameTpl: c.nameTemplate || '🔊 {user}',
    };
  } catch {
    return { on: false, hubId: '', categoryId: '', nameTpl: '🔊 {user}' };
  }
}

function panelRows(l: Locale): ActionRowBuilder<ButtonBuilder>[] {
  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('tv:rename')
      .setLabel(t(l, 'tv.btnRename'))
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('tv:limit')
      .setLabel(t(l, 'tv.btnLimit'))
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('tv:lock')
      .setLabel(t(l, 'tv.btnLock'))
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('tv:hide')
      .setLabel(t(l, 'tv.btnHide'))
      .setStyle(ButtonStyle.Secondary),
  );
  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('tv:kick')
      .setLabel(t(l, 'tv.btnKick'))
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('tv:claim')
      .setLabel(t(l, 'tv.btnClaim'))
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('tv:transfer')
      .setLabel(t(l, 'tv.btnTransfer'))
      .setStyle(ButtonStyle.Primary),
  );
  return [row1, row2];
}

async function sendPanel(channel: VoiceChannel, ownerId: string): Promise<void> {
  const l = resolveGuildLocale();
  const embed = new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(t(l, 'tv.title'))
    .setDescription(t(l, 'tv.desc', { user: `<@${ownerId}>` }));
  await channel.send({ embeds: [embed], components: panelRows(l) }).catch(() => {});
}

// Kanał tymczasowy, w którego czacie kliknięto komponent (czat voice = sam kanał).
function tempChannelOf(interaction: Interaction): VoiceChannel | null {
  const ch = interaction.channel;
  if (!ch || ch.type !== ChannelType.GuildVoice || !temp.has(ch.id)) return null;
  return ch as VoiceChannel;
}

// Czy użytkownik może sterować kanałem tymczasowym: właściciel LUB osoba z ManageChannels (staff).
// Czysta (bez stanu `owners`) — ryglowalna; isController wstrzykuje aktualnego właściciela kanału.
export function canControlVoice(
  ownerId: string | undefined,
  userId: string,
  member: ButtonInteraction['member'],
): boolean {
  if (ownerId === userId) return true;
  return !!(
    member &&
    'permissions' in member &&
    typeof member.permissions !== 'string' &&
    member.permissions.has(PermissionFlagsBits.ManageChannels)
  );
}

function isController(
  interaction: ButtonInteraction | UserSelectMenuInteraction | ModalSubmitInteraction,
  channelId: string,
): boolean {
  return canControlVoice(owners.get(channelId), interaction.user.id, interaction.member);
}

export async function handleTempvoiceButton(interaction: ButtonInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const ch = tempChannelOf(interaction);
  if (!ch || !interaction.guild) {
    await interaction.reply({ content: t(locale, 'tv.notTemp'), flags: MessageFlags.Ephemeral });
    return;
  }
  const action = interaction.customId.split(':')[1];
  const gLocale = resolveGuildLocale();

  // 👑 Przejęcie — dozwolone każdemu na kanale, gdy właściciela nie ma.
  if (action === 'claim') {
    const ownerId = owners.get(ch.id);
    if (ownerId && ch.members.has(ownerId)) {
      await interaction.reply({
        content: t(locale, 'tv.ownerPresent'),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    if (!ch.members.has(interaction.user.id)) {
      await interaction.reply({
        content: t(locale, 'tv.notInChannel'),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    owners.set(ch.id, interaction.user.id);
    await interaction.reply({
      content: t(gLocale, 'tv.claimed', { user: `<@${interaction.user.id}>` }),
    });
    return;
  }

  if (!isController(interaction, ch.id)) {
    await interaction.reply({ content: t(locale, 'tv.notOwner'), flags: MessageFlags.Ephemeral });
    return;
  }

  if (action === 'rename' || action === 'limit') {
    const modal = new ModalBuilder()
      .setCustomId(`tv:${action}`)
      .setTitle(t(locale, action === 'rename' ? 'tv.modalName' : 'tv.modalLimit'));
    const input = new TextInputBuilder()
      .setCustomId('value')
      .setLabel(t(locale, action === 'rename' ? 'tv.modalName' : 'tv.modalLimit').slice(0, 45))
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(action === 'rename' ? 90 : 2)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
    await interaction.showModal(modal);
    return;
  }

  if (action === 'lock' || action === 'hide') {
    const everyone = interaction.guild.roles.everyone;
    const ow = ch.permissionOverwrites.cache.get(everyone.id);
    try {
      if (action === 'lock') {
        const locked = ow?.deny.has(PermissionFlagsBits.Connect) ?? false;
        await ch.permissionOverwrites.edit(everyone, { Connect: locked ? null : false });
        await interaction.reply({ content: t(gLocale, locked ? 'tv.unlocked' : 'tv.locked') });
      } else {
        const hidden = ow?.deny.has(PermissionFlagsBits.ViewChannel) ?? false;
        await ch.permissionOverwrites.edit(everyone, { ViewChannel: hidden ? null : false });
        await interaction.reply({ content: t(gLocale, hidden ? 'tv.shown' : 'tv.hidden') });
      }
    } catch {
      await interaction.reply({
        content: t(locale, 'blueprint.fail'),
        flags: MessageFlags.Ephemeral,
      });
    }
    return;
  }

  if (action === 'kick' || action === 'transfer') {
    const select = new UserSelectMenuBuilder()
      .setCustomId(`tv:${action}sel`)
      .setMinValues(1)
      .setMaxValues(1);
    await interaction.reply({
      content: t(locale, 'tv.selectUser'),
      components: [new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(select)],
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleTempvoiceSelect(interaction: UserSelectMenuInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const ch = tempChannelOf(interaction);
  if (!ch) {
    await interaction.update({ content: t(locale, 'tv.notTemp'), components: [] });
    return;
  }
  if (!isController(interaction, ch.id)) {
    await interaction.update({ content: t(locale, 'tv.notOwner'), components: [] });
    return;
  }
  const targetId = interaction.values[0];
  const member = targetId ? ch.members.get(targetId) : undefined;
  if (!targetId || !member) {
    await interaction.update({ content: t(locale, 'tv.notInChannel'), components: [] });
    return;
  }
  const gLocale = resolveGuildLocale();

  if (interaction.customId === 'tv:kicksel') {
    await member.voice.disconnect('TempVoice: wyrzucenie przez właściciela').catch(() => {});
    await interaction.update({
      content: t(locale, 'tv.kicked', { user: `<@${targetId}>` }),
      components: [],
    });
    return;
  }

  // tv:transfersel
  owners.set(ch.id, targetId);
  await interaction.update({
    content: t(locale, 'tv.transferred', { user: `<@${targetId}>` }),
    components: [],
  });
  await ch.send(t(gLocale, 'tv.transferred', { user: `<@${targetId}>` })).catch(() => {});
}

export async function handleTempvoiceModal(interaction: ModalSubmitInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const ch = tempChannelOf(interaction);
  if (!ch) {
    await interaction.reply({ content: t(locale, 'tv.notTemp'), flags: MessageFlags.Ephemeral });
    return;
  }
  if (!isController(interaction, ch.id)) {
    await interaction.reply({ content: t(locale, 'tv.notOwner'), flags: MessageFlags.Ephemeral });
    return;
  }
  const value = interaction.fields.getTextInputValue('value').trim();
  const gLocale = resolveGuildLocale();
  try {
    if (interaction.customId === 'tv:rename') {
      const name = value.slice(0, 90);
      await ch.setName(name);
      await interaction.reply({ content: t(gLocale, 'tv.renamed', { name }) });
      return;
    }
    // tv:limit
    const n = Math.min(99, Math.max(0, Number.parseInt(value, 10) || 0));
    await ch.setUserLimit(n);
    await interaction.reply({
      content: t(gLocale, 'tv.limited', { limit: n === 0 ? '∞' : String(n) }),
    });
  } catch {
    await interaction.reply({
      content: t(locale, 'blueprint.fail'),
      flags: MessageFlags.Ephemeral,
    });
  }
}

export function startTempVoice(client: Client): void {
  log.info('[tempvoice] aktywny 2.0 (panel z przyciskami; config z panelu).');
  client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    try {
      const c = cfg(newState.guild?.id ?? '');
      // utworzenie kanału po wejściu na hub
      if (c.on && c.hubId && newState.channelId === c.hubId && newState.member && newState.guild) {
        const name = c.nameTpl.replaceAll('{user}', newState.member.displayName).slice(0, 100);
        const created = await newState.guild.channels
          .create({
            name,
            type: ChannelType.GuildVoice,
            parent: c.categoryId || newState.channel?.parentId || undefined,
          })
          .catch(() => null);
        if (created) {
          temp.add(created.id);
          owners.set(created.id, newState.member.id);
          await newState.member.voice.setChannel(created).catch(() => {});
          await sendPanel(created as VoiceChannel, newState.member.id);
        }
      }
      // sprzątanie pustego kanału tymczasowego
      const left = oldState.channel;
      if (left && temp.has(left.id) && left.members.size === 0) {
        temp.delete(left.id);
        owners.delete(left.id);
        await left.delete().catch(() => {});
      }
    } catch (e) {
      log.warn('[tempvoice]', { err: e });
    }
  });
}
