'use client';

import { useState } from 'react';
import { setBotPresenceAction } from '../app/settings/actions';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';

type Presence = { status: string; type: string; text: string; url: string };

const STATUSES = [
  { v: 'online', k: 'ui.settings.statusOnline' },
  { v: 'idle', k: 'ui.settings.statusIdle' },
  { v: 'dnd', k: 'ui.settings.statusDnd' },
  { v: 'invisible', k: 'ui.settings.statusInvisible' },
];
const TYPES = [
  { v: 'none', k: 'ui.settings.typeNone' },
  { v: 'playing', k: 'ui.settings.typePlaying' },
  { v: 'streaming', k: 'ui.settings.typeStreaming' },
  { v: 'watching', k: 'ui.settings.typeWatching' },
  { v: 'listening', k: 'ui.settings.typeListening' },
  { v: 'competing', k: 'ui.settings.typeCompeting' },
];

export default function BotPresenceForm({ initial }: { initial: Presence }) {
  const { lang } = useLang();
  const [p, setP] = useState<Presence>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const res = await setBotPresenceAction(p);
      setSt(res.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  const inputCls =
    'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

  const statusKey = STATUSES.find((s) => s.v === p.status)?.k;
  const typeKey = TYPES.find((t) => t.v === p.type)?.k;

  return (
    <div className="max-w-xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.settings.presenceStatusLabel')}
          </span>
          <select
            value={p.status}
            onChange={(e) => setP({ ...p, status: e.target.value })}
            className={inputCls}
          >
            {STATUSES.map((s) => (
              <option key={s.v} value={s.v}>
                {tp(lang, s.k)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.settings.presenceActivityLabel')}
          </span>
          <select
            value={p.type}
            onChange={(e) => setP({ ...p, type: e.target.value })}
            className={inputCls}
          >
            {TYPES.map((t) => (
              <option key={t.v} value={t.v}>
                {tp(lang, t.k)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {p.type !== 'none' && (
        <label className="block space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.settings.activityTextLabel')}
          </span>
          <input
            value={p.text}
            onChange={(e) => setP({ ...p, text: e.target.value })}
            placeholder={tp(lang, 'ui.settings.activityTextPh')}
            className={inputCls}
          />
        </label>
      )}
      {p.type === 'streaming' && (
        <label className="block space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.settings.streamUrlLabel')}
          </span>
          <input
            value={p.url}
            onChange={(e) => setP({ ...p, url: e.target.value })}
            placeholder="https://twitch.tv/..."
            className={inputCls}
          />
        </label>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={st === 'saving'}
          className="rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          {st === 'saving' ? tp(lang, 'ui.settings.saving') : tp(lang, 'ui.settings.save')}
        </button>
        {st === 'ok' && (
          <span className="text-sm text-green-400">✓ {tp(lang, 'ui.settings.savedPresence')}</span>
        )}
        {st === 'err' && (
          <span className="text-sm text-accent">{tp(lang, 'ui.settings.saveError')}</span>
        )}
      </div>
      <p className="text-xs text-muted">
        {tp(lang, 'ui.settings.previewPre')}{' '}
        <strong>{statusKey ? tp(lang, statusKey) : p.status}</strong>
        {p.type !== 'none' && p.text ? ` · ${typeKey ? tp(lang, typeKey) : ''} ${p.text}` : ''}.{' '}
        {tp(lang, 'ui.settings.previewPost')}
      </p>
    </div>
  );
}
