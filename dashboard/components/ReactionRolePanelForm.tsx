'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ReactionPanel } from '../lib/faza4';
import type { GuildMeta } from '../lib/guild';
import { normalizeRich, type RichMessage } from '../lib/richMessage';
import MessageStudio from './MessageStudio';
import { RoleSelect } from './pickers';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

type Pair = { id: string; emoji: string; roleId: string };
const newId = () => crypto.randomUUID().slice(0, 8);

export default function ReactionRolePanelForm({
  initial,
  guild,
}: {
  initial: ReactionPanel;
  guild: GuildMeta;
}) {
  const [spec, setSpec] = useState<RichMessage>(normalizeRich(initial.panelSpec));
  const [pairs, setPairs] = useState<Pair[]>(() =>
    initial.pairs.map((p, i) => ({ id: `p${i}`, emoji: p.emoji, roleId: p.roleId })),
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const payload: ReactionPanel = {
        panelSpec: spec,
        pairs: pairs
          .map(({ emoji, roleId }) => ({ emoji: emoji.trim(), roleId }))
          .filter((p) => p.emoji && p.roleId),
      };
      const r = await fetch('/api/reaction-roles/panel', {
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

  const addPair = () =>
    pairs.length < 20 && setPairs([...pairs, { id: newId(), emoji: '', roleId: '' }]);
  const setPair = (id: string, patch: Partial<Pair>) =>
    setPairs(pairs.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const delPair = (id: string) => setPairs(pairs.filter((p) => p.id !== id));

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        Tryb „utwórz": bot publikuje tę wiadomość (embed z edytora) komendą{' '}
        <code className="text-accent">/reactionpanel</code> i sam dodaje reakcje wg par poniżej.
      </p>

      <div className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">Wiadomość panelu</span>
        <MessageStudio value={spec} onChange={setSpec} emojis={guild.emojis} />
      </div>

      <div className="space-y-2 rounded-xl border border-line bg-bg/40 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">Pary emoji → rola (max 20)</span>
          <button
            type="button"
            onClick={addPair}
            disabled={pairs.length >= 20}
            className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated disabled:opacity-40"
          >
            <Plus size={12} /> Dodaj
          </button>
        </div>
        {pairs.length === 0 && (
          <p className="text-xs text-muted">Brak par. Dodaj emoji (zwykłe lub serwerowe) i rolę.</p>
        )}
        {pairs.map((p) => (
          <div key={p.id} className="grid grid-cols-[110px_1fr_auto] gap-2">
            <input
              value={p.emoji}
              onChange={(e) => setPair(p.id, { emoji: e.target.value })}
              placeholder="emoji"
              className={inputCls}
              maxLength={64}
            />
            <RoleSelect
              value={p.roleId}
              onChange={(v) => setPair(p.id, { roleId: v })}
              roles={guild.roles}
            />
            <button
              type="button"
              onClick={() => delPair(p.id)}
              className="rounded-md border border-line p-2 text-muted transition hover:border-accent hover:text-accent"
              aria-label="Usuń"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
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
      <p className="text-xs text-muted">
        Po zapisie wejdź na docelowy kanał i odpal{' '}
        <code className="text-accent">/reactionpanel</code> — bot wyśle wiadomość i doda reakcje.
        Emoji serwerowe wstaw przez picker w edytorze (lub <code>{'<:nazwa:id>'}</code>).
      </p>
    </div>
  );
}
