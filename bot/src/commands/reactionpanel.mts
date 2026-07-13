// Faza 8 #5 — /reactionpanel: publikuje panel reaction-role (embed z Message Studio) i dodaje
// auto-reakcje wg par emoji→rola; zapisuje id wiadomości do 'reaction_role_panel_msg' (handler mapuje).
import {
  type APIEmbed,
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type TextChannel,
} from 'discord.js';
import { getGuildSettings, setGuildSetting } from '../lib/db.mts';
import { buildRichMessage, hasRich, type RichMessage } from '../lib/richMessage.mts';
import { refreshGuild } from '../reaction-roles.mts';

type Pair = { emoji: string; roleId: string };
type Panel = { panelSpec?: RichMessage; pairs?: Pair[] };

export const data = new SlashCommandBuilder()
  .setName('reactionpanel')
  .setDescription('Opublikuj panel reaction-role (embed z panelu) + auto-reakcje.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

// Config panelu PER-SERWER (audyt C-1) — override g:<id>:* → fallback global.
function readPanel(guildId: string): Panel {
  try {
    return JSON.parse(getGuildSettings(guildId).reaction_role_panel || '{}') as Panel;
  } catch {
    return {};
  }
}

// Custom emoji `<a:name:id>` → react po id; unicode → react po znaku.
function emojiForReact(raw: string): string {
  const m = /<a?:\w+:(\d+)>/.exec(raw);
  return m?.[1] ?? raw;
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  const panel = readPanel(guildId);
  const pairs = (panel.pairs ?? []).filter((p) => p.emoji && p.roleId);
  const ch = interaction.channel as TextChannel | null;
  if (!ch || !('send' in ch)) {
    await interaction.reply({
      content: 'Tu nie można opublikować.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (!panel.panelSpec || !hasRich(panel.panelSpec)) {
    await interaction.reply({
      content: '⚠️ Najpierw skonfiguruj panel reaction-role w panelu web (treść/embed + pary).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const built = buildRichMessage(panel.panelSpec, {});
  const payload: { content?: string; embeds?: APIEmbed[] } = {};
  if (built.embeds.length) payload.embeds = built.embeds;
  if (built.content) payload.content = built.content;
  if (!built.content && !built.embeds.length) payload.content = 'Wybierz role reakcją poniżej.';

  try {
    const msg = await ch.send(payload);
    for (const p of pairs) {
      await msg.react(emojiForReact(p.emoji)).catch(() => {});
    }
    setGuildSetting(guildId, 'reaction_role_panel_msg', msg.id);
    refreshGuild(guildId); // natychmiast aktywuj panel dla tego serwera (bez czekania na poller)
    await interaction.reply({
      content: `✅ Panel opublikowany (reakcje: ${pairs.length}). Zapisano jako aktywny panel reaction-role.`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (e) {
    await interaction.reply({
      content: `❌ Nie udało się opublikować: ${(e as Error).message}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
