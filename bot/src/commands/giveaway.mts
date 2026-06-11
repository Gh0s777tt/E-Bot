// /giveaway start|reroll — konkurs z przyciskiem "Wejdź". Wpisy w Supabase, losowanie przez poller.
// Tor G: wymagania wejścia (rola/poziom/zaproszenia) + bonus-losy za rolę + reroll.
import { randomUUID } from 'node:crypto';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type TextChannel,
} from 'discord.js';
import { weightedPick } from '../engagement/giveaways.mts';
import { cloudInsert, cloudSelect, hasCloud } from '../lib/cloud.mts';
import { setSetting } from '../lib/db.mts';
import { formatDuration, parseDuration } from '../lib/duration.mts';

const eph = (content: string) => ({ content, flags: MessageFlags.Ephemeral as const });

export const data = new SlashCommandBuilder()
  .setName('giveaway')
  .setDescription('Konkursy (giveaway).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((s) =>
    s
      .setName('start')
      .setDescription('Rozpocznij giveaway')
      .addStringOption((o) => o.setName('czas').setDescription('np. 1h, 1d').setRequired(true))
      .addIntegerOption((o) =>
        o
          .setName('zwyciezcow')
          .setDescription('Liczba zwycięzców')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(20),
      )
      .addStringOption((o) =>
        o.setName('nagroda').setDescription('Nagroda').setRequired(true).setMaxLength(200),
      )
      .addRoleOption((o) => o.setName('wymagana_rola').setDescription('Wymagana rola, by wejść'))
      .addIntegerOption((o) =>
        o.setName('wymagany_poziom').setDescription('Min. poziom').setMinValue(0).setMaxValue(1000),
      )
      .addIntegerOption((o) =>
        o
          .setName('wymagane_zaproszenia')
          .setDescription('Min. zaproszeń')
          .setMinValue(0)
          .setMaxValue(1000),
      )
      .addRoleOption((o) => o.setName('bonus_rola').setDescription('Rola dająca dodatkowe losy'))
      .addIntegerOption((o) =>
        o
          .setName('bonus_losy')
          .setDescription('Losów dla bonus-roli (2–10)')
          .setMinValue(2)
          .setMaxValue(10),
      )
      .addStringOption((o) =>
        o
          .setName('nagroda_typ')
          .setDescription('Dodatkowa nagroda wypłacana zwycięzcom (oprócz tekstu)')
          .addChoices(
            { name: '💬 Tylko tekst', value: 'text' },
            { name: '💰 Monety (ekonomia)', value: 'money' },
            { name: '⭐ XP (poziomy)', value: 'xp' },
          ),
      )
      .addIntegerOption((o) =>
        o
          .setName('nagroda_kwota')
          .setDescription('Ile monet/XP dla KAŻDEGO zwycięzcy')
          .setMinValue(1)
          .setMaxValue(1000000),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('reroll')
      .setDescription('Wylosuj zwycięzców ponownie')
      .addStringOption((o) =>
        o.setName('message_id').setDescription('ID wiadomości giveawayu').setRequired(true),
      ),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply(eph('Tylko na serwerze.'));
    return;
  }
  if (!hasCloud()) {
    await interaction.reply(eph('❌ Giveaway wymaga chmury (Supabase).'));
    return;
  }
  const sub = interaction.options.getSubcommand();

  if (sub === 'reroll') {
    const messageId = interaction.options.getString('message_id', true);
    const rows = await cloudSelect<{
      id: string;
      channel_id: string;
      prize: string;
      winners: number;
    }>('giveaways', `select=id,channel_id,prize,winners&message_id=eq.${messageId}`);
    const g = rows[0];
    if (!g) {
      await interaction.reply(eph('❌ Nie znaleziono giveawayu o tym ID wiadomości.'));
      return;
    }
    const entries = await cloudSelect<{ user_id: string; weight?: number }>(
      'giveaway_entries',
      `select=*&giveaway_id=eq.${g.id}`,
    );
    if (!entries.length) {
      await interaction.reply(eph('Brak uczestników do rerollu.'));
      return;
    }
    const winners = weightedPick(entries, Math.min(g.winners, entries.length));
    const ch = await interaction.client.channels.fetch(g.channel_id).catch(() => null);
    if (ch?.isTextBased() && 'send' in ch) {
      await (ch as TextChannel)
        .send(
          `🎉 **Reroll — ${g.prize}**!\nNowi zwycięzcy: ${winners.map((w) => `<@${w}>`).join(', ')}`,
        )
        .catch(() => {});
    }
    await interaction.reply(eph('✅ Wylosowano ponownie.'));
    return;
  }

  // start
  const czas = interaction.options.getString('czas', true);
  const winners = interaction.options.getInteger('zwyciezcow', true);
  const prize = interaction.options.getString('nagroda', true);
  const ms = parseDuration(czas);
  if (!ms) {
    await interaction.reply(eph('❌ Zły format czasu. Użyj np. `1h`, `1d`.'));
    return;
  }
  const reqRole = interaction.options.getRole('wymagana_rola');
  const reqLevel = interaction.options.getInteger('wymagany_poziom') ?? 0;
  const reqInvites = interaction.options.getInteger('wymagane_zaproszenia') ?? 0;
  const bonusRole = interaction.options.getRole('bonus_rola');
  const bonusWeight = interaction.options.getInteger('bonus_losy') ?? 1;
  const rewardKind = interaction.options.getString('nagroda_typ') ?? 'text';
  const rewardAmount = interaction.options.getInteger('nagroda_kwota') ?? 0;
  const hasBonus = (rewardKind === 'money' || rewardKind === 'xp') && rewardAmount > 0;
  const rewardNote = hasBonus
    ? `\n**+ Bonus dla każdego:** ${rewardKind === 'money' ? `💰 ${rewardAmount} monet` : `⭐ ${rewardAmount} XP`}`
    : '';

  const id = randomUUID();
  const endsAt = Date.now() + ms;
  const reqLines: string[] = [];
  if (reqRole) reqLines.push(`Rola: <@&${reqRole.id}>`);
  if (reqLevel > 0) reqLines.push(`Poziom ≥ ${reqLevel}`);
  if (reqInvites > 0) reqLines.push(`Zaproszenia ≥ ${reqInvites}`);
  if (bonusRole) reqLines.push(`Bonus ×${bonusWeight} losów: <@&${bonusRole.id}>`);

  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle('🎉 GIVEAWAY 🎉')
    .setDescription(
      `**Nagroda:** ${prize}${rewardNote}\n**Zwycięzców:** ${winners}\n**Koniec:** <t:${Math.floor(endsAt / 1000)}:R>${
        reqLines.length ? `\n\n**Wymagania:**\n${reqLines.join('\n')}` : ''
      }\n\nKliknij 🎉 aby dołączyć!`,
    )
    .setFooter({ text: `Host: ${interaction.user.username}` })
    .setTimestamp(new Date(endsAt));
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`gw:${id}`)
      .setLabel('Wejdź')
      .setEmoji('🎉')
      .setStyle(ButtonStyle.Primary),
  );
  const ch = interaction.channel as TextChannel;
  const msg = await ch.send({ embeds: [embed], components: [row] });
  await cloudInsert('giveaways', [
    {
      id,
      guild_id: interaction.guildId,
      channel_id: ch.id,
      message_id: msg.id,
      prize,
      winners,
      host_id: interaction.user.id,
      ends_at: new Date(endsAt).toISOString(),
      req_role_id: reqRole?.id ?? null,
      req_level: reqLevel,
      req_invites: reqInvites,
      bonus_role_id: bonusRole?.id ?? null,
      bonus_weight: bonusWeight,
    },
  ]);
  // Bonus $/XP: zapis poza tabelą giveaways (klucz settings 'gwreward:<id>') — insert wyżej nietknięty,
  // więc brak ryzyka regresji. Poller wypłaca przy losowaniu. Bez zmian schematu Supabase.
  if (hasBonus)
    setSetting(`gwreward:${id}`, JSON.stringify({ kind: rewardKind, amount: rewardAmount }));
  await interaction.reply(eph(`✅ Giveaway wystartował! Koniec za **${formatDuration(ms)}**.`));
}
