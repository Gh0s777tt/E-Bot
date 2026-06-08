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
  options?: { name: string; description?: string; required?: boolean }[];
  type?: 'message' | 'random' | 'role' | 'help';
  randomLines?: string[];
  roleId?: string;
  cooldownSec?: number;
  category?: string;
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

// Cooldown per komenda+user (anty-spam). Czyszczenie starych wpisów co 30 min.
const cooldowns = new Map<string, number>();
setInterval(() => {
  const cut = Date.now() - 60 * 60_000;
  for (const [k, t] of cooldowns) if (t < cut) cooldowns.delete(k);
}, 30 * 60_000);

export async function handleCustomCommand(
  interaction: ChatInputCommandInteraction,
): Promise<boolean> {
  const cmd = load().find((c) => c.name === interaction.commandName);
  if (!cmd) return false;

  const cd = cmd.cooldownSec ?? 0;
  if (cd > 0) {
    const key = `${cmd.name}:${interaction.user.id}`;
    const now = Date.now();
    const remain = Math.ceil(((cooldowns.get(key) ?? 0) + cd * 1000 - now) / 1000);
    if (remain > 0) {
      await interaction.reply({
        content: `⏳ Poczekaj jeszcze ${remain}s przed ponownym użyciem **/${cmd.name}**.`,
        flags: MessageFlags.Ephemeral,
      });
      return true;
    }
    cooldowns.set(key, now);
  }

  const guild = interaction.guild;
  const vars: Record<string, string> = {
    '{user}': `<@${interaction.user.id}>`,
    '{username}': interaction.user.username,
    '{server}': guild?.name ?? '',
    '{guild}': guild?.name ?? '',
    '{memberCount}': String(guild?.memberCount ?? ''),
  };
  // wartości argumentów komendy → {nazwa_argumentu} w odpowiedzi
  for (const opt of cmd.options ?? []) {
    if (opt?.name) vars[`{${opt.name}}`] = interaction.options.getString(opt.name) ?? '';
  }

  const type = cmd.type ?? 'message';

  // Self-role: nadaj/zdejmij rolę wywołującemu
  if (type === 'role' && cmd.roleId && guild) {
    const member = await guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member) {
      await interaction.reply({
        content: 'Nie udało się pobrać profilu.',
        flags: MessageFlags.Ephemeral,
      });
      return true;
    }
    const has = member.roles.cache.has(cmd.roleId);
    try {
      if (has) await member.roles.remove(cmd.roleId);
      else await member.roles.add(cmd.roleId);
      await interaction.reply({
        content: has ? `➖ Zabrano rolę <@&${cmd.roleId}>` : `➕ Nadano rolę <@&${cmd.roleId}>`,
        flags: MessageFlags.Ephemeral,
        allowedMentions: { parse: [] },
      });
    } catch {
      await interaction.reply({
        content: '❌ Nie mogę zmienić tej roli (uprawnienia / hierarchia bota).',
        flags: MessageFlags.Ephemeral,
      });
    }
    return true;
  }

  // Lista komend (/pomoc) — dynamicznie z wszystkich komend custom
  if (type === 'help') {
    const groups = new Map<string, string[]>();
    for (const c of load()) {
      if (c.type === 'help') continue;
      const cat = (c.category || 'Ogólne').trim() || 'Ogólne';
      const arr = groups.get(cat) ?? [];
      arr.push(`**/${c.name}** — ${c.description || '—'}`);
      groups.set(cat, arr);
    }
    const fields = [...groups.entries()]
      .map(([name, lines]) => ({ name, value: lines.join('\n').slice(0, 1024) }))
      .slice(0, 25);
    const embed = {
      title: '📜 Dostępne komendy',
      color: 0xe50914,
      fields: fields.length ? fields : [{ name: 'Brak', value: 'Brak własnych komend.' }],
    };
    await interaction.reply(
      cmd.ephemeral ? { embeds: [embed], flags: MessageFlags.Ephemeral } : { embeds: [embed] },
    );
    return true;
  }

  // Losowa odpowiedź z listy
  if (type === 'random' && cmd.randomLines?.length) {
    const pick = cmd.randomLines[Math.floor(Math.random() * cmd.randomLines.length)] ?? '';
    let out = pick;
    for (const [k, v] of Object.entries(vars)) out = out.split(k).join(v);
    await interaction.reply(
      cmd.ephemeral
        ? { content: out.slice(0, 2000), flags: MessageFlags.Ephemeral }
        : { content: out.slice(0, 2000) },
    );
    return true;
  }

  const payload = buildRichMessage(cmd.response, vars);
  if (!payload.content && !payload.embeds.length) {
    await interaction.reply({ content: '(pusta odpowiedź)', flags: MessageFlags.Ephemeral });
    return true;
  }
  await interaction.reply(cmd.ephemeral ? { ...payload, flags: MessageFlags.Ephemeral } : payload);
  return true;
}
