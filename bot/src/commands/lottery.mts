// Tor H — /lottery: serwerowa loteria. Bilety zasilają pulę; losowanie wypłaca całą pulę zwycięzcy.
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type TextChannel,
} from 'discord.js';
import { ecoConfig, fmt, getUser, saveUser } from '../economy/store.mts';
import { cloudDelete, cloudInsert, cloudSelect, hasCloud } from '../lib/cloud.mts';

const TICKET_PRICE = 500;
const eph = (content: string) => ({ content, flags: MessageFlags.Ephemeral as const });

export const data = new SlashCommandBuilder()
  .setName('lottery')
  .setDescription('Loteria serwerowa — pula rośnie z biletów.')
  .addSubcommand((s) =>
    s
      .setName('buy')
      .setDescription(`Kup bilet(y) po ${TICKET_PRICE}`)
      .addIntegerOption((o) =>
        o.setName('ile').setDescription('Ile biletów (1–50)').setMinValue(1).setMaxValue(50),
      ),
  )
  .addSubcommand((s) => s.setName('pool').setDescription('Pokaż pulę i swoje bilety'))
  .addSubcommand((s) => s.setName('draw').setDescription('Losuj zwycięzcę (admin)'));

type Ticket = { user_id: string };

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply(eph('Tylko na serwerze.'));
    return;
  }
  if (!hasCloud()) {
    await interaction.reply(eph('❌ Loteria wymaga chmury (Supabase).'));
    return;
  }
  const gid = interaction.guildId;
  const cur = ecoConfig(gid).currency;
  const sub = interaction.options.getSubcommand();

  if (sub === 'buy') {
    const qty = interaction.options.getInteger('ile') ?? 1;
    const cost = qty * TICKET_PRICE;
    const u = await getUser(gid, interaction.user.id);
    if (u.wallet < cost) {
      await interaction.reply(eph(`Masz za mało — bilety kosztują ${fmt(cost, cur)}.`));
      return;
    }
    await saveUser({
      guild_id: gid,
      user_id: interaction.user.id,
      username: interaction.user.username,
      wallet: u.wallet - cost,
    });
    await cloudInsert(
      'lottery_tickets',
      Array.from({ length: qty }, () => ({ guild_id: gid, user_id: interaction.user.id })),
    ).catch(() => {});
    const all = await cloudSelect<Ticket>('lottery_tickets', `select=user_id&guild_id=eq.${gid}`);
    await interaction.reply(
      eph(
        `🎟️ Kupiono **${qty}** bilet(ów). Pula: **${fmt(all.length * TICKET_PRICE, cur)}** (${all.length} biletów).`,
      ),
    );
    return;
  }

  if (sub === 'pool') {
    const all = await cloudSelect<Ticket>('lottery_tickets', `select=user_id&guild_id=eq.${gid}`);
    const mine = all.filter((t) => t.user_id === interaction.user.id).length;
    await interaction.reply(
      eph(
        `🎰 Pula loterii: **${fmt(all.length * TICKET_PRICE, cur)}** (${all.length} biletów).\nTwoje bilety: **${mine}** — szansa ${all.length ? Math.round((mine / all.length) * 100) : 0}%.`,
      ),
    );
    return;
  }

  // draw (admin)
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    await interaction.reply(eph('⛔ Losowanie może uruchomić tylko administracja.'));
    return;
  }
  const all = await cloudSelect<Ticket>('lottery_tickets', `select=user_id&guild_id=eq.${gid}`);
  if (!all.length) {
    await interaction.reply(eph('Brak biletów — pula jest pusta.'));
    return;
  }
  const winner = all[Math.floor(Math.random() * all.length)].user_id;
  const pool = all.length * TICKET_PRICE;
  const w = await getUser(gid, winner);
  await saveUser({ guild_id: gid, user_id: winner, username: w.username, wallet: w.wallet + pool });
  await cloudDelete('lottery_tickets', `guild_id=eq.${gid}`).catch(() => {});
  const ch = interaction.channel as TextChannel | null;
  if (ch && 'send' in ch) {
    await ch
      .send(
        `🎰 **Loteria rozstrzygnięta!** Zwycięzca: <@${winner}> — wygrywa **${fmt(pool, cur)}**! 🎉`,
      )
      .catch(() => {});
  }
  await interaction.reply(eph(`✅ Wylosowano zwycięzcę (pula ${fmt(pool, cur)}).`));
}
