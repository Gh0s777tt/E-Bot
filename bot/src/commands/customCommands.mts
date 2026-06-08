// No-code komendy slash — definicje rejestruje panel w Discord (POST upsert), a bot obsługuje
// ich wywołania tutaj: czyta settings 'custom_commands' (sync przez bridge/realtime) i odpowiada
// zbudowanym RichMessage. Zwraca true, jeśli komenda była customowa (obsłużona).
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { getSettings } from '../lib/db.mts';
import { buildRichMessage, type RichMessage } from '../lib/richMessage.mts';

type CustomCommand = {
  name: string;
  description?: string;
  response: RichMessage;
  ephemeral?: boolean;
};

function load(): CustomCommand[] {
  const raw = getSettings()['custom_commands'];
  try {
    const a = raw ? (JSON.parse(raw) as CustomCommand[]) : [];
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

export async function handleCustomCommand(
  interaction: ChatInputCommandInteraction,
): Promise<boolean> {
  const cmd = load().find((c) => c.name === interaction.commandName);
  if (!cmd) return false;

  const guild = interaction.guild;
  const vars: Record<string, string> = {
    '{user}': `<@${interaction.user.id}>`,
    '{username}': interaction.user.username,
    '{server}': guild?.name ?? '',
    '{guild}': guild?.name ?? '',
    '{memberCount}': String(guild?.memberCount ?? ''),
  };
  const payload = buildRichMessage(cmd.response, vars);
  if (!payload.content && !payload.embeds.length) {
    await interaction.reply({ content: '(pusta odpowiedź)', flags: MessageFlags.Ephemeral });
    return true;
  }
  await interaction.reply(cmd.ephemeral ? { ...payload, flags: MessageFlags.Ephemeral } : payload);
  return true;
}
