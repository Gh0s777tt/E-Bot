// M6b cz.2 — akcje pluginów z efektem w Discordzie (bot-tokenem), SCOPED do guild_id + per-akcja
// authz. Zero zaufania do pluginu:
//  • sendMessage → kanał MUSI należeć do gildii,
//  • addRole → rola MUSI należeć do gildii, NIE być `managed`, i NIE nieść groźnych uprawnień
//    (admin/zarządzanie/ban/kick) — plugin nigdy nie nada uprzywilejowanej roli (anty-eskalacja).
//    Hierarchię (rola poniżej bota) egzekwuje dodatkowo Discord przy PUT.
const API = 'https://discord.com/api/v10';

// Bitfield groźnych uprawnień — rola z którymkolwiek z nich jest NIEDOZWOLONA do nadania przez plugin.
const DANGEROUS_PERMS =
  0x8n | // Administrator
  0x20n | // ManageGuild
  0x10000000n | // ManageRoles
  0x4n | // BanMembers
  0x2n | // KickMembers
  0x10n | // ManageChannels
  0x20000000n | // ManageWebhooks
  0x2000n; // ManageMessages

async function botFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return null;
  try {
    const r = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
    if (!r.ok) return null;
    const txt = await r.text();
    return txt ? (JSON.parse(txt) as T) : ({} as T);
  } catch {
    return null;
  }
}

// Czy kanał należy do gildii (authz dla sendMessage).
export async function channelInGuild(guildId: string, channelId: string): Promise<boolean> {
  const channels = await botFetch<{ id: string }[]>(`/guilds/${guildId}/channels`);
  return !!channels?.some((c) => c.id === channelId);
}

// Czy rola jest BEZPIECZNA do nadania przez plugin: należy do gildii, nie jest `managed`, NIE niesie
// groźnych uprawnień.
export async function safeAssignableRole(guildId: string, roleId: string): Promise<boolean> {
  const roles = await botFetch<{ id: string; managed?: boolean; permissions: string }[]>(
    `/guilds/${guildId}/roles`,
  );
  const role = roles?.find((r) => r.id === roleId);
  if (!role || role.managed) return false;
  try {
    return (BigInt(role.permissions) & DANGEROUS_PERMS) === 0n;
  } catch {
    return false;
  }
}

// Wyślij wiadomość na kanał gildii (po weryfikacji przynależności kanału).
export async function sendGuildMessage(
  guildId: string,
  channelId: string,
  content: string,
): Promise<boolean> {
  if (!content || !(await channelInGuild(guildId, channelId))) return false;
  const res = await botFetch(`/channels/${channelId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content: content.slice(0, 2000) }),
  });
  return res !== null;
}

// Nadaj rolę użytkownikowi (po weryfikacji bezpieczeństwa roli).
export async function addGuildRole(
  guildId: string,
  userId: string,
  roleId: string,
): Promise<boolean> {
  if (!(await safeAssignableRole(guildId, roleId))) return false;
  const res = await botFetch(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
    method: 'PUT',
  });
  return res !== null;
}
