'use client';

// Faza 6 / B3 — listy rozwijane ról/kanałów. Gdy brak opcji (np. bot offline / brak tokenu),
// degradują się do zwykłego pola tekstowego, więc zawsze można wkleić ID ręcznie.
import type { GuildChannel, GuildRole } from '../lib/guild';

const cls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

// Discord channel types: 0 text · 2 voice · 4 category · 5 announcement · 13 stage · 15 forum
const TEXTLIKE = new Set([0, 5, 15]);

export function ChannelSelect({
  value,
  onChange,
  channels,
  kind = 'text',
  placeholder,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  channels: GuildChannel[];
  kind?: 'text' | 'category' | 'voice';
  placeholder?: string;
  className?: string;
}) {
  if (!channels.length) {
    return (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? (kind === 'category' ? 'ID kategorii' : 'ID kanału')}
        className={`${cls} ${className}`}
      />
    );
  }
  const list = channels.filter((c) =>
    kind === 'category' ? c.type === 4 : kind === 'voice' ? c.type === 2 : TEXTLIKE.has(c.type),
  );
  const known = list.some((c) => c.id === value);
  const prefix = kind === 'category' ? '🗂 ' : kind === 'voice' ? '🔊 ' : '# ';
  const defaultPh =
    kind === 'category'
      ? '— wybierz kategorię —'
      : kind === 'voice'
        ? '— wybierz kanał głosowy —'
        : '— wybierz kanał —';
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${cls} ${className}`}
    >
      <option value="">{placeholder ?? defaultPh}</option>
      {list.map((c) => (
        <option key={c.id} value={c.id}>
          {prefix}
          {c.name}
        </option>
      ))}
      {value && !known && <option value={value}>ID: {value}</option>}
    </select>
  );
}

export function RoleSelect({
  value,
  onChange,
  roles,
  placeholder,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  roles: GuildRole[];
  placeholder?: string;
  className?: string;
}) {
  if (!roles.length) {
    return (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'ID roli'}
        className={`${cls} ${className}`}
      />
    );
  }
  const known = roles.some((r) => r.id === value);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${cls} ${className}`}
    >
      <option value="">{placeholder ?? '— wybierz rolę —'}</option>
      {roles.map((r) => (
        <option key={r.id} value={r.id}>
          @ {r.name}
        </option>
      ))}
      {value && !known && <option value={value}>ID: {value}</option>}
    </select>
  );
}
