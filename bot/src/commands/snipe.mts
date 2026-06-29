// /snipe — pokazuje OSTATNIĄ usuniętą (lub edytowaną) wiadomość na kanale. In-memory (TTL 30 min,
// spójne z cache wiadomości bota = 100 szt./30 min). Tylko moderacja (ManageMessages). Bez tabeli.
import {
  type ChatInputCommandInteraction,
  type Client,
  EmbedBuilder,
  Events,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { log } from '../lib/log.mts';

type Snipe = { tag: string; content: string; at: number; before?: string };
const deleted = new Map<string, Snipe>();
const edited = new Map<string, Snipe>();
const TTL = 30 * 60_000;

export const data = new SlashCommandBuilder()
  .setName('snipe')
  .setDescription('Pokaż ostatnią usuniętą (lub edytowaną) wiadomość na kanale.')
  .addBooleanOption((o) =>
    o.setName('edytowana').setDescription('Pokaż ostatnią EDYTOWANĄ zamiast usuniętej.'),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.inGuild()) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  const wantEdited = interaction.options.getBoolean('edytowana') ?? false;
  const s = (wantEdited ? edited : deleted).get(interaction.channelId);
  if (!s || Date.now() - s.at > TTL) {
    await interaction.reply({
      content: wantEdited
        ? '🫥 Brak ostatnio edytowanej wiadomości w pamięci (limit 30 min).'
        : '🫥 Brak ostatnio usuniętej wiadomości w pamięci (limit 30 min).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setAuthor({ name: s.tag })
    .setDescription(s.content || '*(brak treści — np. sam załącznik)*')
    .setFooter({ text: wantEdited ? 'Edytowana wiadomość' : 'Usunięta wiadomość' })
    .setTimestamp(new Date(s.at));
  if (wantEdited && s.before)
    embed.addFields({ name: 'Przed edycją', value: s.before.slice(0, 1024) });
  await interaction.reply({ embeds: [embed] });
}

export function startSnipe(client: Client): void {
  client.on(Events.MessageDelete, (msg) => {
    if (msg.partial || msg.author?.bot || !msg.guildId) return;
    const content = msg.content ?? '';
    if (!content) return; // tylko tekst (załączniki znikają z CDN, nie ma sensu cache'ować)
    deleted.set(msg.channelId, {
      tag: msg.author.tag,
      content: content.slice(0, 4000),
      at: Date.now(),
    });
  });
  client.on(Events.MessageUpdate, (oldMsg, newMsg) => {
    if (newMsg.partial || newMsg.author?.bot || !newMsg.guildId) return;
    const before = oldMsg.partial ? '' : (oldMsg.content ?? '');
    const after = newMsg.content ?? '';
    if (before === after) return;
    edited.set(newMsg.channelId, {
      tag: newMsg.author.tag,
      content: after.slice(0, 4000),
      before: before.slice(0, 4000),
      at: Date.now(),
    });
  });
  log.info('[snipe] /snipe aktywny (in-memory, TTL 30 min, tylko moderacja).');
}
