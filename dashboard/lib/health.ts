// Pulpit 2.0 — health-score serwera liczony po stronie panelu (Discord REST, token bota).
// Lustro bota /healthcheck: 5 czynników punktowanych + 2 informacyjne.
import { getPrimaryGuildId } from './guild';

export type HealthCheck = { name: string; ok: boolean; scored: boolean; detail?: string };
export type ServerHealth = { score: number; checks: HealthCheck[] };

const VERIF = ['Brak', 'Niski', 'Średni', 'Wysoki', 'Najwyższy'];

// Uprawnienia, których @everyone mieć nie powinien (bity jak w bocie).
const DANGEROUS: [bigint, string][] = [
  [1n << 3n, 'Administrator'],
  [1n << 5n, 'Zarządzanie serwerem'],
  [1n << 28n, 'Zarządzanie rolami'],
  [1n << 4n, 'Zarządzanie kanałami'],
  [1n << 1n, 'Wyrzucanie'],
  [1n << 2n, 'Banowanie'],
  [1n << 29n, 'Zarządzanie webhookami'],
  [1n << 17n, 'Wzmianka @everyone'],
];

type RestGuild = {
  verification_level: number;
  explicit_content_filter: number;
  mfa_level: number;
  default_message_notifications: number;
  rules_channel_id: string | null;
  features: string[];
};
type RestRole = { id: string; permissions: string };

async function dget<T>(path: string): Promise<T | null> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return null;
  const r = await fetch(`https://discord.com/api/v10${path}`, {
    headers: { Authorization: `Bot ${token}` },
    next: { revalidate: 60 },
  }).catch(() => null);
  if (!r?.ok) return null;
  return (await r.json()) as T;
}

export async function getServerHealth(): Promise<ServerHealth | null> {
  const guildId = await getPrimaryGuildId();
  if (!guildId) return null;
  const [guild, roles] = await Promise.all([
    dget<RestGuild>(`/guilds/${guildId}`),
    dget<RestRole[]>(`/guilds/${guildId}/roles`),
  ]);
  if (!guild) return null;

  const checks: HealthCheck[] = [];

  const vOk = guild.verification_level >= 2;
  checks.push({
    name: 'Poziom weryfikacji',
    ok: vOk,
    scored: true,
    detail: VERIF[guild.verification_level] ?? '?',
  });

  const cOk = guild.explicit_content_filter !== 0;
  checks.push({ name: 'Filtr treści (media)', ok: cOk, scored: true, detail: cOk ? 'ON' : 'OFF' });

  const everyone = (roles ?? []).find((r) => r.id === guildId);
  const perms = BigInt(everyone?.permissions ?? '0');
  const danger = DANGEROUS.filter(([bit]) => (perms & bit) === bit).map(([, n]) => n);
  checks.push({
    name: 'Uprawnienia @everyone',
    ok: danger.length === 0,
    scored: true,
    detail: danger.length ? danger.join(', ') : undefined,
  });

  const mOk = guild.mfa_level === 1;
  checks.push({ name: '2FA dla moderacji', ok: mOk, scored: true, detail: mOk ? 'ON' : 'OFF' });

  const nOk = guild.default_message_notifications === 1;
  checks.push({
    name: 'Domyślne powiadomienia',
    ok: nOk,
    scored: true,
    detail: nOk ? 'tylko wzmianki' : 'wszystkie',
  });

  checks.push({ name: 'Kanał zasad', ok: Boolean(guild.rules_channel_id), scored: false });
  checks.push({
    name: 'Tryb społeczności',
    ok: guild.features.includes('COMMUNITY'),
    scored: false,
  });

  const scored = checks.filter((c) => c.scored);
  const score = Math.round((scored.filter((c) => c.ok).length / scored.length) * 100);
  return { score, checks };
}
