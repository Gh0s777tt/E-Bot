'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { CounterItem, CountersConfig, CounterType } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

type Row = CounterItem & { k: string };

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

const TYPES: { v: CounterType; l: string; tpl: string }[] = [
  { v: 'members', l: 'Członkowie', tpl: '👥 Członków: {count}' },
  { v: 'humans', l: 'Ludzie (bez botów)', tpl: '🧑 Ludzi: {count}' },
  { v: 'bots', l: 'Boty', tpl: '🤖 Botów: {count}' },
  { v: 'boosts', l: 'Boosty', tpl: '🚀 Boostów: {count}' },
  { v: 'boostTier', l: 'Poziom boost', tpl: '💜 Poziom: {count}' },
  { v: 'channels', l: 'Kanały', tpl: '📁 Kanałów: {count}' },
  { v: 'roles', l: 'Role', tpl: '🏷️ Ról: {count}' },
  { v: 'emojis', l: 'Emoji', tpl: '😀 Emoji: {count}' },
  { v: 'stickers', l: 'Naklejki', tpl: '🏷️ Naklejek: {count}' },
  { v: 'voice', l: 'Na voice (teraz)', tpl: '🎙️ Na voice: {count}' },
  { v: 'ytSubs', l: '▶️ YouTube — suby', tpl: '▶️ Subów: {count}' },
  { v: 'ytViews', l: '▶️ YouTube — wyświetlenia', tpl: '👁️ Wyświetleń: {count}' },
  { v: 'ytVideos', l: '▶️ YouTube — filmy', tpl: '🎬 Filmów: {count}' },
  { v: 'twFollowers', l: '🟣 Twitch — followy', tpl: '🟣 Followów: {count}' },
  { v: 'twSubs', l: '🟣 Twitch — suby', tpl: '🟣 Subów: {count}' },
  { v: 'twViewers', l: '🟣 Twitch — widzowie (live)', tpl: '🟣 Widzów: {count}' },
  { v: 'kickFollowers', l: '🟢 Kick — followy', tpl: '🟢 Followów: {count}' },
  { v: 'kickViewers', l: '🟢 Kick — widzowie (live)', tpl: '🟢 Widzów: {count}' },
];

const ARG_TYPES = new Set<CounterType>([
  'ytSubs',
  'ytViews',
  'ytVideos',
  'twFollowers',
  'twSubs',
  'twViewers',
  'kickFollowers',
  'kickViewers',
]);
const needsArg = (t: CounterType) => ARG_TYPES.has(t);
const argPlaceholder = (t: CounterType) =>
  t.startsWith('yt')
    ? 'ID kanału YouTube (UC…) lub @handle — puste = domyślny z env bota'
    : t.startsWith('kick')
      ? 'Slug kanału Kick (np. xqc) — puste = domyślny z env bota'
      : 'Login Twitch (np. xqc) — puste = domyślny z env bota';

export default function CountersForm({
  initial,
  guild,
}: {
  initial: CountersConfig;
  guild: GuildMeta;
}) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const idRef = useRef(0);
  const [rows, setRows] = useState<Row[]>(() =>
    initial.items.map((i) => ({ ...i, k: `n${idRef.current++}` })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const payload: CountersConfig = {
        enabled,
        items: rows.map(({ k, ...i }) => i).filter((i) => i.channelId && i.template),
      };
      const r = await fetch('/api/counters', {
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
    <div className="max-w-2xl space-y-5">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">Liczniki włączone</span>
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">Liczniki (kanał → statystyka)</span>
          <button
            type="button"
            onClick={() =>
              setRows([
                ...rows,
                {
                  channelId: '',
                  type: 'members',
                  template: '👥 Członków: {count}',
                  k: `n${idRef.current++}`,
                },
              ])
            }
            className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated"
          >
            <Plus size={12} /> Dodaj
          </button>
        </div>
        {rows.map((r) => (
          <div key={r.k} className="space-y-1.5">
            <div className="flex items-start gap-2">
              <div className="w-44 shrink-0">
                <ChannelSelect
                  value={r.channelId}
                  onChange={(v) =>
                    setRows(rows.map((x) => (x.k === r.k ? { ...x, channelId: v } : x)))
                  }
                  channels={guild.channels}
                  kind="voice"
                />
              </div>
              <select
                value={r.type}
                onChange={(e) => {
                  const type = e.target.value as CounterType;
                  const tpl = TYPES.find((t) => t.v === type)?.tpl ?? r.template;
                  setRows(rows.map((x) => (x.k === r.k ? { ...x, type, template: tpl } : x)));
                }}
                className={`${inputCls} w-36`}
              >
                {TYPES.map((t) => (
                  <option key={t.v} value={t.v}>
                    {t.l}
                  </option>
                ))}
              </select>
              <input
                value={r.template}
                onChange={(e) =>
                  setRows(rows.map((x) => (x.k === r.k ? { ...x, template: e.target.value } : x)))
                }
                placeholder="Szablon ({count})"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setRows(rows.filter((x) => x.k !== r.k))}
                className="rounded-md border border-line p-2 text-muted transition hover:border-accent hover:text-accent"
                aria-label="Usuń"
              >
                <Trash2 size={14} />
              </button>
            </div>
            {needsArg(r.type) && (
              <input
                value={r.arg ?? ''}
                onChange={(e) =>
                  setRows(rows.map((x) => (x.k === r.k ? { ...x, arg: e.target.value } : x)))
                }
                placeholder={argPlaceholder(r.type)}
                className={inputCls}
              />
            )}
          </div>
        ))}
      </div>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">
        Najlepiej użyj <strong>zablokowanych kanałów głosowych</strong> (bez prawa łączenia) jako
        liczników. Zmienna <code>{'{count}'}</code> wstawia liczbę. Bot odświeża co ~10 min (limit
        Discorda na zmianę nazwy kanału). Potrzebuje uprawnienia <em>Zarządzanie kanałami</em>.
      </p>
      <p className="text-xs text-muted">
        ▶️ <strong>YouTube</strong> (suby / wyświetlenia / filmy) — wymaga klucza{' '}
        <code>YOUTUBE_API_KEY</code>. W polu pod licznikiem wpisz <strong>ID kanału</strong> (
        <code>UC…</code>) albo <code>@handle</code>. <em>Uwaga:</em> YouTube podaje subskrybentów
        zaokrąglone (np. 12,3 tys.).
      </p>
      <p className="text-xs text-muted">
        🟣 <strong>Twitch</strong> / 🟢 <strong>Kick</strong> — w polu wpisz{' '}
        <strong>login Twitch</strong> lub <strong>slug Kick</strong> (puste = z env bota). Od ręki
        (token aplikacyjny): <strong>widzowie na żywo</strong> (Twitch i Kick) oraz{' '}
        <strong>followy Kick</strong>. <strong>Followy/suby Twitch</strong> wymagają tokena twórcy{' '}
        <code>TWITCH_USER_TOKEN</code> (scope <code>moderator:read:followers</code> /{' '}
        <code>channel:read:subscriptions</code>) — bez niego są pomijane. Suby Kick nie są
        publicznie dostępne.
      </p>
    </div>
  );
}
