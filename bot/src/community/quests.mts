// Tor A2 — questy dzienne/tygodniowe + punkty sezonu (battle-pass lite).
// Postęp liczony W PAMIĘCI (zero zapisów per-wiadomość); nagrody odbierane przyciskiem w /quests
// i UTRWALANE w 'quest_claims' (brak podwójnej wypłaty). Punkty sezonu w 'season_points'.
// Uwaga: restart bota zeruje bieżący postęp (limit MVP), ale odebrane nagrody zostają.

import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  type Client,
  EmbedBuilder,
  Events,
  type Message,
  MessageFlags,
} from 'discord.js';
import { getUser, saveUser } from '../economy/store.mts';
import { cloudInsert, cloudSelect, cloudUpsert, hasCloud } from '../lib/cloud.mts';
import { log } from '../lib/log.mts';
import { weekKey as weekKeyUtc } from '../lib/weekKey.mts';

export type QuestMetric = 'messages' | 'work' | 'games' | 'gamesWon' | 'invites';
type Period = 'daily' | 'weekly';
type Quest = {
  id: string;
  period: Period;
  metric: QuestMetric;
  target: number;
  reward: number;
  points: number;
  label: string;
};

export const QUESTS: Quest[] = [
  {
    id: 'd_msg',
    period: 'daily',
    metric: 'messages',
    target: 25,
    reward: 200,
    points: 10,
    label: 'Napisz 25 wiadomości',
  },
  {
    id: 'd_work',
    period: 'daily',
    metric: 'work',
    target: 1,
    reward: 150,
    points: 5,
    label: 'Popracuj (/eco work)',
  },
  {
    id: 'd_game',
    period: 'daily',
    metric: 'games',
    target: 3,
    reward: 250,
    points: 10,
    label: 'Zagraj 3× w grę losową',
  },
  {
    id: 'w_msg',
    period: 'weekly',
    metric: 'messages',
    target: 300,
    reward: 1500,
    points: 50,
    label: 'Napisz 300 wiadomości',
  },
  {
    id: 'w_win',
    period: 'weekly',
    metric: 'gamesWon',
    target: 15,
    reward: 2000,
    points: 60,
    label: 'Wygraj 15× w grę losową',
  },
  {
    id: 'w_invite',
    period: 'weekly',
    metric: 'invites',
    target: 1,
    reward: 1000,
    points: 40,
    label: 'Zaproś 1 osobę',
  },
];

const dayKey = (): string => new Date().toISOString().slice(0, 10);
const weekKey = (): string => weekKeyUtc(new Date()); // wspólny wzór tygodnia (lib/weekKey)
const seasonKey = (): string => new Date().toISOString().slice(0, 7); // YYYY-MM

type Counters = {
  day: string;
  week: string;
  daily: Record<QuestMetric, number>;
  weekly: Record<QuestMetric, number>;
};
const zero = (): Record<QuestMetric, number> => ({
  messages: 0,
  work: 0,
  games: 0,
  gamesWon: 0,
  invites: 0,
});
const mem = new Map<string, Counters>();

function counters(key: string): Counters {
  const d = dayKey();
  const w = weekKey();
  let c = mem.get(key);
  if (!c) {
    c = { day: d, week: w, daily: zero(), weekly: zero() };
    mem.set(key, c);
  }
  if (c.day !== d) {
    c.day = d;
    c.daily = zero();
  }
  if (c.week !== w) {
    c.week = w;
    c.weekly = zero();
  }
  return c;
}

// Wołane z eventów/komend — tanie (tylko pamięć), nie rzuca.
export function bumpQuest(guildId: string, userId: string, metric: QuestMetric, amount = 1): void {
  if (!guildId || !userId) return;
  const c = counters(`${guildId}:${userId}`);
  c.daily[metric] += amount;
  c.weekly[metric] += amount;
}

async function claimedSet(gid: string, uid: string): Promise<Set<string>> {
  if (!hasCloud()) return new Set();
  const rows = await cloudSelect<{ quest_id: string; period_key: string }>(
    'quest_claims',
    `select=quest_id,period_key&guild_id=eq.${gid}&user_id=eq.${uid}&period_key=in.(${dayKey()},${weekKey()})`,
  ).catch(() => [] as { quest_id: string; period_key: string }[]);
  return new Set(rows.map((r) => `${r.quest_id}|${r.period_key}`));
}

async function getSeasonPoints(gid: string, uid: string): Promise<number> {
  if (!hasCloud()) return 0;
  const rows = await cloudSelect<{ points: number }>(
    'season_points',
    `select=points&guild_id=eq.${gid}&user_id=eq.${uid}&season=eq.${seasonKey()}`,
  ).catch(() => [] as { points: number }[]);
  return rows[0]?.points ?? 0;
}

async function addSeasonPoints(gid: string, uid: string, delta: number): Promise<void> {
  if (!hasCloud() || !delta) return;
  const cur = await getSeasonPoints(gid, uid);
  await cloudUpsert(
    'season_points',
    [{ guild_id: gid, user_id: uid, season: seasonKey(), points: cur + delta }],
    'guild_id,user_id,season',
  ).catch(() => {});
}

// Pasek postępu questa (10 segmentów). KLAMRA `Math.min(1, …)`: postęp ≥ cel → pełny (nie >10
// segmentów ani `repeat(ujemne)` = RangeError). STRAŻNIK `t > 0`: cel 0 → pusty (bez `p/0`=Infinity/NaN).
export function bar(p: number, t: number): string {
  const filled = t > 0 ? Math.round(Math.min(1, p / t) * 10) : 0;
  return '▰'.repeat(filled) + '▱'.repeat(10 - filled);
}

const periodKeyOf = (q: Quest): string => (q.period === 'daily' ? dayKey() : weekKey());
const progOf = (c: Counters, q: Quest): number =>
  (q.period === 'daily' ? c.daily : c.weekly)[q.metric];

export async function buildQuestsView(
  gid: string,
  uid: string,
  username: string,
  flash = '',
): Promise<{ embeds: EmbedBuilder[]; components: ActionRowBuilder<ButtonBuilder>[] }> {
  const c = counters(`${gid}:${uid}`);
  const claimed = await claimedSet(gid, uid);
  let claimable = 0;

  const section = (period: Period): string =>
    QUESTS.filter((q) => q.period === period)
      .map((q) => {
        const prog = progOf(c, q);
        const isClaimed = claimed.has(`${q.id}|${periodKeyOf(q)}`);
        const done = prog >= q.target;
        if (done && !isClaimed) claimable++;
        const status = isClaimed
          ? '✅ odebrane'
          : done
            ? '🎁 do odbioru!'
            : `${bar(prog, q.target)} ${Math.min(prog, q.target)}/${q.target}`;
        return `**${q.label}** — +${q.reward} 🪙 / +${q.points} pkt\n${status}`;
      })
      .join('\n\n');

  const daily = section('daily');
  const weekly = section('weekly');
  const pts = await getSeasonPoints(gid, uid);

  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle(`🗺️ Questy — ${username}`)
    .addFields(
      { name: '📅 Dzienne', value: daily || '—' },
      { name: '🗓️ Tygodniowe', value: weekly || '—' },
    )
    .setFooter({ text: `🏵️ Punkty sezonu ${seasonKey()}: ${pts}` });
  if (flash) embed.setDescription(flash);

  const components =
    claimable > 0
      ? [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId('quest:claim')
              .setLabel(`Odbierz nagrody (${claimable})`)
              .setEmoji('🎁')
              .setStyle(ButtonStyle.Success),
          ),
        ]
      : [];
  return { embeds: [embed], components };
}

export async function handleQuestButton(interaction: ButtonInteraction): Promise<void> {
  if (interaction.customId !== 'quest:claim' || !interaction.guildId) return;
  const gid = interaction.guildId;
  const uid = interaction.user.id;
  const c = counters(`${gid}:${uid}`);
  const claimed = await claimedSet(gid, uid);
  const toClaim = QUESTS.filter(
    (q) => progOf(c, q) >= q.target && !claimed.has(`${q.id}|${periodKeyOf(q)}`),
  );
  if (!toClaim.length) {
    await interaction.reply({ content: '🎁 Nic do odebrania.', flags: MessageFlags.Ephemeral });
    return;
  }
  const reward = toClaim.reduce((a, q) => a + q.reward, 0);
  const points = toClaim.reduce((a, q) => a + q.points, 0);
  if (hasCloud()) {
    await cloudInsert(
      'quest_claims',
      toClaim.map((q) => ({
        guild_id: gid,
        user_id: uid,
        quest_id: q.id,
        period_key: periodKeyOf(q),
      })),
    ).catch(() => {});
    const u = await getUser(gid, uid);
    await saveUser({
      guild_id: gid,
      user_id: uid,
      username: interaction.user.username,
      wallet: u.wallet + reward,
    });
    await addSeasonPoints(gid, uid, points);
  }
  const view = await buildQuestsView(
    gid,
    uid,
    interaction.user.username,
    `🎉 Odebrano **+${reward}** 🪙 i **+${points}** pkt z ${toClaim.length} questów!`,
  );
  await interaction.update(view);
}

export function startQuests(client: Client): void {
  log.info('[quests] aktywne (postęp w pamięci, nagrody w /quests).');
  client.on(Events.MessageCreate, (m: Message) => {
    if (m.guild && !m.author.bot) bumpQuest(m.guild.id, m.author.id, 'messages', 1);
  });
}
