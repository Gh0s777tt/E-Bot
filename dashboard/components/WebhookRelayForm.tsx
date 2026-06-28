'use client';

import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import type { GuildMeta } from '../lib/guild';
import type { WebhookRelayConfig } from '../lib/integrations';
import { tp } from '../lib/panelI18n';
import { useDashboardOrigin } from '../lib/useDashboardOrigin';
import { useLang } from './LangContext';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function WebhookRelayForm({
  initial,
  guild,
}: {
  initial: WebhookRelayConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [c, setC] = useState<WebhookRelayConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const BASE = `${useDashboardOrigin()}/api/hook`;

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/webhook-relay', {
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

  const genToken = () => setC({ ...c, token: crypto.randomUUID().replaceAll('-', '') });
  const webhookUrl = c.token ? `${BASE}?token=${c.token}` : `${BASE}?token=…`;

  return (
    <section className="panel-glow rounded-2xl border border-line bg-card p-5">
      <h2 className="mb-4 font-display text-lg font-semibold tracking-wide">
        {tp(lang, 'ui.integrations.webhookHeading')}
      </h2>
      <div className="max-w-xl space-y-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={c.enabled}
            onChange={(e) => setC({ ...c, enabled: e.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.integrations.webhookEnabled')}
          </span>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.integrations.channelLabel')}
          </span>
          <ChannelSelect
            value={c.channelId}
            onChange={(v) => setC({ ...c, channelId: v })}
            channels={guild.channels}
            placeholder={tp(lang, 'ui.integrations.channelPh')}
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.integrations.tokenLabel')}
          </span>
          <div className="flex gap-2">
            <input
              value={c.token}
              onChange={(e) => setC({ ...c, token: e.target.value })}
              placeholder={tp(lang, 'ui.integrations.tokenPh')}
              className={`${inputCls} font-mono`}
            />
            <button
              type="button"
              onClick={genToken}
              className="flex shrink-0 items-center gap-1 rounded-md border border-line px-3 text-sm transition hover:border-accent hover:bg-elevated"
            >
              <RefreshCw size={13} /> {tp(lang, 'ui.integrations.genBtn')}
            </button>
          </div>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.integrations.msgTemplate')} ({'{content}'} {'{title}'} {'{url}'})
          </span>
          <textarea
            value={c.message}
            onChange={(e) => setC({ ...c, message: e.target.value })}
            rows={2}
            className={inputCls}
          />
        </label>

        <div className="rounded-lg border border-line bg-bg/40 p-3 text-xs text-muted">
          <p className="mb-1 font-semibold text-white/90">
            {tp(lang, 'ui.integrations.urlHeading')}
          </p>
          <code className="block break-all rounded bg-elevated px-2 py-1 text-accent">
            {webhookUrl}
          </code>
          <p className="mt-2">
            {tp(lang, 'ui.integrations.urlHelpPre')}
            <code>POST</code>
            {tp(lang, 'ui.integrations.urlHelpMid')}
            <code>{'{ "content": "text", "title": "...", "url": "..." }'}</code>
            {tp(lang, 'ui.integrations.urlHelpPost')}
            <code>x-webhook-token</code>
            {tp(lang, 'ui.integrations.urlHelpEnd')}
          </p>
        </div>

        <SaveButton st={st} onClick={save} />
      </div>
    </section>
  );
}
