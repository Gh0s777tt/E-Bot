'use client';

import { useState } from 'react';
import type { VerificationConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { RoleSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function VerificationForm({
  initial,
  guild,
}: {
  initial: VerificationConfig;
  guild: GuildMeta;
}) {
  const [c, setC] = useState<VerificationConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      });
      setSt(r.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  return (
    <div className="max-w-xl space-y-4">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={c.enabled}
          onChange={(e) => setC({ ...c, enabled: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">Weryfikacja włączona</span>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Rola po weryfikacji</span>
        <RoleSelect
          value={c.roleId}
          onChange={(v) => setC({ ...c, roleId: v })}
          roles={guild.roles}
          placeholder="— wybierz rolę dostępu —"
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Treść panelu</span>
        <textarea
          value={c.message}
          onChange={(e) => setC({ ...c, message: e.target.value })}
          rows={3}
          className={inputCls}
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Etykieta przycisku</span>
        <input
          value={c.buttonLabel}
          onChange={(e) => setC({ ...c, buttonLabel: e.target.value })}
          maxLength={80}
          className={inputCls}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Tryb</span>
          <select
            value={c.mode}
            onChange={(e) => setC({ ...c, mode: e.target.value as VerificationConfig['mode'] })}
            className={inputCls}
          >
            <option value="button">Przycisk (1 klik)</option>
            <option value="captcha">Captcha obrazkowa</option>
            <option value="phrase">Hasło (pass-phrase)</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Min. wiek konta (dni, 0 = off)</span>
          <input
            type="number"
            value={c.minAccountAgeDays}
            onChange={(e) =>
              setC({
                ...c,
                minAccountAgeDays: Math.max(0, Math.floor(Number(e.target.value) || 0)),
              })
            }
            className={inputCls}
          />
        </label>
      </div>

      {c.mode === 'phrase' && (
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Hasło weryfikacyjne</span>
          <input
            value={c.phrase}
            onChange={(e) => setC({ ...c, phrase: e.target.value })}
            maxLength={100}
            placeholder="np. tajne-haslo-serwera"
            className={inputCls}
          />
          <span className="block text-xs text-muted">
            Użytkownik musi wpisać to hasło w okienku po kliknięciu przycisku (wielkość liter bez
            znaczenia). Podaj je np. w regulaminie.
          </span>
        </label>
      )}

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">
        Po zapisaniu wyślij panel komendą <code className="text-accent">/verifypanel</code> na
        wybranym kanale. Kliknięcie przycisku nada użytkownikowi rolę dostępu. Bot potrzebuje
        uprawnienia „Zarządzanie rolami", a jego rola musi być wyżej niż nadawana.
      </p>
    </div>
  );
}
