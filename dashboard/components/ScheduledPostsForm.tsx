'use client';

import { CalendarClock, ChevronDown, Plus, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Tier } from '../lib/billing';
import type { GuildMeta } from '../lib/guild';
import { type PanelLocale, tp } from '../lib/panelI18n';
import { EMPTY_RICH, type RichMessage } from '../lib/richMessage';
import { saveConfig } from '../lib/saveConfig';
import type { ScheduledPost } from '../lib/scheduledPosts';
import { useLang } from './LangContext';
import MessageStudio from './MessageStudio';
import { ChannelSelect } from './pickers';
import UsageMeter from './UsageMeter';

const inp =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const WEEKDAY_KEYS = [
  'ui.scheduled.weekday0',
  'ui.scheduled.weekday1',
  'ui.scheduled.weekday2',
  'ui.scheduled.weekday3',
  'ui.scheduled.weekday4',
  'ui.scheduled.weekday5',
  'ui.scheduled.weekday6',
];

function toLocalInput(ms?: number): string {
  if (!ms) return '';
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function fromLocalInput(s: string): number | undefined {
  if (!s) return undefined;
  const t = new Date(s).getTime();
  return Number.isNaN(t) ? undefined : t;
}

function newPost(): ScheduledPost {
  return {
    id: crypto.randomUUID(),
    enabled: true,
    label: '',
    channelId: '',
    message: { ...EMPTY_RICH },
    mode: 'daily',
    time: '12:00',
    weekday: 1,
  };
}

function summary(p: ScheduledPost, lang: PanelLocale): string {
  if (p.mode === 'once')
    return p.runAt
      ? `${tp(lang, 'ui.scheduled.sumOnce')} · ${toLocalInput(p.runAt).replace('T', ' ')}`
      : `${tp(lang, 'ui.scheduled.sumOnce')} · ${tp(lang, 'ui.scheduled.sumNoDate')}`;
  if (p.mode === 'weekly')
    return `${tp(lang, 'ui.scheduled.sumWeekly')} · ${tp(lang, WEEKDAY_KEYS[p.weekday ?? 0])} ${p.time ?? '--:--'}`;
  return `${tp(lang, 'ui.scheduled.sumDaily')} · ${p.time ?? '--:--'}`;
}

export default function ScheduledPostsForm({
  initial,
  guild,
  tier,
  freeLimit,
  premiumLimit,
  billingOn,
}: {
  initial: ScheduledPost[];
  guild: GuildMeta;
  tier: Tier;
  freeLimit: number;
  premiumLimit: number;
  billingOn: boolean;
}) {
  const { lang } = useLang();
  const [posts, setPosts] = useState<ScheduledPost[]>(initial);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');
  // „Wyślij teraz" (B3 fala 1): per-post status zlecenia ręcznej wysyłki (bot odbiera ≤60 s).
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);
  const [sendErr, setSendErr] = useState('');

  async function sendNow(id: string) {
    if (sendingId) return;
    setSendingId(id);
    setSendErr('');
    const res = await saveConfig('/api/scheduled-posts/send-now', { id });
    setSendingId(null);
    if (res.ok) {
      setSentId(id);
      setTimeout(() => setSentId((s) => (s === id ? null : s)), 5000);
    } else {
      setSendErr(res.error || tp(lang, 'ui.saveError'));
    }
  }

  function toggleOpen(id: string) {
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  function update(id: string, patch: Partial<ScheduledPost>) {
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  function add() {
    const p = newPost();
    setPosts((ps) => [...ps, p]);
    setOpen((s) => new Set(s).add(p.id));
  }
  function remove(id: string) {
    setPosts((ps) => ps.filter((p) => p.id !== id));
  }

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/scheduled-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts }),
      });
      const j = (await r.json()) as { ok?: boolean; error?: string };
      if (r.ok && j.ok) setSt('ok');
      else {
        setErrMsg(j.error || '');
        setSt('err');
      }
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  return (
    <div className="space-y-4">
      <UsageMeter
        used={posts.length}
        freeLimit={freeLimit}
        premiumLimit={premiumLimit}
        tier={tier}
        billingOn={billingOn}
      />

      {posts.length === 0 && (
        <p className="rounded-lg border border-dashed border-line bg-bg/30 p-6 text-center text-sm text-muted">
          {tp(lang, 'ui.scheduled.emptyState')}
        </p>
      )}

      {posts.map((p) => {
        const isOpen = open.has(p.id);
        return (
          <div key={p.id} className="rounded-xl border border-line bg-card">
            {/* Nagłówek karty */}
            <div className="flex items-center gap-3 p-3">
              <input
                type="checkbox"
                checked={p.enabled}
                onChange={(e) => update(p.id, { enabled: e.target.checked })}
                className="h-4 w-4 shrink-0 accent-accent"
                title={
                  p.enabled ? tp(lang, 'ui.scheduled.titleOn') : tp(lang, 'ui.scheduled.titleOff')
                }
              />
              <button
                type="button"
                onClick={() => toggleOpen(p.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-start"
              >
                <CalendarClock size={15} className="shrink-0 text-accent" />
                <span className="truncate text-sm font-semibold text-white/90">
                  {p.label || tp(lang, 'ui.scheduled.noName')}
                </span>
                <span className="truncate text-xs text-muted">· {summary(p, lang)}</span>
                <ChevronDown
                  size={15}
                  className={`ms-auto shrink-0 text-muted transition ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <button
                type="button"
                onClick={() => sendNow(p.id)}
                disabled={!p.channelId || sendingId !== null}
                className={`shrink-0 rounded-md border border-line px-2 py-1.5 transition disabled:opacity-40 ${
                  sentId === p.id
                    ? 'border-green-500/50 text-green-400'
                    : 'text-muted hover:border-accent hover:text-accent'
                }`}
                title={
                  sentId === p.id
                    ? tp(lang, 'ui.scheduled.sendNowOk')
                    : tp(lang, 'ui.scheduled.sendNow')
                }
              >
                <Send size={14} className={sendingId === p.id ? 'animate-pulse' : ''} />
              </button>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="shrink-0 rounded-md border border-line px-2 py-1.5 text-muted transition hover:border-accent hover:text-accent"
                title={tp(lang, 'ui.scheduled.remove')}
              >
                <Trash2 size={14} />
              </button>
            </div>

            {isOpen && (
              <div className="space-y-4 border-t border-line p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span className="text-muted">{tp(lang, 'ui.scheduled.labelName')}</span>
                    <input
                      value={p.label}
                      onChange={(e) => update(p.id, { label: e.target.value })}
                      placeholder={tp(lang, 'ui.scheduled.labelNamePh')}
                      className={inp}
                      maxLength={80}
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-muted">{tp(lang, 'ui.scheduled.channel')}</span>
                    <ChannelSelect
                      value={p.channelId}
                      onChange={(v) => update(p.id, { channelId: v })}
                      channels={guild.channels}
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="space-y-1 text-sm">
                    <span className="text-muted">{tp(lang, 'ui.scheduled.mode')}</span>
                    <select
                      value={p.mode}
                      onChange={(e) =>
                        update(p.id, { mode: e.target.value as ScheduledPost['mode'] })
                      }
                      className={inp}
                    >
                      <option value="once">{tp(lang, 'ui.scheduled.modeOnce')}</option>
                      <option value="daily">{tp(lang, 'ui.scheduled.modeDaily')}</option>
                      <option value="weekly">{tp(lang, 'ui.scheduled.modeWeekly')}</option>
                    </select>
                  </label>

                  {p.mode === 'once' ? (
                    <label className="space-y-1 text-sm sm:col-span-2">
                      <span className="text-muted">{tp(lang, 'ui.scheduled.onceDate')}</span>
                      <input
                        type="datetime-local"
                        value={toLocalInput(p.runAt)}
                        onChange={(e) => update(p.id, { runAt: fromLocalInput(e.target.value) })}
                        className={inp}
                      />
                    </label>
                  ) : (
                    <>
                      {p.mode === 'weekly' && (
                        <label className="space-y-1 text-sm">
                          <span className="text-muted">
                            {tp(lang, 'ui.scheduled.weekdayLabel')}
                          </span>
                          <select
                            value={p.weekday ?? 1}
                            onChange={(e) => update(p.id, { weekday: Number(e.target.value) })}
                            className={inp}
                          >
                            {WEEKDAY_KEYS.map((key, i) => (
                              <option key={key} value={i}>
                                {tp(lang, key)}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      <label className="space-y-1 text-sm">
                        <span className="text-muted">{tp(lang, 'ui.scheduled.timeLabel')}</span>
                        <input
                          type="time"
                          value={p.time ?? '12:00'}
                          onChange={(e) => update(p.id, { time: e.target.value })}
                          className={inp}
                        />
                      </label>
                    </>
                  )}
                </div>

                <div className="space-y-1 text-sm">
                  <span className="font-semibold text-white/90">
                    {tp(lang, 'ui.scheduled.content')}
                  </span>
                  <MessageStudio
                    value={p.message}
                    onChange={(message: RichMessage) => update(p.id, { message })}
                    emojis={guild.emojis}
                    allowV2
                    variables={[
                      {
                        token: '{server}',
                        label: tp(lang, 'ui.scheduled.varServer'),
                        sample: 'E-Forge',
                      },
                      {
                        token: '{memberCount}',
                        label: tp(lang, 'ui.scheduled.varMemberCount'),
                        sample: '1234',
                      },
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={billingOn && tier === 'free' && posts.length >= freeLimit}
          onClick={add}
          className="flex items-center gap-1.5 rounded-md border border-line px-4 py-2 text-sm font-semibold transition hover:border-accent hover:bg-elevated disabled:opacity-40"
        >
          <Plus size={15} /> {tp(lang, 'ui.scheduled.addPost')}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={st === 'saving'}
          className="rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          {st === 'saving' ? tp(lang, 'ui.saving') : tp(lang, 'ui.scheduled.saveAll')}
        </button>
        {st === 'ok' && <span className="text-sm text-green-400">{tp(lang, 'ui.saved')}</span>}
        {st === 'err' && (
          <span className="text-sm text-accent">{errMsg || tp(lang, 'ui.saveError')}</span>
        )}
      </div>

      {sentId && <p className="text-xs text-green-400">✓ {tp(lang, 'ui.scheduled.sendNowOk')}</p>}
      {sendErr && <p className="text-xs text-accent">{sendErr}</p>}
      <p className="text-xs text-muted">{tp(lang, 'ui.scheduled.footNote')}</p>
    </div>
  );
}
