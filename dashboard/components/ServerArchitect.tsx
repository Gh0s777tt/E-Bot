'use client';

import { Check, Hammer, Loader2, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { tp } from '../lib/panelI18n';
import { buildPlan, PROV_BLOCKS, type ProvBlock } from '../lib/setup';
import { useLang } from './LangContext';

type LogItem = { label: string; ok: boolean; detail?: string };
const PRESET_KEY: Record<string, string> = {
  streamer: 'ui.setup.presetStreamer',
  gaming: 'ui.setup.presetGaming',
  community: 'ui.setup.presetCommunity',
};

export default function ServerArchitect() {
  const { lang } = useLang();
  const [sel, setSel] = useState<Set<ProvBlock>>(new Set());
  const [st, setSt] = useState<'idle' | 'working' | 'done' | 'err'>('idle');
  const [log, setLog] = useState<LogItem[]>([]);
  const [desc, setDesc] = useState('');
  const [aiSt, setAiSt] = useState<'idle' | 'thinking' | 'err'>('idle');
  const [aiPreset, setAiPreset] = useState<string | null>(null);

  async function aiSuggest() {
    if (desc.trim().length < 3) return;
    setAiSt('thinking');
    setAiPreset(null);
    try {
      const r = await fetch('/api/setup/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc.trim() }),
      });
      const d = (await r.json()) as { ok?: boolean; preset?: string | null; blocks?: ProvBlock[] };
      if (!r.ok || !d.ok) {
        setAiSt('err');
        return;
      }
      setSel(new Set(d.blocks ?? []));
      setAiPreset(d.preset ?? null);
      setAiSt('idle');
    } catch {
      setAiSt('err');
    }
  }

  function toggle(b: ProvBlock) {
    setSel((s) => {
      const n = new Set(s);
      if (n.has(b)) n.delete(b);
      else n.add(b);
      return n;
    });
  }

  async function run() {
    if (!sel.size) return;
    setSt('working');
    setLog([]);
    try {
      const r = await fetch('/api/setup/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: [...sel] }),
      });
      const d = (await r.json()) as { ok?: boolean; id?: string };
      if (!r.ok || !d.ok || !d.id) {
        setSt('err');
        return;
      }
      for (let i = 0; i < 40; i++) {
        await new Promise((res) => setTimeout(res, 2500));
        const g = (await fetch(`/api/setup/provision?id=${encodeURIComponent(d.id)}`)
          .then((x) => x.json())
          .catch(() => ({ done: false }))) as { done?: boolean; log?: LogItem[] };
        if (g.done) {
          setLog(g.log ?? []);
          setSt('done');
          return;
        }
      }
      setSt('err'); // timeout — bot offline?
    } catch {
      setSt('err');
    }
  }

  const working = st === 'working';
  const preview = useMemo(() => buildPlan([...sel], 'preview'), [sel]);
  const icon = (k: string) => (k === 'voice' ? '🔊' : k === 'announcement' ? '📣' : '#');

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {tp(lang, 'ui.setup.saIntroPre')} <strong>{tp(lang, 'ui.setup.saIntroStrong')}</strong>{' '}
        {tp(lang, 'ui.setup.saIntroMid')} <em>{tp(lang, 'ui.setup.saIntroPerm1')}</em>{' '}
        {tp(lang, 'ui.setup.saIntroAnd')} <em>{tp(lang, 'ui.setup.saIntroPerm2')}</em>
        {tp(lang, 'ui.setup.saIntroEnd')}
      </p>

      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/90">
          <Sparkles size={16} className="text-accent" /> {tp(lang, 'ui.setup.aiTitle')}
        </div>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={tp(lang, 'ui.setup.aiPlaceholder')}
          rows={2}
          className="w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={aiSuggest}
            disabled={aiSt === 'thinking' || desc.trim().length < 3}
            className="inline-flex items-center gap-2 rounded-md border border-accent/50 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-50"
          >
            {aiSt === 'thinking' ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Sparkles size={15} />
            )}
            {aiSt === 'thinking' ? tp(lang, 'ui.setup.aiThinking') : tp(lang, 'ui.setup.aiSuggest')}
          </button>
          {aiPreset && (
            <span className="text-sm text-muted">
              {tp(lang, 'ui.setup.aiSuggestedPre')}{' '}
              <strong className="text-white">
                {PRESET_KEY[aiPreset] ? tp(lang, PRESET_KEY[aiPreset]) : aiPreset}
              </strong>{' '}
              {tp(lang, 'ui.setup.aiSuggestedPost')}
            </span>
          )}
          {aiSt === 'err' && (
            <span className="text-sm text-accent">{tp(lang, 'ui.setup.aiUnavailable')}</span>
          )}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {PROV_BLOCKS.map((b) => {
          const on = sel.has(b.id);
          return (
            <button
              key={b.id}
              type="button"
              disabled={working}
              onClick={() => toggle(b.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition disabled:opacity-50 ${
                on ? 'border-accent bg-accent/10' : 'border-line bg-bg/40 hover:border-accent/40'
              }`}
            >
              <span className="text-xl">{b.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{b.label}</span>
                <span className="block truncate text-xs text-muted">{b.desc}</span>
              </span>
              {on && <Check size={16} className="shrink-0 text-accent" />}
            </button>
          );
        })}
      </div>

      {sel.size > 0 && (
        <div className="rounded-xl border border-line bg-bg/40 p-4">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-muted">
            {tp(lang, 'ui.setup.saPreviewLabel')}
          </div>
          {preview.roles.length > 0 && (
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted">{tp(lang, 'ui.setup.saRolesLabel')}</span>
              {preview.roles.map((r) => (
                <span key={r.name} className="rounded bg-elevated px-2 py-0.5 text-xs">
                  @{r.name}
                </span>
              ))}
            </div>
          )}
          <div className="space-y-0.5 font-mono text-xs">
            {preview.categories.map((cat) => (
              <div key={cat.key}>
                <div className="text-muted">▸ {cat.name}</div>
                {preview.channels
                  .filter((ch) => ch.categoryKey === cat.key)
                  .map((ch) => (
                    <div key={ch.name} className="ml-4">
                      {icon(ch.kind)} {ch.name}
                    </div>
                  ))}
              </div>
            ))}
            {preview.channels
              .filter((ch) => !ch.categoryKey)
              .map((ch) => (
                <div key={ch.name}>
                  {icon(ch.kind)} {ch.name}
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={run}
          disabled={!sel.size || working}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          {working ? <Loader2 size={16} className="animate-spin" /> : <Hammer size={16} />}
          {working ? tp(lang, 'ui.setup.creating') : tp(lang, 'ui.setup.createStructure')}
        </button>
        {st === 'done' && (
          <span className="text-sm text-green-400">✓ {tp(lang, 'ui.setup.saDone')}</span>
        )}
        {st === 'err' && (
          <span className="text-sm text-accent">{tp(lang, 'ui.setup.saErrTimeout')}</span>
        )}
      </div>

      {(working || log.length > 0) && (
        <div className="rounded-xl border border-line bg-bg/40 p-3">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-muted">
            {tp(lang, 'ui.setup.logLabel')}
          </div>
          {working && !log.length && (
            <p className="text-sm text-muted">{tp(lang, 'ui.setup.waitingBot')}</p>
          )}
          <ul className="space-y-1 text-sm">
            {log.map((l) => (
              <li key={l.label} className="flex items-center gap-2">
                {l.ok ? (
                  <Check size={15} className="shrink-0 text-green-400" />
                ) : (
                  <X size={15} className="shrink-0 text-accent" />
                )}
                <span className="flex-1">{l.label}</span>
                {l.detail && <span className="text-xs text-muted">{l.detail}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
