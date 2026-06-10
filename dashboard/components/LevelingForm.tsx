'use client';

import { Plus, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { LevelingConfig } from '../lib/faza4';
import type { GuildMeta } from '../lib/guild';
import AdvancedOnly from './AdvancedOnly';
import Hint from './Hint';
import MessageEditor from './MessageEditor';
import { ChannelSelect, RoleSelect } from './pickers';
import SaveButton from './SaveButton';

type RewardRow = { level: number; roleId: string; k: string };
type MultRow = { roleId: string; factor: number; k: string };

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const num = (v: string): number => Math.max(0, Math.floor(Number(v) || 0));
const fnum = (v: string): number => Math.max(1, Math.min(10, Number(v) || 1));

export default function LevelingForm({
  initial,
  guild,
}: {
  initial: LevelingConfig;
  guild: GuildMeta;
}) {
  const { rewards, multipliers, noXpChannels, noXpRoles, ...rest } = initial;
  const [b, setB] = useState(rest);
  const idRef = useRef(0);
  const [rws, setRws] = useState<RewardRow[]>(() =>
    rewards.map((r) => ({ ...r, k: `r${idRef.current++}` })),
  );
  const [mults, setMults] = useState<MultRow[]>(() =>
    multipliers.map((m) => ({ ...m, k: `m${idRef.current++}` })),
  );
  const [noCh, setNoCh] = useState<string[]>(noXpChannels);
  const [noRo, setNoRo] = useState<string[]>(noXpRoles);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const payload: LevelingConfig = {
        ...b,
        rewards: rws.map(({ k, ...r }) => r),
        multipliers: mults.map(({ k, ...m }) => m).filter((m) => m.roleId),
        noXpChannels: noCh,
        noXpRoles: noRo,
      };
      const r = await fetch('/api/leveling', {
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

  const roleName = (id: string) => guild.roles.find((r) => r.id === id)?.name ?? id;
  const chanName = (id: string) => guild.channels.find((c) => c.id === id)?.name ?? id;
  const Chip = ({ label, onX }: { label: string; onX: () => void }) => (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-elevated px-2.5 py-0.5 text-xs">
      {label}
      <button
        type="button"
        onClick={onX}
        className="text-muted hover:text-accent"
        aria-label="Usuń"
      >
        <X size={11} />
      </button>
    </span>
  );

  return (
    <div className="max-w-2xl space-y-5">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={b.enabled}
          onChange={(e) => setB({ ...b, enabled: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">Leveling włączony</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">XP za wiadomość</span>
          <input
            type="number"
            value={b.xpPerMessage}
            onChange={(e) => setB({ ...b, xpPerMessage: num(e.target.value) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">XP za minutę voice</span>
          <input
            type="number"
            value={b.xpPerVoiceMin}
            onChange={(e) => setB({ ...b, xpPerVoiceMin: num(e.target.value) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            Cooldown wiadomości (s)
            <Hint text="Minimalny odstęp między wiadomościami liczonymi do XP — chroni przed spamem dla XP." />
          </span>
          <input
            type="number"
            value={b.cooldownSec}
            onChange={(e) => setB({ ...b, cooldownSec: num(e.target.value) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            Mnożnik weekendowy (1 = off)
            <Hint text="W soboty i niedziele XP jest mnożone przez tę wartość — np. 2 = podwójne XP w weekendy." />
          </span>
          <input
            type="number"
            step="0.5"
            value={b.weekendBonus}
            onChange={(e) => setB({ ...b, weekendBonus: fnum(e.target.value) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-semibold text-white/90">Kanał ogłoszeń awansu</span>
          <ChannelSelect
            value={b.announceChannelId}
            onChange={(v) => setB({ ...b, announceChannelId: v })}
            channels={guild.channels}
            placeholder="— ten sam kanał —"
          />
        </label>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={b.voiceAntiAfk}
            onChange={(e) => setB({ ...b, voiceAntiAfk: e.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">
            Anti‑AFK voice (≥2 osób, bez mute)
            <Hint text="XP za voice tylko, gdy na kanale są min. 2 osoby i użytkownik nie jest wyciszony — blokuje farmienie AFK." />
          </span>
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={b.stackRewards}
            onChange={(e) => setB({ ...b, stackRewards: e.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">
            Kumuluj role‑nagrody
            <Hint text="Włączone: użytkownik trzyma wszystkie role-nagrody do swojego poziomu. Wyłączone: tylko najwyższą." />
          </span>
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={b.levelUpDm}
            onChange={(e) => setB({ ...b, levelUpDm: e.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">DM do użytkownika przy awansie</span>
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={b.achievementsEnabled}
            onChange={(e) => setB({ ...b, achievementsEnabled: e.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">
            🏆 Osiągnięcia — ogłaszaj odznaki-tiery (poziom 5/10/25/50/100/200) na kanale awansów
          </span>
        </label>
      </div>

      <div className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Wiadomość awansu (puste = domyślna)</span>
        <MessageEditor
          value={b.levelUpMessage}
          onChange={(v) => setB({ ...b, levelUpMessage: v })}
          rows={2}
          placeholder="🏆 {user} osiągnął poziom {level}!"
          variables={[
            { token: '{user}', label: 'Użytkownik', sample: '@Gracz' },
            { token: '{level}', label: 'Poziom', sample: '12' },
          ]}
        />
      </div>

      {/* Role-nagrody */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">Role‑nagrody (poziom → rola)</span>
          <button
            type="button"
            onClick={() => setRws([...rws, { level: 5, roleId: '', k: `r${idRef.current++}` }])}
            className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated"
          >
            <Plus size={12} /> Dodaj
          </button>
        </div>
        {rws.map((r) => (
          <div key={r.k} className="flex items-center gap-2">
            <input
              type="number"
              value={r.level}
              onChange={(e) =>
                setRws(
                  rws.map((x) =>
                    x.k === r.k ? { ...x, level: Math.max(1, num(e.target.value)) } : x,
                  ),
                )
              }
              className={`${inputCls} w-24`}
              placeholder="poziom"
            />
            <RoleSelect
              value={r.roleId}
              onChange={(v) => setRws(rws.map((x) => (x.k === r.k ? { ...x, roleId: v } : x)))}
              roles={guild.roles}
            />
            <button
              type="button"
              onClick={() => setRws(rws.filter((x) => x.k !== r.k))}
              className="rounded-md border border-line p-2 text-muted transition hover:border-accent hover:text-accent"
              aria-label="Usuń"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <AdvancedOnly>
        {/* Mnożniki XP za rolę */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white/90">
              Mnożniki XP za rolę
              <Hint text="Posiadacze roli zdobywają XP szybciej (brany najwyższy mnożnik, np. VIP ×2)." />
            </span>
            <button
              type="button"
              onClick={() =>
                setMults([...mults, { roleId: '', factor: 2, k: `m${idRef.current++}` }])
              }
              className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated"
            >
              <Plus size={12} /> Dodaj
            </button>
          </div>
          {mults.map((m) => (
            <div key={m.k} className="flex items-center gap-2">
              <RoleSelect
                value={m.roleId}
                onChange={(v) =>
                  setMults(mults.map((x) => (x.k === m.k ? { ...x, roleId: v } : x)))
                }
                roles={guild.roles}
              />
              <input
                type="number"
                step="0.5"
                value={m.factor}
                onChange={(e) =>
                  setMults(
                    mults.map((x) => (x.k === m.k ? { ...x, factor: fnum(e.target.value) } : x)),
                  )
                }
                className={`${inputCls} w-24`}
                placeholder="×"
              />
              <button
                type="button"
                onClick={() => setMults(mults.filter((x) => x.k !== m.k))}
                className="rounded-md border border-line p-2 text-muted transition hover:border-accent hover:text-accent"
                aria-label="Usuń"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* No-XP kanały / role */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-white/90">Kanały bez XP</span>
            <ChannelSelect
              value=""
              onChange={(v) => v && !noCh.includes(v) && setNoCh([...noCh, v])}
              channels={guild.channels}
              placeholder="+ dodaj kanał"
            />
            <div className="flex flex-wrap gap-1.5">
              {noCh.map((id) => (
                <Chip
                  key={id}
                  label={`#${chanName(id)}`}
                  onX={() => setNoCh(noCh.filter((x) => x !== id))}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-white/90">Role bez XP</span>
            <RoleSelect
              value=""
              onChange={(v) => v && !noRo.includes(v) && setNoRo([...noRo, v])}
              roles={guild.roles}
              placeholder="+ dodaj rolę"
            />
            <div className="flex flex-wrap gap-1.5">
              {noRo.map((id) => (
                <Chip
                  key={id}
                  label={`@${roleName(id)}`}
                  onX={() => setNoRo(noRo.filter((x) => x !== id))}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Prestiż */}
        <div className="space-y-3 rounded-xl border border-line bg-bg/40 p-4">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={b.prestigeEnabled}
              onChange={(e) => setB({ ...b, prestigeEnabled: e.target.checked })}
              className="h-4 w-4 accent-accent"
            />
            <span className="font-semibold text-white/90">
              Prestiż włączony (/prestige resetuje XP za odznakę)
            </span>
          </label>
          {b.prestigeEnabled && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="font-semibold text-white/90">Poziom wymagany</span>
                <input
                  type="number"
                  value={b.prestigeLevel}
                  onChange={(e) => setB({ ...b, prestigeLevel: Math.max(1, num(e.target.value)) })}
                  className={inputCls}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-semibold text-white/90">Rola za prestiż</span>
                <RoleSelect
                  value={b.prestigeRoleId}
                  onChange={(v) => setB({ ...b, prestigeRoleId: v })}
                  roles={guild.roles}
                  placeholder="— brak —"
                />
              </label>
            </div>
          )}
        </div>
      </AdvancedOnly>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">
        Wymaga jednorazowo <code>f4-leveling-schema.sql</code> dla prestiżu. Resztę bot stosuje na
        żywo (settings‑sync).
      </p>
    </div>
  );
}
