'use client';

import { useState } from 'react';
import { BP_TIERS, type TierRole } from '../lib/battlepassTiers';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { RoleSelect } from './pickers';
import SaveButton from './SaveButton';

// Edytor mapowania tier→rola battle-passa. Zapis do /api/battlepass (klucz bp_roles); bot synchronizuje
// role po stronie /battlepass. Puste tiery = bez roli (czyszczone przy zapisie).
export default function BattlePassRolesForm({
  initial,
  guild,
}: {
  initial: TierRole[];
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const initMap = new Map(initial.map((r) => [r.tier, r.roleId]));
  const [roles, setRoles] = useState<Record<number, string>>(
    Object.fromEntries(BP_TIERS.map((t) => [t.tier, initMap.get(t.tier) ?? ''])),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const payload = {
        roles: BP_TIERS.map((t) => ({ tier: t.tier, roleId: roles[t.tier] ?? '' })).filter(
          (r) => r.roleId,
        ),
      };
      const r = await fetch('/api/battlepass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSt(r.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  return (
    <div className="max-w-xl space-y-4">
      <p className="text-sm text-muted">{tp(lang, 'ui.bp.intro')}</p>
      <div className="space-y-2">
        {BP_TIERS.map((t) => (
          <div key={t.tier} className="flex items-center gap-3">
            <span className="w-44 shrink-0 text-sm">
              <span className="font-semibold text-accent">T{t.tier}</span>{' '}
              <span className="text-white/80">{t.title}</span>
            </span>
            <RoleSelect
              value={roles[t.tier] ?? ''}
              onChange={(v) => setRoles((m) => ({ ...m, [t.tier]: v }))}
              roles={guild.roles}
              placeholder={tp(lang, 'ui.bp.none')}
              className="flex-1"
            />
          </div>
        ))}
      </div>
      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">{tp(lang, 'ui.bp.footNote')}</p>
    </div>
  );
}
