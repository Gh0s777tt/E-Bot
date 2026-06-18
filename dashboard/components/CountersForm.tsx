'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { CounterItem, CountersConfig, CounterType } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

type Row = CounterItem & { k: string };

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

const TYPES: { v: CounterType; lKey: string; tplKey: string }[] = [
  { v: 'members', lKey: 'ui.counters.lblMembers', tplKey: 'ui.counters.tplMembers' },
  { v: 'humans', lKey: 'ui.counters.lblHumans', tplKey: 'ui.counters.tplHumans' },
  { v: 'bots', lKey: 'ui.counters.lblBots', tplKey: 'ui.counters.tplBots' },
  { v: 'boosts', lKey: 'ui.counters.lblBoosts', tplKey: 'ui.counters.tplBoosts' },
  { v: 'boostTier', lKey: 'ui.counters.lblBoostTier', tplKey: 'ui.counters.tplBoostTier' },
  { v: 'channels', lKey: 'ui.counters.lblChannels', tplKey: 'ui.counters.tplChannels' },
  { v: 'roles', lKey: 'ui.counters.lblRoles', tplKey: 'ui.counters.tplRoles' },
  { v: 'emojis', lKey: 'ui.counters.lblEmojis', tplKey: 'ui.counters.tplEmojis' },
  { v: 'stickers', lKey: 'ui.counters.lblStickers', tplKey: 'ui.counters.tplStickers' },
  { v: 'voice', lKey: 'ui.counters.lblVoice', tplKey: 'ui.counters.tplVoice' },
  { v: 'ytSubs', lKey: 'ui.counters.lblYtSubs', tplKey: 'ui.counters.tplYtSubs' },
  { v: 'ytViews', lKey: 'ui.counters.lblYtViews', tplKey: 'ui.counters.tplYtViews' },
  { v: 'ytVideos', lKey: 'ui.counters.lblYtVideos', tplKey: 'ui.counters.tplYtVideos' },
  { v: 'twFollowers', lKey: 'ui.counters.lblTwFollowers', tplKey: 'ui.counters.tplTwFollowers' },
  { v: 'twSubs', lKey: 'ui.counters.lblTwSubs', tplKey: 'ui.counters.tplTwSubs' },
  { v: 'twViewers', lKey: 'ui.counters.lblTwViewers', tplKey: 'ui.counters.tplTwViewers' },
  {
    v: 'kickFollowers',
    lKey: 'ui.counters.lblKickFollowers',
    tplKey: 'ui.counters.tplKickFollowers',
  },
  { v: 'kickViewers', lKey: 'ui.counters.lblKickViewers', tplKey: 'ui.counters.tplKickViewers' },
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

export default function CountersForm({
  initial,
  guild,
}: {
  initial: CountersConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [enabled, setEnabled] = useState(initial.enabled);
  const idRef = useRef(0);
  const [rows, setRows] = useState<Row[]>(() =>
    initial.items.map((i) => ({ ...i, k: `n${idRef.current++}` })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  const argPlaceholder = (t: CounterType) =>
    t.startsWith('yt')
      ? tp(lang, 'ui.counters.argYt')
      : t.startsWith('kick')
        ? tp(lang, 'ui.counters.argKick')
        : tp(lang, 'ui.counters.argTwitch');

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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.counters.enabled')}</span>
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">
            {tp(lang, 'ui.counters.rowsLabel')}
          </span>
          <button
            type="button"
            onClick={() =>
              setRows([
                ...rows,
                {
                  channelId: '',
                  type: 'members',
                  template: tp(lang, 'ui.counters.tplMembers'),
                  k: `n${idRef.current++}`,
                },
              ])
            }
            className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated"
          >
            <Plus size={12} /> {tp(lang, 'ui.counters.add')}
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
                  const tplKey = TYPES.find((t) => t.v === type)?.tplKey;
                  const tpl = tplKey ? tp(lang, tplKey) : r.template;
                  setRows(rows.map((x) => (x.k === r.k ? { ...x, type, template: tpl } : x)));
                }}
                className={`${inputCls} w-36`}
              >
                {TYPES.map((t) => (
                  <option key={t.v} value={t.v}>
                    {tp(lang, t.lKey)}
                  </option>
                ))}
              </select>
              <input
                value={r.template}
                onChange={(e) =>
                  setRows(rows.map((x) => (x.k === r.k ? { ...x, template: e.target.value } : x)))
                }
                placeholder={tp(lang, 'ui.counters.templatePh')}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setRows(rows.filter((x) => x.k !== r.k))}
                className="rounded-md border border-line p-2 text-muted transition hover:border-accent hover:text-accent"
                aria-label={tp(lang, 'ui.counters.remove')}
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
      <p className="text-xs text-muted">{tp(lang, 'ui.counters.footMain')}</p>
      <p className="text-xs text-muted">{tp(lang, 'ui.counters.footYouTube')}</p>
      <p className="text-xs text-muted">{tp(lang, 'ui.counters.footTwitchKick')}</p>
    </div>
  );
}
