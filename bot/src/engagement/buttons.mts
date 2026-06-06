// Faza 6 / B5 — dispatcher przycisków: role (role:<id>) + wejście do giveawayu (gw:<id>).
import { type ButtonInteraction, MessageFlags } from 'discord.js';
import { cloudUpsert, hasCloud } from '../lib/cloud.mts';
import { handleRoleButton } from './buttonroles.mts';

export async function handleButton(interaction: ButtonInteraction): Promise<void> {
  const id = interaction.customId;
  if (id.startsWith('role:')) {
    await handleRoleButton(interaction, id.slice(5));
    return;
  }
  if (id.startsWith('gw:')) {
    if (!hasCloud()) {
      await interaction.reply({ content: '❌ Chmura niedostępna.', flags: MessageFlags.Ephemeral });
      return;
    }
    await cloudUpsert(
      'giveaway_entries',
      [{ giveaway_id: id.slice(3), user_id: interaction.user.id }],
      'giveaway_id,user_id',
    ).catch(() => {});
    await interaction.reply({
      content: '🎉 Bierzesz udział w giveawayu! Powodzenia.',
      flags: MessageFlags.Ephemeral,
    });
  }
}
