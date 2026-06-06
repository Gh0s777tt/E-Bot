// Powitania + autorole (Faza 6) + baner-grafika (Faza 7/F2). Config z panelu ('welcome_config').
import { AttachmentBuilder, type Client, EmbedBuilder, Events, type GuildMember } from 'discord.js';
import { type CardStyle, renderWelcomeBanner } from './lib/cards.mts';
import { getSettings } from './lib/db.mts';

type WelcomeConfig = {
  enabled: boolean;
  channelId: string;
  message: string;
  autoroleId: string;
  cardEnabled?: boolean;
  card?: Partial<CardStyle>;
};
let cfg: WelcomeConfig = { enabled: false, channelId: '', message: '', autoroleId: '' };

function refresh(): void {
  const raw = getSettings()['welcome_config'];
  if (!raw) {
    cfg = { enabled: false, channelId: '', message: '', autoroleId: '' };
    return;
  }
  try {
    cfg = { ...cfg, ...(JSON.parse(raw) as Partial<WelcomeConfig>) };
  } catch {
    /* zostaw poprzedni */
  }
}

export function startWelcome(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);

  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    if (!cfg.enabled) return;
    try {
      if (cfg.autoroleId) await member.roles.add(cfg.autoroleId).catch(() => {});
      if (cfg.channelId && cfg.message) {
        const ch = await member.guild.channels.fetch(cfg.channelId).catch(() => null);
        if (ch?.isTextBased() && 'send' in ch) {
          const text = cfg.message.replaceAll('{user}', `<@${member.id}>`);
          const embed = new EmbedBuilder()
            .setColor(0xe50914)
            .setDescription(text)
            .setThumbnail(member.user.displayAvatarURL());

          // Baner-grafika (Faza 7/F2): gradient + czcionka z panelu
          if (cfg.cardEnabled) {
            try {
              const buf = await renderWelcomeBanner({
                username: member.user.username,
                avatarUrl: member.user.displayAvatarURL({ extension: 'png', size: 256 }),
                text:
                  cfg.message.replaceAll('{user}', member.user.username).slice(0, 50) || 'Witaj!',
                style: cfg.card,
              });
              embed.setImage('attachment://welcome.png');
              await ch
                .send({
                  content: `<@${member.id}>`,
                  embeds: [embed],
                  files: [new AttachmentBuilder(buf, { name: 'welcome.png' })],
                })
                .catch(() => {});
              return;
            } catch (e) {
              console.warn('[welcome] baner:', (e as Error).message);
            }
          }
          await ch.send({ content: `<@${member.id}>`, embeds: [embed] }).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('[welcome]', (e as Error).message);
    }
  });

  console.log('[welcome] aktywny (powitania + autorole; config z panelu).');
}
