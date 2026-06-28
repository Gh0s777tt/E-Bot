'use client';

import { ChevronDown, Plus, TerminalSquare, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { CustomAction, CustomCommand } from '../lib/customCommands';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { EMPTY_RICH, type RichMessage } from '../lib/richMessage';
import { useLang } from './LangContext';
import MessageStudio from './MessageStudio';
import { RoleSelect } from './pickers';

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
  const { lang } = useLang();
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
      const clean = cmds.map((c) => ({
        ...c,
        randomLines: (c.randomLines ?? []).map((s) => s.trim()).filter(Boolean),
      }));
      const r = await fetch('/api/custom-commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands: clean }),
      });
      const j = (await r.json()) as { ok?: boolean; error?: string; registered?: number };
      if (r.ok && j.ok) {
        setSt('ok');
        setMsg(`${tp(lang, 'ui.cc.savedPre')} ${j.registered ?? 0} ${tp(lang, 'ui.cc.savedPost')}`);
      } else {
        setSt('err');
        setMsg(j.error || tp(lang, 'ui.cc.saveError'));
      }
    } catch {
      setSt('err');
      setMsg(tp(lang, 'ui.cc.netError'));
    }
    setTimeout(() => setSt('idle'), 4000);
  }

  return (
    <div className="space-y-4">
      {cmds.length === 0 && (
        <p className="rounded-lg border border-dashed border-line bg-bg/30 p-6 text-center text-sm text-muted">
          {tp(lang, 'ui.cc.emptyPre')} <code>/twoja-nazwa</code>
          {tp(lang, 'ui.cc.emptyPost')}
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
                className="flex min-w-0 flex-1 items-center gap-2 text-start"
              >
                <TerminalSquare size={15} className="shrink-0 text-accent" />
                <span className="truncate text-sm font-semibold text-white/90">
                  /{c.name || tp(lang, 'ui.cc.namePlaceholder')}
                </span>
                <span className="truncate text-xs text-muted">
                  · {c.description || tp(lang, 'ui.cc.noDescription')}
                </span>
                <ChevronDown
                  size={15}
                  className={`ms-auto shrink-0 text-muted transition ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="shrink-0 rounded-md border border-line px-2 py-1.5 text-muted transition hover:border-accent hover:text-accent"
                title={tp(lang, 'ui.cc.delTitle')}
              >
                <Trash2 size={14} />
              </button>
            </div>

            {isOpen && (
              <div className="space-y-4 border-t border-line p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span className="text-muted">{tp(lang, 'ui.cc.nameLabel')}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-muted">/</span>
                      <input
                        value={c.name}
                        onChange={(e) => update(i, { name: sanitizeName(e.target.value) })}
                        placeholder={tp(lang, 'ui.cc.namePh')}
                        className={`${inp} font-mono`}
                        maxLength={32}
                      />
                    </div>
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="text-muted">{tp(lang, 'ui.cc.descLabel')}</span>
                    <input
                      value={c.description}
                      onChange={(e) => update(i, { description: e.target.value })}
                      placeholder={tp(lang, 'ui.cc.descPh')}
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
                  {tp(lang, 'ui.cc.ephemeralLabel')}
                </label>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
                  <label className="flex items-center gap-2">
                    <span>{tp(lang, 'ui.cc.cooldownLabel')}</span>
                    <input
                      type="number"
                      value={c.cooldownSec ?? 0}
                      onChange={(e) =>
                        update(i, {
                          cooldownSec: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                        })
                      }
                      className="w-20 rounded-md border border-line bg-elevated px-3 py-1.5 text-sm outline-none focus:border-accent"
                    />
                  </label>
                  <label className="flex items-center gap-2">
                    <span>{tp(lang, 'ui.cc.categoryLabel')}</span>
                    <input
                      value={c.category ?? ''}
                      onChange={(e) => update(i, { category: e.target.value })}
                      placeholder={tp(lang, 'ui.cc.categoryPh')}
                      maxLength={40}
                      className="w-36 rounded-md border border-line bg-elevated px-3 py-1.5 text-sm outline-none focus:border-accent"
                    />
                  </label>
                </div>

                {/* CC 2.0 — warunek roli + akcje przy użyciu */}
                <div className="space-y-2 rounded-lg border border-line/60 bg-bg/30 p-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {tp(lang, 'ui.cc.condActionsLabel')}
                  </span>
                  <label className="block space-y-1 text-sm">
                    <span className="text-muted">{tp(lang, 'ui.cc.requiredRoleLabel')}</span>
                    <RoleSelect
                      value={c.requiredRoleId ?? ''}
                      onChange={(v) => update(i, { requiredRoleId: v })}
                      roles={guild.roles}
                    />
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">{tp(lang, 'ui.cc.actionsHint')}</span>
                    <button
                      type="button"
                      onClick={() =>
                        (c.actions ?? []).length < 3 &&
                        update(i, {
                          actions: [
                            ...(c.actions ?? []),
                            { kind: 'addRole', roleId: '', amount: 0 },
                          ],
                        })
                      }
                      disabled={(c.actions ?? []).length >= 3}
                      className="rounded-md border border-line px-2 py-1 text-xs transition hover:border-accent hover:bg-elevated disabled:opacity-40"
                    >
                      <Plus size={12} className="inline" /> {tp(lang, 'ui.cc.actionBtn')}
                    </button>
                  </div>
                  {(c.actions ?? []).map((a, ai) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: lista edytowalna po indeksie
                    <div key={ai} className="grid grid-cols-[10rem_1fr_auto] gap-2">
                      <select
                        value={a.kind}
                        onChange={(e) =>
                          update(i, {
                            actions: (c.actions ?? []).map((x, j) =>
                              j === ai ? { ...x, kind: e.target.value as CustomAction['kind'] } : x,
                            ),
                          })
                        }
                        className="rounded-md border border-line bg-elevated px-2 py-2 text-sm outline-none focus:border-accent"
                      >
                        <option value="addRole">{tp(lang, 'ui.cc.actAddRole')}</option>
                        <option value="removeRole">{tp(lang, 'ui.cc.actRemoveRole')}</option>
                        <option value="giveMoney">{tp(lang, 'ui.cc.actGiveMoney')}</option>
                        <option value="giveXp">{tp(lang, 'ui.cc.actGiveXp')}</option>
                      </select>
                      {a.kind === 'addRole' || a.kind === 'removeRole' ? (
                        <RoleSelect
                          value={a.roleId ?? ''}
                          onChange={(v) =>
                            update(i, {
                              actions: (c.actions ?? []).map((x, j) =>
                                j === ai ? { ...x, roleId: v } : x,
                              ),
                            })
                          }
                          roles={guild.roles}
                        />
                      ) : (
                        <input
                          type="number"
                          value={a.amount ?? 0}
                          onChange={(e) =>
                            update(i, {
                              actions: (c.actions ?? []).map((x, j) =>
                                j === ai
                                  ? {
                                      ...x,
                                      amount: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                                    }
                                  : x,
                              ),
                            })
                          }
                          className={inp}
                          placeholder={tp(lang, 'ui.cc.amountPh')}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          update(i, { actions: (c.actions ?? []).filter((_, j) => j !== ai) })
                        }
                        className="rounded-md border border-line p-2 text-muted transition hover:border-accent hover:text-accent"
                        aria-label={tp(lang, 'ui.cc.delActionAria')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Argumenty komendy — wartości wstawisz w odpowiedzi jako {nazwa} */}
                <div className="space-y-2 rounded-lg border border-line/60 bg-bg/30 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {tp(lang, 'ui.cc.argsLabel')}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        update(i, {
                          options: [
                            ...(c.options ?? []),
                            { name: '', description: '', required: false },
                          ],
                        })
                      }
                      className="rounded-md border border-line px-2 py-1 text-xs transition hover:border-accent hover:bg-elevated"
                    >
                      {tp(lang, 'ui.cc.addArgBtn')}
                    </button>
                  </div>
                  {(c.options ?? []).map((o, oi) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: proste wiersze argumentów bez stanu wewnętrznego
                    <div key={oi} className="flex flex-wrap items-center gap-2">
                      <input
                        value={o.name}
                        onChange={(e) =>
                          update(i, {
                            options: (c.options ?? []).map((x, xi) =>
                              xi === oi ? { ...x, name: sanitizeName(e.target.value) } : x,
                            ),
                          })
                        }
                        placeholder={tp(lang, 'ui.cc.argNamePh')}
                        className={`${inp} w-28 font-mono`}
                        maxLength={32}
                      />
                      <input
                        value={o.description}
                        onChange={(e) =>
                          update(i, {
                            options: (c.options ?? []).map((x, xi) =>
                              xi === oi ? { ...x, description: e.target.value } : x,
                            ),
                          })
                        }
                        placeholder={tp(lang, 'ui.cc.argDescPh')}
                        className={`${inp} flex-1`}
                        maxLength={100}
                      />
                      <label className="flex items-center gap-1 text-xs text-muted">
                        <input
                          type="checkbox"
                          checked={o.required}
                          onChange={(e) =>
                            update(i, {
                              options: (c.options ?? []).map((x, xi) =>
                                xi === oi ? { ...x, required: e.target.checked } : x,
                              ),
                            })
                          }
                          className="h-3.5 w-3.5 accent-accent"
                        />
                        {tp(lang, 'ui.cc.argRequired')}
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          update(i, { options: (c.options ?? []).filter((_, xi) => xi !== oi) })
                        }
                        className="rounded-md border border-line px-2 py-1.5 text-muted transition hover:border-accent hover:text-accent"
                        title={tp(lang, 'ui.cc.delArgTitle')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <label className="space-y-1 text-sm">
                  <span className="font-semibold text-white/90">
                    {tp(lang, 'ui.cc.respTypeLabel')}
                  </span>
                  <select
                    value={c.type ?? 'message'}
                    onChange={(e) => update(i, { type: e.target.value as CustomCommand['type'] })}
                    className={inp}
                  >
                    <option value="message">{tp(lang, 'ui.cc.typeMessage')}</option>
                    <option value="random">{tp(lang, 'ui.cc.typeRandom')}</option>
                    <option value="role">{tp(lang, 'ui.cc.typeRole')}</option>
                    <option value="help">{tp(lang, 'ui.cc.typeHelp')}</option>
                  </select>
                </label>

                {(c.type ?? 'message') === 'message' && (
                  <div className="space-y-1 text-sm">
                    <span className="font-semibold text-white/90">
                      {tp(lang, 'ui.cc.responseLabel')}
                    </span>
                    <MessageStudio
                      value={c.response}
                      onChange={(response: RichMessage) => update(i, { response })}
                      emojis={guild.emojis}
                      variables={[
                        {
                          token: '{user}',
                          label: tp(lang, 'ui.cc.varCallerMention'),
                          sample: '@Gracz',
                        },
                        {
                          token: '{username}',
                          label: tp(lang, 'ui.cc.varCallerName'),
                          sample: 'Gracz',
                        },
                        {
                          token: '{server}',
                          label: tp(lang, 'ui.cc.varServerName'),
                          sample: 'E-Forge',
                        },
                        {
                          token: '{memberCount}',
                          label: tp(lang, 'ui.cc.varMemberCount'),
                          sample: '1234',
                        },
                        ...(c.options ?? [])
                          .filter((o) => o.name)
                          .map((o) => ({
                            token: `{${o.name}}`,
                            label: `${tp(lang, 'ui.cc.varArgument')} ${o.name}`,
                            sample: o.description || o.name,
                          })),
                      ]}
                    />
                  </div>
                )}

                {c.type === 'random' && (
                  <label className="space-y-1 text-sm">
                    <span className="font-semibold text-white/90">
                      {tp(lang, 'ui.cc.randomLabel')}
                    </span>
                    <textarea
                      value={(c.randomLines ?? []).join('\n')}
                      onChange={(e) => update(i, { randomLines: e.target.value.split('\n') })}
                      rows={4}
                      placeholder={tp(lang, 'ui.cc.randomPh')}
                      className={inp}
                    />
                    <span className="text-[11px] text-muted">{tp(lang, 'ui.cc.randomHint')}</span>
                  </label>
                )}

                {c.type === 'role' && (
                  <label className="space-y-1 text-sm">
                    <span className="font-semibold text-white/90">
                      {tp(lang, 'ui.cc.roleLabel')}
                    </span>
                    <RoleSelect
                      value={c.roleId ?? ''}
                      onChange={(v) => update(i, { roleId: v })}
                      roles={guild.roles}
                      placeholder={tp(lang, 'ui.cc.rolePh')}
                    />
                    <span className="text-[11px] text-muted">{tp(lang, 'ui.cc.roleHint')}</span>
                  </label>
                )}

                {c.type === 'help' && (
                  <p className="rounded-lg border border-line/60 bg-bg/30 p-2.5 text-[11px] text-muted">
                    {tp(lang, 'ui.cc.helpInfoPre')} <code>pomoc</code>{' '}
                    {tp(lang, 'ui.cc.helpInfoMid')} <code>komendy</code>
                    {tp(lang, 'ui.cc.helpInfoPost')}
                  </p>
                )}
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
          <Plus size={15} /> {tp(lang, 'ui.cc.addCmdBtn')}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={st === 'saving'}
          className="rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          {st === 'saving' ? tp(lang, 'ui.cc.saving') : tp(lang, 'ui.cc.saveRegister')}
        </button>
        {st === 'ok' && <span className="text-sm text-green-400">✓ {msg}</span>}
        {st === 'err' && <span className="text-sm text-accent">{msg}</span>}
      </div>

      <p className="text-xs text-muted">{tp(lang, 'ui.cc.footer')}</p>
    </div>
  );
}
