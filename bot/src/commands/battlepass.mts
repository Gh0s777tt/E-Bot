// /battlepass — sezonowy (miesięczny) battle-pass: postęp tierów wg aktywności (wiadomości w bieżącym
// miesiącu z user_activity) + nagroda coins za nowo-odblokowane tiery (RAZ na sezon, dedup w ustawieniu;
// tylko gdy ekonomia włączona). Silniki battlePassTier / claimRewards czyste i testowalne.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { ecoConfig, fmt, getUser, saveUser } from '../economy/store.mts';
import { cloudGetSetting, cloudSelect, cloudSetSetting, hasCloud } from '../lib/cloud.mts';

export type Tier = { tier: number; need: number; title: string; reward: number };

// Drabina tierów (próg = wiadomości w miesiącu, reward = coins). Rosnące progi i nagrody; tytuły tematyczne.
export const TIERS: Tier[] = [
  { tier: 1, need: 10, title: '🌱 Rozgrzewka', reward: 50 },
  { tier: 2, need: 30, title: '🔥 Rozkręcasz się', reward: 100 },
  { tier: 3, need: 75, title: '⭐ Stały bywalec', reward: 200 },
  { tier: 4, need: 150, title: '💪 Aktywny', reward: 350 },
  { tier: 5, need: 300, title: '🚀 Napędowy', reward: 600 },
  { tier: 6, need: 600, title: '👑 Filar społeczności', reward: 1000 },
  { tier: 7, need: 1000, title: '🏆 Weteran sezonu', reward: 1750 },
  { tier: 8, need: 1500, title: '🌟 Legenda sezonu', reward: 3000 },
];

// Czysty silnik: dla XP (aktywności) i drabiny tierów zwraca aktualny tier, następny, % postępu do
// niego i odblokowane. Brak następnego = maksymalny tier (100%). Testowalny (battlepass.test.ts).
export function battlePassTier(
  xp: number,
  tiers: Tier[],
): { current: number; next: Tier | null; progressPct: number; unlocked: Tier[] } {
  const sorted = [...tiers].sort((a, b) => a.need - b.need);
  const unlocked = sorted.filter((t) => xp >= t.need);
  const last = unlocked[unlocked.length - 1];
  const next = sorted.find((t) => xp < t.need) ?? null;
  const base = last?.need ?? 0;
  const progressPct = next
    ? Math.min(100, Math.max(0, Math.round(((xp - base) / (next.need - base)) * 100)))
    : 100;
  return { current: last?.tier ?? 0, next, progressPct, unlocked };
}

// Czysta: ile coins przyznać za tiery odblokowane OD ostatniego odebrania (claimedTier) DO bieżącego.
// Idempotentne — drugie wywołanie z tym samym `current` daje 0 (current ≤ claimed). Zapobiega podwójnej
// wypłacie tej samej nagrody w sezonie.
export function claimRewards(
  currentTier: number,
  claimedTier: number,
  tiers: Tier[],
): { coins: number; newClaimed: number } {
  if (currentTier <= claimedTier) return { coins: 0, newClaimed: claimedTier };
  let coins = 0;
  for (const t of tiers) if (t.tier > claimedTier && t.tier <= currentTier) coins += t.reward;
  return { coins, newClaimed: currentTier };
}

// Opcjonalne nagrody-role za tiery (config per-serwer, mapowanie tier→rola z panelu).
export type TierRole = { tier: number; roleId: string };

// Parsuje config ról tierów z surowego ustawienia (JSON TierRole[]). Odporne na śmieci/zły typ → [].
export function parseTierRoles(raw: string | null | undefined): TierRole[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(
        (x): x is TierRole =>
          typeof x === 'object' &&
          x !== null &&
          typeof (x as TierRole).tier === 'number' &&
          typeof (x as TierRole).roleId === 'string',
      )
      .map((x) => ({ tier: x.tier, roleId: x.roleId }));
  } catch {
    return [];
  }
}

// Czysta synchronizacja ról tierów do BIEŻĄCEGO tieru: nadaj role za tiery ≤ current, których członek
// nie ma; zdejmij skonfigurowane role tierów > current, które ma (po resecie sezonu current=0 → zdejmie
// wszystkie). Idempotentne; zwraca rozłączne listy add/remove (roleId). Pusty roleId pomijany.
export function syncTierRoles(
  currentTier: number,
  tierRoles: TierRole[],
  memberRoleIds: Set<string>,
): { add: string[]; remove: string[] } {
  const add: string[] = [];
  const remove: string[] = [];
  for (const tr of tierRoles) {
    if (!tr.roleId) continue;
    const shouldHave = tr.tier <= currentTier;
    if (shouldHave && !memberRoleIds.has(tr.roleId)) add.push(tr.roleId);
    else if (!shouldHave && memberRoleIds.has(tr.roleId)) remove.push(tr.roleId);
  }
  return { add, remove };
}

function bar(pct: number): string {
  const filled = Math.round(pct / 10);
  return '▰'.repeat(filled) + '▱'.repeat(10 - filled);
}

export const data = new SlashCommandBuilder()
  .setName('battlepass')
  .setDescription('Twój sezonowy battle-pass — postęp tierów wg aktywności w tym miesiącu.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (!hasCloud()) {
    await interaction.reply({
      content: '❌ Battle-pass wymaga chmury (Supabase).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await interaction.deferReply();
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const rows = await cloudSelect<{ messages?: number }>(
    'user_activity',
    `select=messages&guild_id=eq.${interaction.guildId}&user_id=eq.${interaction.user.id}&day=gte.${month}-01`,
  ).catch(() => [] as { messages?: number }[]);
  const xp = rows.reduce((a, r) => a + (r.messages ?? 0), 0);
  const { current, next, progressPct, unlocked } = battlePassTier(xp, TIERS);
  const curTitle = unlocked[unlocked.length - 1]?.title ?? '— jeszcze nic (napisz coś!)';

  // Nagroda coins za nowo-odblokowane tiery — RAZ na sezon (dedup w ustawieniu per-miesiąc), tylko gdy
  // ekonomia włączona (inaczej battle-pass to czysty tracker postępu).
  let rewardLine = '';
  const eco = ecoConfig(interaction.guildId);
  if (eco.enabled && current > 0) {
    const claimsKey = `g:${interaction.guildId}:bp_claims:${month}`;
    let claims: Record<string, number> = {};
    try {
      claims = JSON.parse((await cloudGetSetting(claimsKey)) || '{}') as Record<string, number>;
    } catch {
      /* puste */
    }
    const { coins, newClaimed } = claimRewards(current, claims[interaction.user.id] ?? 0, TIERS);
    if (coins > 0) {
      const u = await getUser(interaction.guildId, interaction.user.id);
      await saveUser({
        guild_id: interaction.guildId,
        user_id: interaction.user.id,
        username: interaction.user.username,
        wallet: u.wallet + coins,
      }).catch(() => {});
      claims[interaction.user.id] = newClaimed;
      await cloudSetSetting(claimsKey, JSON.stringify(claims)).catch(() => {});
      rewardLine = `\n🎁 Odebrano **+${fmt(coins, eco.currency)}** za nowe tiery!`;
    }
  }

  // Role-nagrody za tiery (opcjonalne) — synchronizacja do bieżącego tieru (config `g:<gid>:bp_roles`
  // z panelu). Wymaga uprawnienia bota do zarządzania rolami; błędy łykane (jak w levelingu).
  let roleLine = '';
  const tierRoles = parseTierRoles(
    await cloudGetSetting(`g:${interaction.guildId}:bp_roles`).catch(() => null),
  );
  if (tierRoles.length) {
    const member = await interaction.guild?.members.fetch(interaction.user.id).catch(() => null);
    if (member) {
      const { add, remove } = syncTierRoles(current, tierRoles, new Set(member.roles.cache.keys()));
      for (const id of add) await member.roles.add(id).catch(() => {});
      for (const id of remove) await member.roles.remove(id).catch(() => {});
      if (add.length)
        roleLine = `\n🎭 Odblokowano role tierów: ${add.map((id) => `<@&${id}>`).join(' ')}`;
    }
  }

  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle(`🎟️ Battle-pass — sezon ${month}`)
    .setDescription(
      `**${interaction.user.username}** · ${xp.toLocaleString('pl-PL')} wiad. w tym miesiącu\n` +
        `Tier **${current}/${TIERS.length}** — ${curTitle}\n` +
        `${bar(progressPct)} ${progressPct}%\n` +
        (next
          ? `Do **Tier ${next.tier} (${next.title})**: jeszcze ${(next.need - xp).toLocaleString('pl-PL')} wiad.`
          : '🏆 Maksymalny tier sezonu osiągnięty!') +
        rewardLine +
        roleLine,
    )
    .setFooter({ text: 'Tiery dają coins (raz na sezon) i są kamieniami milowymi aktywności.' });
  await interaction.editReply({ embeds: [embed] });
}
