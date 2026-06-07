// Faza 6 / B5 — dispatcher przycisków: role (role:<id>) + wejście do giveawayu (gw:<id>).
import type { ButtonInteraction } from 'discord.js';
import { handleRoleButton } from './buttonroles.mts';
import { handleGiveawayEntry } from './giveaways.mts';

export async function handleButton(interaction: ButtonInteraction): Promise<void> {
  const id = interaction.customId;
  if (id.startsWith('role:')) {
    await handleRoleButton(interaction, id.slice(5));
    return;
  }
  if (id.startsWith('gw:')) {
    await handleGiveawayEntry(interaction, id.slice(3));
  }
}
