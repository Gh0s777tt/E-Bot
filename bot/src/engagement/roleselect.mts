// Wielo-dropdownowe role-menu (stateless). Zestaw ról bierzemy z OPCJI samego menu
// (value = roleId), więc obsługuje DOWOLNĄ liczbę paneli — customId zaczyna się od 'rsel'.
// Dodaje zaznaczone, zdejmuje odznaczone (w obrębie opcji tego menu) → maxValues=1 daje
// wybór wykluczający (np. jeden znak zodiaku). Brak configu, brak stanu — wszystko w menu.
import { type GuildMember, MessageFlags, type StringSelectMenuInteraction } from 'discord.js';

export async function handleRoleSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const member = interaction.member as GuildMember | null;
  if (!member || !interaction.guild) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  const all = interaction.component.options.map((o) => o.value);
  const chosen = new Set(interaction.values);
  const added: string[] = [];
  const removed: string[] = [];
  for (const rid of all) {
    const has = member.roles.cache.has(rid);
    try {
      if (chosen.has(rid) && !has) {
        await member.roles.add(rid);
        added.push(rid);
      } else if (!chosen.has(rid) && has) {
        await member.roles.remove(rid);
        removed.push(rid);
      }
    } catch {
      /* hierarchia / uprawnienia — pomiń */
    }
  }
  const parts: string[] = [];
  if (added.length) parts.push(`➕ ${added.map((r) => `<@&${r}>`).join(' ')}`);
  if (removed.length) parts.push(`➖ ${removed.map((r) => `<@&${r}>`).join(' ')}`);
  await interaction.reply({
    content: parts.join('\n') || 'Bez zmian.',
    flags: MessageFlags.Ephemeral,
  });
}
