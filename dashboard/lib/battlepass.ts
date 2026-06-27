// Battle-pass: odczyt/zapis configu tier→rola (server-only — ciągnie data.ts). Stałe/typy współdzielone
// z klientem są w ./battlepassTiers. Config 'bp_roles' (po migracji = g:<gid>:bp_roles) — bot czyta go
// w /battlepass i synchronizuje role Discord do bieżącego tieru sezonu.
import type { TierRole } from './battlepassTiers';
import { getConfigSetting, setConfigSetting } from './data';

export type { TierRole } from './battlepassTiers';

export async function getBattlePassRoles(): Promise<TierRole[]> {
  const raw = await getConfigSetting('bp_roles');
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (x): x is TierRole =>
        typeof x === 'object' &&
        x !== null &&
        typeof (x as TierRole).tier === 'number' &&
        typeof (x as TierRole).roleId === 'string',
    );
  } catch {
    return [];
  }
}

export async function saveBattlePassRoles(roles: TierRole[]): Promise<void> {
  // Czyszczenie pustych (bez roli) — bot i tak pomija puste; trzymamy config minimalny.
  const clean = roles.filter((r) => r.roleId).map((r) => ({ tier: r.tier, roleId: r.roleId }));
  await setConfigSetting('bp_roles', JSON.stringify(clean));
}
