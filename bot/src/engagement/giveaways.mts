// Faza 6 / B5 + Tor G — poller giveawayów: kończy zaległe, losuje WAŻONYCH zwycięzców (bonus-losy).
// Wejście sprawdza wymagania (rola/poziom/zaproszenia). Kolumny req/bonus + weight są opcjonalne
// (select=* + fallback upsert) → brak regresji, jeśli ALTER jeszcze nie odpalony.

import { type ButtonInteraction, type Client, MessageFlags, type TextChannel } from 'discord.js';
import { ecoConfig, getUser as getEcoUser, saveUser as saveEcoUser } from '../economy/store.mts';
import { logTx } from '../economy/txlog.mts';
import { levelForXp } from '../leveling.mts';
import { cloudSelect, cloudUpdate, cloudUpsert, hasCloud } from '../lib/cloud.mts';
import { getSettings, setSetting } from '../lib/db.mts';
import { log } from '../lib/log.mts';

type Gw = {
  id: string;
  guild_id?: string | null;
  channel_id: string;
  prize: string;
  winners: number;
  ended?: boolean;
  req_role_id?: string | null;
  req_level?: number | null;
  req_invites?: number | null;
  bonus_role_id?: string | null;
  bonus_weight?: number | null;
};
type Entry = { user_id: string; weight?: number };

const eph = (content: string) => ({ content, flags: MessageFlags.Ephemeral as const });

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function weightedPick(entries: Entry[], n: number): string[] {
  const pool: string[] = [];
  for (const e of entries) {
    const w = Math.max(1, Math.min(10, e.weight ?? 1));
    for (let i = 0; i < w; i++) pool.push(e.user_id);
  }
  const winners: string[] = [];
  for (const u of shuffle(pool)) {
    if (!winners.includes(u)) winners.push(u);
    if (winners.length >= n) break;
  }
  return winners;
}

export async function handleGiveawayEntry(
  interaction: ButtonInteraction,
  gid: string,
): Promise<void> {
  if (!hasCloud() || !interaction.guild) {
    await interaction.reply(eph('❌ Chmura niedostępna.'));
    return;
  }
  const rows = await cloudSelect<Gw>('giveaways', `select=*&id=eq.${gid}`).catch(() => [] as Gw[]);
  const g = rows[0];
  if (!g || g.ended) {
    await interaction.reply(eph('⌛ Ten giveaway już się zakończył.'));
    return;
  }
  const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
  if (!member) {
    await interaction.reply(eph('❌ Nie znaleziono członka.'));
    return;
  }
  if (g.req_role_id && !member.roles.cache.has(g.req_role_id)) {
    await interaction.reply(eph(`⛔ Wymagana rola <@&${g.req_role_id}>.`));
    return;
  }
  if (g.req_level && g.req_level > 0) {
    const lv = await cloudSelect<{ xp: number }>(
      'user_levels',
      `select=xp&guild_id=eq.${interaction.guildId}&user_id=eq.${interaction.user.id}`,
    ).catch(() => [] as { xp: number }[]);
    const level = levelForXp(lv[0]?.xp ?? 0);
    if (level < g.req_level) {
      await interaction.reply(eph(`⛔ Wymagany poziom ${g.req_level} (masz ${level}).`));
      return;
    }
  }
  if (g.req_invites && g.req_invites > 0) {
    const inv = await cloudSelect<{ invited_id: string }>(
      'invites',
      `select=invited_id&guild_id=eq.${interaction.guildId}&inviter_id=eq.${interaction.user.id}&fake=eq.false&has_left=eq.false`,
    ).catch(() => [] as { invited_id: string }[]);
    if (inv.length < g.req_invites) {
      await interaction.reply(eph(`⛔ Wymagane ${g.req_invites} zaproszeń (masz ${inv.length}).`));
      return;
    }
  }
  const weight =
    g.bonus_role_id && member.roles.cache.has(g.bonus_role_id)
      ? Math.max(1, g.bonus_weight ?? 1)
      : 1;
  try {
    await cloudUpsert(
      'giveaway_entries',
      [{ giveaway_id: gid, user_id: interaction.user.id, weight }],
      'giveaway_id,user_id',
    );
  } catch {
    await cloudUpsert(
      'giveaway_entries',
      [{ giveaway_id: gid, user_id: interaction.user.id }],
      'giveaway_id,user_id',
    ).catch(() => {});
  }
  await interaction.reply(
    eph(`🎉 Bierzesz udział!${weight > 1 ? ` (×${weight} losów za bonus-rolę)` : ''} Powodzenia.`),
  );
}

async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  const due = await cloudSelect<Gw>(
    'giveaways',
    `select=id,guild_id,channel_id,prize,winners&ended=eq.false&ends_at=lte.${new Date().toISOString()}&limit=10`,
  );
  for (const g of due) {
    await cloudUpdate('giveaways', `id=eq.${g.id}`, { ended: true }).catch(() => {});
    const entries = await cloudSelect<Entry>(
      'giveaway_entries',
      `select=*&giveaway_id=eq.${g.id}`,
    ).catch(() => [] as Entry[]);
    const ch = await client.channels.fetch(g.channel_id).catch(() => null);
    if (!ch?.isTextBased() || !('send' in ch)) continue;
    if (!entries.length) {
      await (ch as TextChannel)
        .send(`🎉 Giveaway **${g.prize}** zakończony — brak uczestników. 😢`)
        .catch(() => {});
      continue;
    }
    const winners = weightedPick(entries, Math.min(g.winners, entries.length));
    await (ch as TextChannel)
      .send(
        `🎉 Giveaway **${g.prize}** zakończony!\nGratulacje: ${winners.map((w) => `<@${w}>`).join(', ')}`,
      )
      .catch(() => {});
    await awardReward(client, g.id, g.guild_id ?? '', winners, ch as TextChannel).catch((e) =>
      log.warn('[giveaway] reward:', { err: e }),
    );
  }
}

// Wypłata bonusu $/XP zwycięzcom (klucz settings 'gwreward:<id>' ustawiony przez /giveaway start).
// Most do ekonomii/levelingu — ten sam mechanizm co akcje custom-commands. Bez zmian schematu Supabase.
async function awardReward(
  client: Client,
  giveawayId: string,
  guildId: string,
  winners: string[],
  ch: TextChannel,
): Promise<void> {
  if (!guildId || !winners.length) return;
  const raw = getSettings()[`gwreward:${giveawayId}`];
  if (!raw) return;
  let reward: { kind?: string; amount?: number };
  try {
    reward = JSON.parse(raw) as { kind?: string; amount?: number };
  } catch {
    return;
  }
  const amount = Math.floor(reward.amount ?? 0);
  if (amount <= 0) return;

  if (reward.kind === 'money') {
    if (!ecoConfig(guildId).enabled) return;
    for (const uid of winners) {
      const u = await getEcoUser(guildId, uid);
      const user = await client.users.fetch(uid).catch(() => null);
      await saveEcoUser({
        guild_id: guildId,
        user_id: uid,
        username: user?.username ?? uid,
        wallet: u.wallet + amount,
      });
      logTx(guildId, uid, amount, 'giveaway');
    }
    await ch.send(`💰 Każdy zwycięzca otrzymał **${amount}** monet!`).catch(() => {});
  } else if (reward.kind === 'xp') {
    for (const uid of winners) {
      const rows = await cloudSelect<{ xp: number }>(
        'user_levels',
        `select=xp&guild_id=eq.${guildId}&user_id=eq.${uid}`,
      ).catch(() => [] as { xp: number }[]);
      const newXp = (rows[0]?.xp ?? 0) + amount;
      const user = await client.users.fetch(uid).catch(() => null);
      await cloudUpsert(
        'user_levels',
        [
          {
            guild_id: guildId,
            user_id: uid,
            username: user?.username ?? uid,
            xp: newXp,
            level: levelForXp(newXp),
          },
        ],
        'guild_id,user_id',
      ).catch(() => {});
    }
    await ch.send(`⭐ Każdy zwycięzca otrzymał **${amount}** XP!`).catch(() => {});
  }
  setSetting(`gwreward:${giveawayId}`, ''); // sprzątanie klucza po wypłacie
}

export function startGiveaways(client: Client): void {
  if (!hasCloud()) {
    log.info('[giveaway] brak chmury — giveawaye wyłączone.');
    return;
  }
  log.info('[giveaway] giveawaye aktywne (poll 30s).');
  setInterval(() => void tick(client).catch((e) => log.warn('[giveaway]', { err: e })), 30_000);
}
