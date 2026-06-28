// Faza 7 / F7.1 — sugestie: /suggest publikuje embed z głosowaniem (reakcje 👍/👎) + przyciski
// decyzji dla moderacji (✅/❌/🤔). Config 'suggestions_config', dane w Supabase 'suggestions'.
import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
} from 'discord.js';
import { cloudUpdate, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

export type SuggestionsConfig = { enabled: boolean; channelId: string; anonymous: boolean };
const DEFAULT: SuggestionsConfig = { enabled: false, channelId: '', anonymous: false };

// Etap K — config per-serwer: czytany świeżo dla danego serwera (komenda = niska częstotliwość).
export function suggestionsConfig(guildId: string): SuggestionsConfig {
  return mergeConfig(getGuildSettings(guildId)['suggestions_config'], DEFAULT);
}

export const STATUS = {
  open: { label: '🟡 Otwarta', color: 0xfaa61a },
  approved: { label: '🟢 Zatwierdzona', color: 0x3ba55d },
  denied: { label: '🔴 Odrzucona', color: 0xe50914 },
  considered: { label: '🔵 Rozważana', color: 0x5865f2 },
} as const;

export function suggestionModRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('sug:approve')
      .setLabel('Zatwierdź')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('sug:deny')
      .setLabel('Odrzuć')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('sug:consider')
      .setLabel('Rozważ')
      .setEmoji('🤔')
      .setStyle(ButtonStyle.Secondary),
  );
}

export async function handleSuggestionButton(interaction: ButtonInteraction): Promise<void> {
  const action = interaction.customId.split(':')[1];
  const map: Record<string, keyof typeof STATUS> = {
    approve: 'approved',
    deny: 'denied',
    consider: 'considered',
  };
  const status = map[action];
  if (!status) return;

  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    await interaction.reply({
      content: '⛔ Tylko moderacja może decydować o sugestiach.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const st = STATUS[status];
  const old = interaction.message.embeds[0];
  const embed = (old ? EmbedBuilder.from(old) : new EmbedBuilder())
    .setColor(st.color)
    .setFields(
      { name: 'Status', value: st.label, inline: true },
      { name: 'Decyzja', value: `<@${interaction.user.id}>`, inline: true },
    );
  await interaction.update({ embeds: [embed] });
  if (hasCloud()) {
    await cloudUpdate('suggestions', `message_id=eq.${interaction.message.id}`, { status }).catch(
      () => {},
    );
  }
}
