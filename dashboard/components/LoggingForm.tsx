'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import type { LoggingConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

// Etykiety/podpowiedzi grup po kluczach i18n (tłumaczone w renderze przez tp).
const GROUPS: { key: keyof LoggingConfig; labelKey: string; hintKey: string }[] = [
  { key: 'messages', labelKey: 'ui.logging.grpMessages', hintKey: 'ui.logging.grpMessagesHint' },
  { key: 'members', labelKey: 'ui.logging.grpMembers', hintKey: 'ui.logging.grpMembersHint' },
  {
    key: 'memberUpdates',
    labelKey: 'ui.logging.grpMemberUpdates',
    hintKey: 'ui.logging.grpMemberUpdatesHint',
  },
  {
    key: 'moderation',
    labelKey: 'ui.logging.grpModeration',
    hintKey: 'ui.logging.grpModerationHint',
  },
  { key: 'server', labelKey: 'ui.logging.grpServer', hintKey: 'ui.logging.grpServerHint' },
  { key: 'voice', labelKey: 'ui.logging.grpVoice', hintKey: 'ui.logging.grpVoiceHint' },
];

export default function LoggingForm({
  initial,
  guild,
}: {
  initial: LoggingConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [c, setC] = useState<LoggingConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/logging', {
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

  const chanName = (id: string) => guild.channels.find((x) => x.id === id)?.name ?? id;

  return (
    <div className="max-w-xl space-y-5">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={c.enabled}
          onChange={(e) => setC({ ...c, enabled: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">{tp(lang, 'ui.logging.enabledLabel')}</span>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.logging.channelLabel')}</span>
        <ChannelSelect
          value={c.channelId}
          onChange={(v) => setC({ ...c, channelId: v })}
          channels={guild.channels}
        />
      </label>

      <div className="space-y-2">
        <span className="text-sm font-semibold text-white/90">
          {tp(lang, 'ui.logging.whatToLog')}
        </span>
        <div className="grid gap-2 sm:grid-cols-2">
          {GROUPS.map((g) => (
            <label
              key={g.key}
              className="flex items-start gap-3 rounded-lg border border-line bg-bg/40 px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={c[g.key] as boolean}
                onChange={(e) => setC({ ...c, [g.key]: e.target.checked })}
                className="mt-0.5 h-4 w-4 accent-accent"
              />
              <span>
                <span className="font-semibold text-white/90">{tp(lang, g.labelKey)}</span>
                <span className="block text-xs text-muted">{tp(lang, g.hintKey)}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-semibold text-white/90">
          {tp(lang, 'ui.logging.ignoredLabel')}
        </span>
        <ChannelSelect
          value=""
          onChange={(v) =>
            v &&
            !c.ignoreChannels.includes(v) &&
            setC({ ...c, ignoreChannels: [...c.ignoreChannels, v] })
          }
          channels={guild.channels}
          placeholder={tp(lang, 'ui.logging.addChannel')}
        />
        <div className="flex flex-wrap gap-1.5">
          {c.ignoreChannels.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-elevated px-2.5 py-0.5 text-xs"
            >
              #{chanName(id)}
              <button
                type="button"
                onClick={() =>
                  setC({ ...c, ignoreChannels: c.ignoreChannels.filter((x) => x !== id) })
                }
                className="text-muted hover:text-accent"
                aria-label={tp(lang, 'ui.logging.remove')}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">{tp(lang, 'ui.logging.footNote')}</p>
    </div>
  );
}
