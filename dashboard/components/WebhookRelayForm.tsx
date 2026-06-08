'use client';

import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import type { GuildMeta } from '../lib/guild';
import type { WebhookRelayConfig } from '../lib/integrations';
import { ChannelSelect } from './pickers';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const BASE = 'https://e-bot-dc.vercel.app/api/hook';

export default function WebhookRelayForm({
  initial,
  guild,
}: {
  initial: WebhookRelayConfig;
  guild: GuildMeta;
}) {
  const [c, setC] = useState<WebhookRelayConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

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
      <h2 className="mb-4 text-base font-semibold uppercase tracking-wide">
        Webhook przychodzący (Zapier / Make / GitHub / IFTTT)
      </h2>
      <div className="max-w-xl space-y-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={c.enabled}
            onChange={(e) => setC({ ...c, enabled: e.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">Webhook włączony</span>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Kanał docelowy</span>
          <ChannelSelect
            value={c.channelId}
            onChange={(v) => setC({ ...c, channelId: v })}
            channels={guild.channels}
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Token (sekret w URL)</span>
          <div className="flex gap-2">
            <input
              value={c.token}
              onChange={(e) => setC({ ...c, token: e.target.value })}
              placeholder="kliknij Generuj"
              className={`${inputCls} font-mono`}
            />
            <button
              type="button"
              onClick={genToken}
              className="flex shrink-0 items-center gap-1 rounded-md border border-line px-3 text-sm transition hover:border-accent hover:bg-elevated"
            >
              <RefreshCw size={13} /> Generuj
            </button>
          </div>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            Szablon wiadomości ({'{content}'} {'{title}'} {'{url}'})
          </span>
          <textarea
            value={c.message}
            onChange={(e) => setC({ ...c, message: e.target.value })}
            rows={2}
            className={inputCls}
          />
        </label>

        <div className="rounded-lg border border-line bg-bg/40 p-3 text-xs text-muted">
          <p className="mb-1 font-semibold text-white/90">URL webhooka (POST, JSON):</p>
          <code className="block break-all rounded bg-elevated px-2 py-1 text-accent">
            {webhookUrl}
          </code>
          <p className="mt-2">
            Wyślij <code>POST</code> z body JSON np.{' '}
            <code>{'{ "content": "tekst", "title": "...", "url": "..." }'}</code>. Token możesz też
            podać nagłówkiem <code>x-webhook-token</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={st === 'saving'}
            className="rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
          >
            {st === 'saving' ? 'Zapisywanie…' : 'Zapisz'}
          </button>
          {st === 'ok' && <span className="text-sm text-green-400">✓ Zapisano</span>}
          {st === 'err' && <span className="text-sm text-accent">Błąd zapisu</span>}
        </div>
      </div>
    </section>
  );
}
