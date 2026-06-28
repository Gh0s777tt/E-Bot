// Tor I — /skins: sklep skórek kart rang/profilu (kup/załóż za walutę).
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { equipSkin, getOwnedSkins, ownSkin, SKINS, skinById } from '../economy/skins.mts';
import { ecoConfig, ensureUser, fmt, spendWallet } from '../economy/store.mts';
import { hasCloud } from '../lib/cloud.mts';

const eph = (content: string) => ({ content, flags: MessageFlags.Ephemeral as const });
const CHOICES = SKINS.map((s) => ({ name: `${s.name} (${s.price})`, value: s.id }));

export const data = new SlashCommandBuilder()
  .setName('skins')
  .setDescription('Skórki kart rang/profilu.')
  .addSubcommand((s) => s.setName('list').setDescription('Lista skórek'))
  .addSubcommand((s) =>
    s
      .setName('buy')
      .setDescription('Kup skórkę')
      .addStringOption((o) =>
        o
          .setName('skorka')
          .setDescription('Którą')
          .setRequired(true)
          .addChoices(...CHOICES),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('equip')
      .setDescription('Załóż skórkę')
      .addStringOption((o) =>
        o
          .setName('skorka')
          .setDescription('Którą')
          .setRequired(true)
          .addChoices(...CHOICES),
      ),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply(eph('Tylko na serwerze.'));
    return;
  }
  if (!hasCloud()) {
    await interaction.reply(eph('❌ Skórki wymagają chmury (Supabase).'));
    return;
  }
  const gid = interaction.guildId;
  const uid = interaction.user.id;
  const cur = ecoConfig(gid).currency;
  const sub = interaction.options.getSubcommand();

  if (sub === 'list') {
    const owned = await getOwnedSkins(gid, uid);
    const lines = SKINS.map((s) => {
      const mark = s.price === 0 || owned.has(s.id) ? '✅ masz' : `🔒 ${fmt(s.price, cur)}`;
      return `**${s.name}** — ${mark}`;
    }).join('\n');
    await interaction.reply(
      eph(`🎨 **Skórki kart:**\n${lines}\n\nKup: \`/skins buy\` · Załóż: \`/skins equip\``),
    );
    return;
  }

  const id = interaction.options.getString('skorka', true);
  const skin = skinById(id);
  if (!skin) {
    await interaction.reply(eph('Nie ma takiej skórki.'));
    return;
  }

  if (sub === 'buy') {
    if (skin.price === 0) {
      await interaction.reply(eph('Ta skórka jest darmowa — od razu `/skins equip`.'));
      return;
    }
    const owned = await getOwnedSkins(gid, uid);
    if (owned.has(id)) {
      await interaction.reply(eph('Masz już tę skórkę — użyj `/skins equip`.'));
      return;
    }
    // Atomowy debet (skins bez withLock) — overwrite saldem dopuszczał double-spend i kasował
    // równoległy credit innego usera. ensureUser materializuje „dziewicze" konto przed debetem.
    await ensureUser(gid, uid, interaction.user.username);
    const newWallet = await spendWallet(gid, uid, skin.price);
    if (newWallet === null) {
      await interaction.reply(eph(`Masz za mało (cena ${fmt(skin.price, cur)}).`));
      return;
    }
    await ownSkin(gid, uid, id);
    await interaction.reply(eph(`✅ Kupiono skórkę **${skin.name}**! Załóż ją: \`/skins equip\`.`));
    return;
  }

  // equip
  const owned = await getOwnedSkins(gid, uid);
  if (skin.price > 0 && !owned.has(id)) {
    await interaction.reply(
      eph(`Najpierw kup tę skórkę: \`/skins buy\` (${fmt(skin.price, cur)}).`),
    );
    return;
  }
  await equipSkin(gid, uid, id);
  await interaction.reply(
    eph(`🎨 Założono skórkę **${skin.name}**. Sprawdź \`/rank\` lub \`/profile\`.`),
  );
}
