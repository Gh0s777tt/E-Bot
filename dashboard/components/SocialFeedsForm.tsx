'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { SocialFeedsConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

type Row = { id: string; url: string; label: string };
const newId = () => crypto.randomUUID().slice(0, 8);

export default function SocialFeedsForm({
  initial,
  guild,
}: {
  initial: SocialFeedsConfig;
  guild: GuildMeta;
}) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [channelId, setChannelId] = useState(initial.channelId);
  const [message, setMessage] = useState(initial.message);
  const [rows, setRows] = useState<Row[]>(() =>
    initial.feeds.map((f, i) => ({ id: `f${i}`, url: f.url, label: f.label })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const payload: SocialFeedsConfig = {
        enabled,
        channelId,
        message,
        feeds: rows.map((r) => ({ url: r.url.trim(), label: r.label.trim() })).filter((f) => f.url),
      };
      const r = await fetch('/api/social', {
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

  const add = () => rows.length < 15 && setRows([...rows, { id: newId(), url: '', label: '' }]);
  const setRow = (id: string, patch: Partial<Row>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const del = (id: string) => setRows(rows.filter((r) => r.id !== id));

  return (
    <div className="max-w-xl space-y-4">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">Powiadomienia o nowych postach włączone</span>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Kanał ogłoszeń</span>
        <ChannelSelect value={channelId} onChange={setChannelId} channels={guild.channels} />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-semibold text-white/90">
          Wiadomość ({'{label}'} {'{title}'} {'{link}'})
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          className={inputCls}
        />
      </label>

      <div className="space-y-2 rounded-xl border border-line bg-bg/40 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">Źródła RSS ({rows.length}/15)</span>
          <button
            type="button"
            onClick={add}
            disabled={rows.length >= 15}
            className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated disabled:opacity-40"
          >
            <Plus size={12} /> Dodaj feed
          </button>
        </div>
        {rows.length === 0 && (
          <p className="text-xs text-muted">
            Brak źródeł. Dodaj URL RSS/Atom (np. kanał YouTube, rss.app dla TikTok/IG/X/FB/Threads).
          </p>
        )}
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-[8rem_1fr_auto] gap-2">
            <input
              value={r.label}
              onChange={(e) => setRow(r.id, { label: e.target.value })}
              placeholder="Etykieta (np. TikTok)"
              className={inputCls}
              maxLength={60}
            />
            <input
              value={r.url}
              onChange={(e) => setRow(r.id, { url: e.target.value })}
              placeholder="https://… (URL RSS/Atom)"
              className={inputCls}
              maxLength={500}
            />
            <button
              type="button"
              onClick={() => del(r.id)}
              className="rounded-md border border-line p-2 text-muted transition hover:border-accent hover:text-accent"
              aria-label="Usuń"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">
        TikTok/Instagram/Facebook/Threads/X nie mają darmowego API „nowy post" → użyj mostka RSS
        (np. rss.app, RSSHub) i wklej URL feedu. YouTube ma natywny RSS. Bot sprawdza co 10 min,
        pierwsze uruchomienie tylko zapamiętuje (bez spamu historią).
      </p>
    </div>
  );
}
