'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { DonateConfig } from '../lib/community';
import { tp } from '../lib/panelI18n';
import { saveConfig } from '../lib/saveConfig';
import { useLang } from './LangContext';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

type Row = { id: string; label: string; url: string; emoji: string };
const newId = () => crypto.randomUUID().slice(0, 8);

const PRESETS = [
  { label: 'PayPal', emoji: '💸', url: 'https://paypal.me/' },
  { label: 'Buy Me a Coffee', emoji: '☕', url: 'https://buymeacoffee.com/' },
  { label: 'Patreon', emoji: '🅿️', url: 'https://patreon.com/' },
  { label: 'Ko-fi', emoji: '❤️', url: 'https://ko-fi.com/' },
];

export default function DonateLinksForm({ initial }: { initial: DonateConfig }) {
  const { lang } = useLang();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [rows, setRows] = useState<Row[]>(() =>
    initial.providers.map((p, i) => ({ id: `d${i}`, label: p.label, url: p.url, emoji: p.emoji })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function save() {
    setSt('saving');
    const payload: DonateConfig = {
      enabled,
      title,
      description,
      providers: rows
        .map((r) => ({ label: r.label.trim(), url: r.url.trim(), emoji: r.emoji.trim() }))
        .filter((p) => p.label && /^https?:\/\//i.test(p.url)),
    };
    const res = await saveConfig('/api/donate', payload);
    setErrMsg(res.error);
    setSt(res.ok ? 'ok' : 'err');
    setTimeout(() => setSt('idle'), 2500);
  }

  const add = (preset?: { label: string; emoji: string; url: string }) =>
    rows.length < 10 &&
    setRows([
      ...rows,
      {
        id: newId(),
        label: preset?.label ?? '',
        url: preset?.url ?? '',
        emoji: preset?.emoji ?? '',
      },
    ]);
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
        <span className="font-semibold text-white/90">
          {tp(lang, 'ui.donations.donateEnabled')}
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.donations.titleLabel')}</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
        </label>
      </div>
      <label className="block space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.donations.descLabel')}</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={inputCls}
        />
      </label>

      <div className="space-y-2 rounded-xl border border-line bg-bg/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-white/90">
            {tp(lang, 'ui.donations.linksLabel')} ({rows.length}/10)
          </span>
          <div className="flex flex-wrap gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => add(p)}
                disabled={rows.length >= 10}
                className="rounded-md border border-line px-2 py-1 text-xs transition hover:border-accent hover:bg-elevated disabled:opacity-40"
              >
                {p.emoji} {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => add()}
              disabled={rows.length >= 10}
              className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs transition hover:border-accent hover:bg-elevated disabled:opacity-40"
            >
              <Plus size={12} /> {tp(lang, 'ui.donations.customBtn')}
            </button>
          </div>
        </div>
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-[5rem_1fr_2fr_auto] gap-2">
            <input
              value={r.emoji}
              onChange={(e) => setRow(r.id, { emoji: e.target.value })}
              placeholder="emoji"
              className={inputCls}
              maxLength={64}
            />
            <input
              value={r.label}
              onChange={(e) => setRow(r.id, { label: e.target.value })}
              placeholder={tp(lang, 'ui.donations.namePh')}
              className={inputCls}
              maxLength={80}
            />
            <input
              value={r.url}
              onChange={(e) => setRow(r.id, { url: e.target.value })}
              placeholder="https://…"
              className={inputCls}
              maxLength={300}
            />
            <button
              type="button"
              onClick={() => del(r.id)}
              className="rounded-md border border-line p-2 text-muted transition hover:border-accent hover:text-accent"
              aria-label={tp(lang, 'ui.donations.delAria')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <SaveButton st={st} onClick={save} errorText={errMsg} />
      <p className="text-xs text-muted">
        {tp(lang, 'ui.donations.helpPre')}
        <code className="text-accent">/donate</code>
        {tp(lang, 'ui.donations.helpPost')}
      </p>
    </div>
  );
}
