'use client';

import { CalendarClock, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { GuildMeta } from '../lib/guild';
import { EMPTY_RICH, type RichMessage } from '../lib/richMessage';
import type { ScheduledPost } from '../lib/scheduledPosts';
import MessageStudio from './MessageStudio';
import { ChannelSelect } from './pickers';

const inp =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const WEEKDAYS = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];

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

function summary(p: ScheduledPost): string {
  if (p.mode === 'once')
    return p.runAt
      ? `jednorazowo · ${toLocalInput(p.runAt).replace('T', ' ')}`
      : 'jednorazowo · brak daty';
  if (p.mode === 'weekly') return `co tydzień · ${WEEKDAYS[p.weekday ?? 0]} ${p.time ?? '--:--'}`;
  return `codziennie · ${p.time ?? '--:--'}`;
}

export default function ScheduledPostsForm({
  initial,
  guild,
}: {
  initial: ScheduledPost[];
  guild: GuildMeta;
}) {
  const [posts, setPosts] = useState<ScheduledPost[]>(initial);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

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
      const j = (await r.json()) as { ok?: boolean };
      setSt(r.ok && j.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 && (
        <p className="rounded-lg border border-dashed border-line bg-bg/30 p-6 text-center text-sm text-muted">
          Brak zaplanowanych postów. Dodaj pierwszy, aby bot wysyłał ogłoszenia automatycznie.
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
                title={p.enabled ? 'Włączony' : 'Wyłączony'}
              />
              <button
                type="button"
                onClick={() => toggleOpen(p.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <CalendarClock size={15} className="shrink-0 text-accent" />
                <span className="truncate text-sm font-semibold text-white/90">
                  {p.label || 'Bez nazwy'}
                </span>
                <span className="truncate text-xs text-muted">· {summary(p)}</span>
                <ChevronDown
                  size={15}
                  className={`ml-auto shrink-0 text-muted transition ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="shrink-0 rounded-md border border-line px-2 py-1.5 text-muted transition hover:border-accent hover:text-accent"
                title="Usuń"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {isOpen && (
              <div className="space-y-4 border-t border-line p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span className="text-muted">Nazwa (tylko dla Ciebie)</span>
                    <input
                      value={p.label}
                      onChange={(e) => update(p.id, { label: e.target.value })}
                      placeholder="np. Cotygodniowe podsumowanie"
                      className={inp}
                      maxLength={80}
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-muted">Kanał</span>
                    <ChannelSelect
                      value={p.channelId}
                      onChange={(v) => update(p.id, { channelId: v })}
                      channels={guild.channels}
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="space-y-1 text-sm">
                    <span className="text-muted">Tryb</span>
                    <select
                      value={p.mode}
                      onChange={(e) =>
                        update(p.id, { mode: e.target.value as ScheduledPost['mode'] })
                      }
                      className={inp}
                    >
                      <option value="once">Jednorazowo</option>
                      <option value="daily">Codziennie</option>
                      <option value="weekly">Co tydzień</option>
                    </select>
                  </label>

                  {p.mode === 'once' ? (
                    <label className="space-y-1 text-sm sm:col-span-2">
                      <span className="text-muted">Data i godzina (Twoja strefa)</span>
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
                          <span className="text-muted">Dzień tygodnia</span>
                          <select
                            value={p.weekday ?? 1}
                            onChange={(e) => update(p.id, { weekday: Number(e.target.value) })}
                            className={inp}
                          >
                            {WEEKDAYS.map((d, i) => (
                              <option key={d} value={i}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      <label className="space-y-1 text-sm">
                        <span className="text-muted">Godzina (HH:MM)</span>
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
                  <span className="font-semibold text-white/90">Treść wiadomości</span>
                  <MessageStudio
                    value={p.message}
                    onChange={(message: RichMessage) => update(p.id, { message })}
                    emojis={guild.emojis}
                    allowV2
                    variables={[
                      { token: '{server}', label: 'Nazwa serwera', sample: 'GH0ST EMPIRE' },
                      { token: '{memberCount}', label: 'Liczba członków', sample: '1234' },
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
          onClick={add}
          className="flex items-center gap-1.5 rounded-md border border-line px-4 py-2 text-sm font-semibold transition hover:border-accent hover:bg-elevated"
        >
          <Plus size={15} /> Dodaj zaplanowany post
        </button>
        <button
          type="button"
          onClick={save}
          disabled={st === 'saving'}
          className="rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          {st === 'saving' ? 'Zapisywanie…' : 'Zapisz wszystko'}
        </button>
        {st === 'ok' && <span className="text-sm text-green-400">✓ Zapisano</span>}
        {st === 'err' && <span className="text-sm text-accent">Błąd zapisu</span>}
      </div>

      <p className="text-xs text-muted">
        Godziny w Twojej strefie czasowej (Europe/Warsaw). Tryb „codziennie/co tydzień" wysyła raz w
        danym dniu w oknie do 10 min od ustawionej godziny. Zmienne {'{server}'} / {'{memberCount}'}{' '}
        podstawiane są realnymi danymi serwera.
      </p>
    </div>
  );
}
