// Tor K / Faza 8 — aplikacje 2.0: WIELE aplikacji, każda z własnymi pytaniami/kanałem/rolą/przyciskiem.
// /applypanel publikuje panel (embed z Message Studio) + przycisk per aplikacja → modal → embed na
// kanał recenzji z Akceptuj/Odrzuć → rola + DM. Config 'applications_config'. Wstecznie zgodne.
import {
  ActionRowBuilder,
  type APIEmbed,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  ModalBuilder,
  type ModalSubmitInteraction,
  PermissionFlagsBits,
  type TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';
import { buildRichMessage, hasRich, type RichMessage } from '../lib/richMessage.mts';

export type Application = {
  id: string;
  label: string;
  emoji: string;
  style: 'primary' | 'secondary' | 'success' | 'danger';
  reviewChannelId: string;
  acceptRoleId: string;
  questions: string[];
};

type Cfg = {
  on: boolean;
  reviewChannelId: string;
  roleId: string;
  questions: string[];
  panelMessage: string;
  panelSpec?: RichMessage;
  applications: Application[];
};

const DEFAULT_QS = ['Dlaczego chcesz dołączyć?', 'Co możesz wnieść?'];

// Etap K — config per-serwer: świeży odczyt (low-freq: klik/komenda), fallback global.
function cfg(guildId: string): Cfg {
  const raw = getGuildSettings(guildId).applications_config;
  try {
    const c = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    return {
      on: !!c.enabled,
      reviewChannelId: String(c.reviewChannelId || ''),
      roleId: String(c.roleId || ''),
      questions: Array.isArray(c.questions)
        ? (c.questions as string[]).filter(Boolean).slice(0, 5)
        : [],
      panelMessage: String(c.panelMessage || '📋 Aplikuj do ekipy — kliknij poniżej.'),
      panelSpec: (c.panelSpec as RichMessage) || undefined,
      applications: Array.isArray(c.applications) ? (c.applications as Application[]) : [],
    };
  } catch {
    return {
      on: false,
      reviewChannelId: '',
      roleId: '',
      questions: [],
      panelMessage: '',
      applications: [],
    };
  }
}

// Lista aplikacji — z configu (2.0) lub jedna domyślna z pól legacy.
export function resolveApps(guildId: string): Application[] {
  const c = cfg(guildId);
  if (c.applications.length) {
    return c.applications.map((a) => ({
      id: a.id,
      label: a.label || 'Aplikuj',
      emoji: a.emoji || '',
      style: a.style || 'primary',
      reviewChannelId: a.reviewChannelId || c.reviewChannelId,
      acceptRoleId: a.acceptRoleId || c.roleId,
      questions: (Array.isArray(a.questions) ? a.questions : []).filter(Boolean).slice(0, 5),
    }));
  }
  return [
    {
      id: 'default',
      label: 'Aplikuj',
      emoji: '📋',
      style: 'primary',
      reviewChannelId: c.reviewChannelId,
      acceptRoleId: c.roleId,
      questions: c.questions.length ? c.questions : DEFAULT_QS,
    },
  ];
}

function findApp(id: string, guildId: string): Application | undefined {
  const apps = resolveApps(guildId);
  if (!id || id === 'default') return apps[0];
  return apps.find((a) => a.id === id) ?? apps[0];
}

export function applyEnabled(guildId: string): boolean {
  return cfg(guildId).on && resolveApps(guildId).some((a) => a.reviewChannelId);
}

// Panel: treść/embed (Message Studio lub legacy) — przyciski dokłada /applypanel.
export function buildApplyPanel(guildId: string): { content?: string; embeds: APIEmbed[] } {
  const c = cfg(guildId);
  if (c.panelSpec && hasRich(c.panelSpec)) return buildRichMessage(c.panelSpec, {});
  return { content: c.panelMessage || '📋 Aplikuj do ekipy — kliknij poniżej.', embeds: [] };
}

function questionsModal(app: Application, customId: string): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId(customId)
    .setTitle(`Aplikacja: ${app.label}`.slice(0, 45));
  const qs = app.questions.length ? app.questions : DEFAULT_QS;
  qs.slice(0, 5).forEach((q, i) => {
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(`q${i}`)
          .setLabel(q.slice(0, 45))
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(500),
      ),
    );
  });
  return modal;
}

export async function handleApplicationButton(interaction: ButtonInteraction): Promise<void> {
  const id = interaction.customId;
  const guildId = interaction.guildId ?? '';

  if (id === 'app:start' || id.startsWith('app:start:')) {
    if (!applyEnabled(guildId)) {
      await interaction.reply({
        content: '📋 Aplikacje są wyłączone.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const appId = id.startsWith('app:start:') ? id.slice('app:start:'.length) : 'default';
    const app = findApp(appId, guildId);
    if (!app) {
      await interaction.reply({
        content: '📋 Nie znaleziono aplikacji.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    await interaction.showModal(questionsModal(app, `app:submit:${app.id}`));
    return;
  }

  if (id.startsWith('app:accept:') || id.startsWith('app:deny:')) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({
        content: '⛔ Tylko obsługa może rozpatrywać aplikacje.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const accept = id.startsWith('app:accept:');
    const parts = id.split(':');
    // app:accept:<appId>:<uid> (4 części) lub legacy app:accept:<uid> (3 części)
    const appId = parts.length >= 4 ? (parts[2] ?? '') : '';
    const uid = parts.length >= 4 ? (parts[3] ?? '') : (parts[2] ?? '');
    const roleId = findApp(appId, guildId)?.acceptRoleId || cfg(guildId).roleId;
    if (accept && roleId && interaction.guild && uid) {
      const m = await interaction.guild.members.fetch(uid).catch(() => null);
      if (m) await m.roles.add(roleId).catch(() => {});
    }
    const user = uid ? await interaction.client.users.fetch(uid).catch(() => null) : null;
    if (user) {
      await user
        .send(
          accept
            ? `✅ Twoja aplikacja na **${interaction.guild?.name}** została zaakceptowana!`
            : `❌ Twoja aplikacja na **${interaction.guild?.name}** została odrzucona.`,
        )
        .catch(() => {});
    }
    const old = interaction.message.embeds[0];
    const embed = (old ? EmbedBuilder.from(old) : new EmbedBuilder())
      .setColor(accept ? 0x22c55e : 0x6b7280)
      .setFooter({
        text: `${accept ? '✅ Zaakceptowano' : '❌ Odrzucono'} przez ${interaction.user.username}`,
      });
    await interaction.update({ embeds: [embed], components: [] });
  }
}

export async function handleApplicationModal(interaction: ModalSubmitInteraction): Promise<void> {
  if (!interaction.customId.startsWith('app:submit')) return;
  const guildId = interaction.guildId ?? '';
  if (!applyEnabled(guildId) || !interaction.guild) {
    await interaction.reply({
      content: '📋 Aplikacje są wyłączone.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const appId = interaction.customId.startsWith('app:submit:')
    ? interaction.customId.slice('app:submit:'.length)
    : 'default';
  const app = findApp(appId, guildId);
  if (!app?.reviewChannelId) {
    await interaction.reply({
      content: '📋 Aplikacja niedostępna.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const qs = (app.questions.length ? app.questions : DEFAULT_QS).slice(0, 5);
  const fields = qs.map((q, i) => ({
    name: q.slice(0, 256),
    value: (interaction.fields.getTextInputValue(`q${i}`) || '—').slice(0, 1024),
  }));
  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle(`📋 Nowa aplikacja: ${app.label}`.slice(0, 256))
    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
    .addFields(fields)
    .setFooter({ text: `ID: ${interaction.user.id}` })
    .setTimestamp(new Date());
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`app:accept:${app.id}:${interaction.user.id}`)
      .setLabel('Akceptuj')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`app:deny:${app.id}:${interaction.user.id}`)
      .setLabel('Odrzuć')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Danger),
  );
  const ch = await interaction.guild.channels.fetch(app.reviewChannelId).catch(() => null);
  if (ch?.isTextBased() && 'send' in ch) {
    await (ch as TextChannel).send({ embeds: [embed], components: [row] }).catch(() => {});
  }
  await interaction.reply({
    content: '✅ Aplikacja wysłana! Czekaj na decyzję obsługi.',
    flags: MessageFlags.Ephemeral,
  });
}
