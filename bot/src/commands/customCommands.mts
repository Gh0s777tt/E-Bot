// No-code komendy slash — definicje rejestruje panel w Discord (POST upsert), a bot obsługuje
// ich wywołania tutaj: czyta settings 'custom_commands' (sync przez bridge/realtime) i odpowiada
// zbudowanym RichMessage. Zwraca true, jeśli komenda była customowa (obsłużona).
// CC 2.0 (Etap H): warunek requiredRoleId + akcje (addRole/removeRole/giveMoney/giveXp).

import { type ChatInputCommandInteraction, type GuildMember, MessageFlags } from 'discord.js';
import { creditWallet, ecoConfig, ensureUser } from '../economy/store.mts';
import { logTx } from '../economy/txlog.mts';
import { levelForXp } from '../leveling.mts';
import { cloudSelect, cloudUpsert, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { buildRichMessage, type RichMessage } from '../lib/richMessage.mts';

type CustomAction = {
  kind: 'addRole' | 'removeRole' | 'giveMoney' | 'giveXp';
  roleId?: string;
  amount?: number;
};

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
  requiredRoleId?: string; // CC 2.0 — warunek: komenda tylko dla posiadaczy roli
  actions?: CustomAction[]; // CC 2.0 — akcje wykonywane przy użyciu (max 3)
};

// Etap K — definicje per-serwer: panel rejestruje komendy per-guild i zapisuje pod g:<id>:custom_commands.
function load(guildId: string): CustomCommand[] {
  const raw = getGuildSettings(guildId).custom_commands;
  try {
    const a = raw ? (JSON.parse(raw) as CustomCommand[]) : [];
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

// Twardy limit anty-nadużycie: pojedyncza akcja no-code nie może zmintować absurdalnej kwoty
// waluty/XP (autor komendy z panelu może pominąć `requiredRoleId` → wtedy każdy członek). Clamp
// ogranicza szkodę do rozsądnego pułapu na użycie (rygiel #532).
const MAX_ACTION_AMOUNT = 1_000_000;

// CC 2.0 — akcje przy użyciu komendy (rola/kasa/XP). Błędy pojedynczych akcji nie blokują reszty.
async function runActions(
  interaction: ChatInputCommandInteraction,
  member: GuildMember | null,
  actions: CustomAction[],
): Promise<void> {
  const gid = interaction.guildId;
  if (!gid) return;
  for (const a of actions.slice(0, 3)) {
    try {
      if ((a.kind === 'addRole' || a.kind === 'removeRole') && a.roleId && member) {
        if (a.kind === 'addRole') await member.roles.add(a.roleId);
        else await member.roles.remove(a.roleId);
      } else if (a.kind === 'giveMoney' && ecoConfig(gid).enabled && hasCloud()) {
        const amt = Math.max(0, Math.min(Math.floor(Number(a.amount) || 0), MAX_ACTION_AMOUNT));
        if (amt <= 0) continue;
        // Atomowy credit (RPC economy_credit) zamiast overwrite getUser+saveUser (#3): dawny wzorzec
        // kasował równoległy pay/rob/daily na to samo konto (lost update). Spójne z market/stocks.
        await ensureUser(gid, interaction.user.id, interaction.user.username);
        await creditWallet(gid, interaction.user.id, interaction.user.username, amt);
        logTx(gid, interaction.user.id, amt, `cmd:/${interaction.commandName}`);
      } else if (a.kind === 'giveXp' && hasCloud()) {
        // Uwaga: XP to wciąż read-modify-write (jak cały leveling — brak atomowego RPC dla xp).
        // Skutek zbiegu = utrata części XP graczowi, nie nadmiar — nie exploit; do domknięcia z #5.
        const amt = Math.max(0, Math.min(Math.floor(Number(a.amount) || 0), MAX_ACTION_AMOUNT));
        if (amt <= 0) continue;
        const rows = await cloudSelect<{ xp: number }>(
          'user_levels',
          `select=xp&guild_id=eq.${gid}&user_id=eq.${interaction.user.id}`,
        );
        const newXp = (rows[0]?.xp ?? 0) + amt;
        await cloudUpsert(
          'user_levels',
          [
            {
              guild_id: gid,
              user_id: interaction.user.id,
              username: interaction.user.username,
              xp: newXp,
              level: levelForXp(newXp),
            },
          ],
          'guild_id,user_id',
        );
      }
    } catch (e) {
      log.warn('[custom-cmd] akcja:', { err: e });
    }
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
  const guildId = interaction.guildId ?? '';
  const cmd = load(guildId).find((c) => c.name === interaction.commandName);
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

  // CC 2.0 — warunek roli + akcje (member pobierany raz, reużywany).
  const member = guild ? await guild.members.fetch(interaction.user.id).catch(() => null) : null;
  if (cmd.requiredRoleId) {
    if (!member?.roles.cache.has(cmd.requiredRoleId)) {
      await interaction.reply({
        content: `⛔ Ta komenda wymaga roli <@&${cmd.requiredRoleId}>.`,
        flags: MessageFlags.Ephemeral,
        allowedMentions: { parse: [] },
      });
      return true;
    }
  }
  if (cmd.actions?.length) await runActions(interaction, member, cmd.actions);

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
    for (const c of load(guildId)) {
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
