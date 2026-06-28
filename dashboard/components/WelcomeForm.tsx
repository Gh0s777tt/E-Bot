'use client';

import { useState } from 'react';
import { type CardStyle, RANKCARD_DEFAULT } from '../lib/cardStyle';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { fromLegacy, normalizeRich, type RichMessage } from '../lib/richMessage';
import CardStyleEditor from './CardStyleEditor';
import { useLang } from './LangContext';
import MessageStudio from './MessageStudio';
import { ChannelSelect, RoleSelect } from './pickers';
import SaveButton from './SaveButton';

type Cfg = {
  enabled: boolean;
  channelId: string;
  message: string;
  autoroleId: string;
  cardEnabled: boolean;
  card: CardStyle;
  messageSpec: RichMessage;
  autoroleDelaySec?: number;
};

export default function WelcomeForm({
  initial,
  guild,
}: {
  initial: Omit<Cfg, 'messageSpec'> & { messageSpec?: RichMessage };
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [c, setC] = useState<Cfg>({
    ...initial,
    messageSpec: initial.messageSpec
      ? normalizeRich(initial.messageSpec)
      : fromLegacy(initial.message),
  });
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/welcome', {
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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.welcome.enabledLabel')}</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.welcome.channelLabel')}</span>
          <ChannelSelect
            value={c.channelId}
            onChange={(v) => setC({ ...c, channelId: v })}
            channels={guild.channels}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.welcome.autoroleLabel')}
          </span>
          <RoleSelect
            value={c.autoroleId}
            onChange={(v) => setC({ ...c, autoroleId: v })}
            roles={guild.roles}
            placeholder={tp(lang, 'ui.welcome.noAutorole')}
          />
        </label>
      </div>

      {c.autoroleId && (
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.welcome.delayLabel')}</span>
          <input
            type="number"
            value={c.autoroleDelaySec ?? 0}
            onChange={(e) =>
              setC({ ...c, autoroleDelaySec: Math.max(0, Math.floor(Number(e.target.value) || 0)) })
            }
            className="w-full max-w-[200px] rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <span className="block text-[11px] text-muted">{tp(lang, 'ui.welcome.delayHelp')}</span>
        </label>
      )}

      <div className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.welcome.messageLabel')}</span>
        <MessageStudio
          value={c.messageSpec}
          onChange={(messageSpec) => setC({ ...c, messageSpec, message: messageSpec.content })}
          emojis={guild.emojis}
          variables={[
            { token: '{user}', label: tp(lang, 'ui.welcome.varUser'), sample: '@NowyGracz' },
            { token: '{server}', label: tp(lang, 'ui.welcome.varServer'), sample: 'E-Forge' },
            {
              token: '{memberCount}',
              label: tp(lang, 'ui.welcome.varMemberCount'),
              sample: '1234',
            },
          ]}
        />
      </div>

      <div className="space-y-3 rounded-xl border border-line bg-bg/40 p-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={c.cardEnabled}
            onChange={(e) => setC({ ...c, cardEnabled: e.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">{tp(lang, 'ui.welcome.bannerLabel')}</span>
        </label>
        {c.cardEnabled && (
          <CardStyleEditor
            value={c.card ?? RANKCARD_DEFAULT}
            onChange={(card) => setC({ ...c, card })}
            previewText={tp(lang, 'ui.welcome.previewText')}
          />
        )}
      </div>

      <SaveButton st={st} onClick={save} />
    </div>
  );
}
