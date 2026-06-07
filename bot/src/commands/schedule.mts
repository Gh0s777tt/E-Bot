// Tor F — /schedule: zaplanowane/cykliczne ogłoszenia (add/list/remove). Poller: engagement/scheduler.mts.
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { cloudDelete, cloudInsert, cloudSelect, hasCloud } from '../lib/cloud.mts';
import { parseDuration } from '../lib/duration.mts';

const eph = (content: string) => ({ content, flags: MessageFlags.Ephemeral as const });

export const data = new SlashCommandBuilder()
  .setName('schedule')
  .setDescription('Zaplanowane / cykliczne ogłoszenia.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((s) =>
    s
      .setName('add')
      .setDescription('Zaplanuj ogłoszenie')
      .addChannelOption((o) => o.setName('kanal').setDescription('Kanał').setRequired(true))
      .addStringOption((o) =>
        o.setName('tresc').setDescription('Treść').setRequired(true).setMaxLength(1900),
      )
      .addStringOption((o) =>
        o.setName('za').setDescription('Za ile (np. 30m, 2h, 1d)').setRequired(true),
      )
      .addStringOption((o) =>
        o.setName('powtarzaj').setDescription('Co ile powtarzać (np. 1d) — puste = jednorazowo'),
      ),
  )
  .addSubcommand((s) => s.setName('list').setDescription('Lista zaplanowanych'))
  .addSubcommand((s) =>
    s
      .setName('remove')
      .setDescription('Usuń zaplanowane')
      .addStringOption((o) =>
        o.setName('id').setDescription('ID (z /schedule list)').setRequired(true),
      ),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply(eph('Tylko na serwerze.'));
    return;
  }
  if (!hasCloud()) {
    await interaction.reply(eph('❌ Wymaga chmury (Supabase).'));
    return;
  }
  const gid = interaction.guildId;
  const sub = interaction.options.getSubcommand();

  if (sub === 'add') {
    const ch = interaction.options.getChannel('kanal', true);
    const message = interaction.options.getString('tresc', true);
    const za = parseDuration(interaction.options.getString('za', true));
    if (!za) {
      await interaction.reply(eph('❌ Zły format czasu (np. 30m, 2h, 1d).'));
      return;
    }
    const repeatStr = interaction.options.getString('powtarzaj');
    const repeat = repeatStr ? parseDuration(repeatStr) : 0;
    const intervalMin = repeat ? Math.round(repeat / 60_000) : 0;
    const runAtMs = Date.now() + za;
    await cloudInsert('scheduled_messages', [
      {
        guild_id: gid,
        channel_id: ch.id,
        message,
        run_at: new Date(runAtMs).toISOString(),
        interval_min: intervalMin,
        created_by: interaction.user.id,
      },
    ]);
    await interaction.reply(
      eph(
        `🗓️ Zaplanowano w <#${ch.id}> na <t:${Math.floor(runAtMs / 1000)}:R>${intervalMin ? ` (powtarzanie co ${intervalMin} min)` : ''}.`,
      ),
    );
    return;
  }

  if (sub === 'list') {
    const rows = await cloudSelect<{
      id: string;
      channel_id: string;
      run_at: string;
      interval_min: number;
      message: string;
    }>(
      'scheduled_messages',
      `select=id,channel_id,run_at,interval_min,message&guild_id=eq.${gid}&order=run_at.asc&limit=25`,
    );
    if (!rows.length) {
      await interaction.reply(eph('Brak zaplanowanych ogłoszeń.'));
      return;
    }
    const desc = rows
      .map(
        (r) =>
          `\`${r.id.slice(0, 8)}\` <#${r.channel_id}> — <t:${Math.floor(Date.parse(r.run_at) / 1000)}:R>${r.interval_min ? ` 🔁${r.interval_min}m` : ''}\n> ${r.message.slice(0, 70)}`,
      )
      .join('\n');
    await interaction.reply(eph(desc.slice(0, 1900)));
    return;
  }

  // remove
  const idq = interaction.options.getString('id', true).toLowerCase();
  const rows = await cloudSelect<{ id: string }>(
    'scheduled_messages',
    `select=id&guild_id=eq.${gid}`,
  );
  const m =
    rows.find((r) => r.id.toLowerCase() === idq) ??
    rows.find((r) => r.id.toLowerCase().startsWith(idq));
  if (!m) {
    await interaction.reply(eph('Nie znaleziono (sprawdź `/schedule list`).'));
    return;
  }
  await cloudDelete('scheduled_messages', `id=eq.${m.id}`);
  await interaction.reply(eph('🗑️ Usunięto zaplanowane ogłoszenie.'));
}
