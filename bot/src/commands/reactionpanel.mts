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
import { getSettings, setSetting } from '../lib/db.mts';
import { buildRichMessage, hasRich, type RichMessage } from '../lib/richMessage.mts';

type Pair = { emoji: string; roleId: string };
type Panel = { panelSpec?: RichMessage; pairs?: Pair[] };

export const data = new SlashCommandBuilder()
  .setName('reactionpanel')
  .setDescription('Opublikuj panel reaction-role (embed z panelu) + auto-reakcje.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

function readPanel(): Panel {
  try {
    return JSON.parse(getSettings().reaction_role_panel || '{}') as Panel;
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
  const panel = readPanel();
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
    setSetting('reaction_role_panel_msg', msg.id);
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
