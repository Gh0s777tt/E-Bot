'use client';

import { ChevronDown, Plus, TerminalSquare, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { CustomCommand } from '../lib/customCommands';
import type { GuildMeta } from '../lib/guild';
import { EMPTY_RICH, type RichMessage } from '../lib/richMessage';
import MessageStudio from './MessageStudio';

const inp =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

function sanitizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 32);
}
function newCmd(): CustomCommand {
  return { name: '', description: '', response: { ...EMPTY_RICH }, ephemeral: false };
}

export default function CustomCommandsForm({
  initial,
  guild,
}: {
  initial: CustomCommand[];
  guild: GuildMeta;
}) {
  const [cmds, setCmds] = useState<CustomCommand[]>(initial);
  const keys = useRef<number[]>(initial.map((_, i) => i + 1)); // stabilne klucze React
  const nextKey = useRef(initial.length + 1);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');

  function toggle(i: number) {
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  }
  function update(i: number, patch: Partial<CustomCommand>) {
    setCmds((cs) => cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }
  function add() {
    keys.current.push(nextKey.current++);
    setCmds((cs) => [...cs, newCmd()]);
    setOpen((s) => new Set(s).add(cmds.length));
  }
  function remove(i: number) {
    keys.current.splice(i, 1);
    setCmds((cs) => cs.filter((_, idx) => idx !== i));
    setOpen(new Set());
  }

  async function save() {
    setSt('saving');
    setMsg('');
    try {
      const r = await fetch('/api/custom-commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands: cmds }),
      });
      const j = (await r.json()) as { ok?: boolean; error?: string; registered?: number };
      if (r.ok && j.ok) {
        setSt('ok');
        setMsg(`Zarejestrowano ${j.registered ?? 0} komend w Discordzie.`);
      } else {
        setSt('err');
        setMsg(j.error || 'Błąd zapisu/rejestracji.');
      }
    } catch {
      setSt('err');
      setMsg('Błąd sieci.');
    }
    setTimeout(() => setSt('idle'), 4000);
  }

  return (
    <div className="space-y-4">
      {cmds.length === 0 && (
        <p className="rounded-lg border border-dashed border-line bg-bg/30 p-6 text-center text-sm text-muted">
          Brak własnych komend. Dodaj pierwszą — pojawi się w Discordzie jako{' '}
          <code>/twoja-nazwa</code>.
        </p>
      )}

      {cmds.map((c, i) => {
        const isOpen = open.has(i);
        return (
          <div key={keys.current[i]} className="rounded-xl border border-line bg-card">
            <div className="flex items-center gap-3 p-3">
              <button
                type="button"
                onClick={() => toggle(i)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <TerminalSquare size={15} className="shrink-0 text-accent" />
                <span className="truncate text-sm font-semibold text-white/90">
                  /{c.name || 'nazwa'}
                </span>
                <span className="truncate text-xs text-muted">
                  · {c.description || 'bez opisu'}
                </span>
                <ChevronDown
                  size={15}
                  className={`ml-auto shrink-0 text-muted transition ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
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
                    <span className="text-muted">Nazwa komendy (bez /)</span>
                    <div className="flex items-center gap-1">
                      <span className="text-muted">/</span>
                      <input
                        value={c.name}
                        onChange={(e) => update(i, { name: sanitizeName(e.target.value) })}
                        placeholder="np. zasady"
                        className={`${inp} font-mono`}
                        maxLength={32}
                      />
                    </div>
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-muted">Opis (widoczny w Discordzie)</span>
                    <input
                      value={c.description}
                      onChange={(e) => update(i, { description: e.target.value })}
                      placeholder="Krótki opis komendy"
                      className={inp}
                      maxLength={100}
                    />
                  </label>
                </div>

                <label className="flex items-center gap-2 text-sm text-muted">
                  <input
                    type="checkbox"
                    checked={c.ephemeral}
                    onChange={(e) => update(i, { ephemeral: e.target.checked })}
                    className="h-4 w-4 accent-accent"
                  />
                  Odpowiedź widoczna tylko dla wywołującego (ephemeral)
                </label>

                <div className="space-y-1 text-sm">
                  <span className="font-semibold text-white/90">Odpowiedź</span>
                  <MessageStudio
                    value={c.response}
                    onChange={(response: RichMessage) => update(i, { response })}
                    emojis={guild.emojis}
                    variables={[
                      { token: '{user}', label: 'Wywołujący (oznaczenie)', sample: '@Gracz' },
                      { token: '{username}', label: 'Nazwa wywołującego', sample: 'Gracz' },
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
          <Plus size={15} /> Dodaj komendę
        </button>
        <button
          type="button"
          onClick={save}
          disabled={st === 'saving'}
          className="rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          {st === 'saving' ? 'Zapisywanie…' : 'Zapisz i zarejestruj'}
        </button>
        {st === 'ok' && <span className="text-sm text-green-400">✓ {msg}</span>}
        {st === 'err' && <span className="text-sm text-accent">{msg}</span>}
      </div>

      <p className="text-xs text-muted">
        Komendy rejestrują się w Discordzie od razu po zapisaniu (komendy serwera). Zmienne{' '}
        {'{user}'} / {'{server}'} / {'{memberCount}'} podstawiane są przy wywołaniu. Nazwa musi być
        unikalna (nie może kolidować z komendą wbudowaną bota).
      </p>
    </div>
  );
}
