// Pełna lista dostępu do panelu: właściciele (env DASHBOARD_OWNER_IDS, zawsze admin) + staff
// (settings 'panel_staff'). Rozwiązuje nazwy/avatary z Discord ID przez bot token (graceful —
// brak tokenu/błąd → pokazujemy samo ID). Tylko po stronie serwera.
import { cache } from 'react';
import { authConfig } from './auth';
import { getStaff } from './panelRoles';
import type { PanelRole } from './session';

export type AccessTier = 'owner' | PanelRole; // owner | admin | editor | viewer
export type AccessEntry = {
  uid: string;
  tier: AccessTier;
  label: string;
  source: 'owner' | 'staff';
  name: string; // rozwiązana nazwa Discord (fallback: ID)
  avatar: string | null;
};

type DiscordUser = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
};

const isSnowflake = (s: string): boolean => /^\d{15,25}$/.test(s);

// Memo profilu (uid → user) na 60 s — członkostwo czytamy zawsze świeżo, ale samych nazw/avatarów
// nie odpytujemy z Discord API przy każdym renderze.
const userMemo = new Map<string, { at: number; user: DiscordUser | null }>();

async function resolveUser(uid: string, token: string): Promise<DiscordUser | null> {
  const hit = userMemo.get(uid);
  if (hit && Date.now() - hit.at < 60_000) return hit.user;
  let user: DiscordUser | null = null;
  try {
    const r = await fetch(`https://discord.com/api/v10/users/${uid}`, {
      headers: { Authorization: `Bot ${token}` },
      cache: 'no-store',
    });
    if (r.ok) user = (await r.json()) as DiscordUser;
  } catch {
    /* sieć/API — zostaje null, pokażemy ID */
  }
  userMemo.set(uid, { at: Date.now(), user });
  return user;
}

function avatarUrl(u: DiscordUser): string | null {
  if (!u.avatar) return null;
  const ext = u.avatar.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}?size=64`;
}

const TIER_RANK: Record<AccessTier, number> = { owner: 0, admin: 1, editor: 2, viewer: 3 };

export const getPanelAccessList = cache(async (): Promise<AccessEntry[]> => {
  const owners = authConfig().owners;
  const staff = await getStaff();

  // Mapa po uid — właściciel ma pierwszeństwo (i tak jest adminem); staff-duplikat pomijamy.
  const byUid = new Map<string, AccessEntry>();
  for (const uid of owners) {
    if (uid && !byUid.has(uid)) {
      byUid.set(uid, { uid, tier: 'owner', label: '', source: 'owner', name: uid, avatar: null });
    }
  }
  for (const e of staff) {
    if (!e.uid || byUid.has(e.uid)) continue;
    byUid.set(e.uid, {
      uid: e.uid,
      tier: e.role,
      label: e.label || '',
      source: 'staff',
      name: e.uid,
      avatar: null,
    });
  }

  const entries = [...byUid.values()];
  const token = process.env.DISCORD_BOT_TOKEN;
  if (token) {
    await Promise.all(
      entries.map(async (e) => {
        if (!isSnowflake(e.uid)) return;
        const u = await resolveUser(e.uid, token);
        if (u) {
          e.name = u.global_name || u.username || e.uid;
          e.avatar = avatarUrl(u);
        }
      }),
    );
  }

  entries.sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier] || a.name.localeCompare(b.name));
  return entries;
});
