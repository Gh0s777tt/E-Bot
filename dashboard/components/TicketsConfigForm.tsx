'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { TicketCategory } from '../lib/faza4';
import type { GuildMeta } from '../lib/guild';
import { fromLegacy, normalizeRich, type RichMessage } from '../lib/richMessage';
import MessageStudio from './MessageStudio';
import { ChannelSelect, RoleSelect } from './pickers';

type Cfg = {
  enabled: boolean;
  categoryId: string;
  supportRoleId: string;
  welcome: string;
  logChannelId: string;
  panelMessage: string;
  panelSpec: RichMessage;
  categories: TicketCategory[];
  ratingEnabled: boolean;
  slaHours: number;
  questions: string[];
};

type Init = Omit<Cfg, 'panelSpec' | 'categories' | 'questions'> & {
  panelSpec?: RichMessage;
  categories?: TicketCategory[];
  questions?: string[];
};

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

const STYLES: { value: TicketCategory['style']; label: string }[] = [
  { value: 'primary', label: 'Niebieski' },
  { value: 'secondary', label: 'Szary' },
  { value: 'success', label: 'Zielony' },
  { value: 'danger', label: 'Czerwony' },
];

export default function TicketsConfigForm({ initial, guild }: { initial: Init; guild: GuildMeta }) {
  const [c, setC] = useState<Cfg>({
    ...initial,
    panelSpec: initial.panelSpec
      ? normalizeRich(initial.panelSpec)
      : fromLegacy(initial.panelMessage),
    categories: initial.categories ?? [],
    questions: initial.questions ?? [],
  });
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...c,
          panelMessage: c.panelSpec.content || c.panelMessage,
          questions: c.questions.map((q) => q.trim()).filter(Boolean),
        }),
      });
      setSt(r.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  function addCategory() {
    if (c.categories.length >= 10) return;
    const id = crypto.randomUUID().slice(0, 8);
    setC({
      ...c,
      categories: [
        ...c.categories,
        { id, label: '', emoji: '', style: 'primary', supportRoleId: '', welcome: '' },
      ],
    });
  }
  function setCategory(id: string, patch: Partial<TicketCategory>) {
    setC({ ...c, categories: c.categories.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  }
  function removeCategory(id: string) {
    setC({ ...c, categories: c.categories.filter((x) => x.id !== id) });
  }

  return (
    <div className="max-w-2xl space-y-5">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={c.enabled}
          onChange={(e) => setC({ ...c, enabled: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">System ticketów włączony</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Kategoria kanałów (Discord)</span>
          <ChannelSelect
            value={c.categoryId}
            onChange={(v) => setC({ ...c, categoryId: v })}
            channels={guild.channels}
            kind="category"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Domyślna rola obsługi</span>
          <RoleSelect
            value={c.supportRoleId}
            onChange={(v) => setC({ ...c, supportRoleId: v })}
            roles={guild.roles}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Kanał logów</span>
          <ChannelSelect
            value={c.logChannelId}
            onChange={(v) => setC({ ...c, logChannelId: v })}
            channels={guild.channels}
          />
        </label>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-semibold text-white/90">
          Domyślna wiadomość powitalna w ticketcie
        </span>
        <textarea
          value={c.welcome}
          onChange={(e) => setC({ ...c, welcome: e.target.value })}
          rows={2}
          className={inputCls}
          placeholder="Dzięki za zgłoszenie! {user} — obsługa odezwie się wkrótce."
        />
        <span className="text-xs text-muted">
          Zmienne: {'{user}'}, {'{subject}'}. Używana, gdy kategoria nie ma własnej.
        </span>
      </label>

      <div className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">
          Wiadomość panelu (komenda <code className="text-accent">/ticketpanel</code>)
        </span>
        <MessageStudio
          value={c.panelSpec}
          onChange={(panelSpec) => setC({ ...c, panelSpec })}
          emojis={guild.emojis}
        />
      </div>

      <div className="space-y-3 rounded-xl border border-line bg-bg/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="font-semibold text-white/90">
              Kategorie ticketów (przyciski panelu)
            </span>
            <p className="text-xs text-muted">
              Każda kategoria = osobny przycisk (np. Pomoc, IT, Nagrody) z własną rolą i powitaniem.
              Brak kategorii = jeden przycisk „Otwórz ticket".
            </p>
          </div>
          <button
            type="button"
            onClick={addCategory}
            className="flex shrink-0 items-center gap-1 rounded-md border border-line px-2 py-1 text-xs transition hover:border-accent hover:bg-elevated"
          >
            <Plus size={13} /> Dodaj
          </button>
        </div>
        {c.categories.map((cat) => (
          <div key={cat.id} className="space-y-2 rounded-md border border-line bg-elevated/40 p-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_6rem_8rem]">
              <input
                value={cat.label}
                onChange={(e) => setCategory(cat.id, { label: e.target.value })}
                placeholder="Nazwa przycisku (np. Pomoc)"
                className={inputCls}
                maxLength={80}
              />
              <input
                value={cat.emoji}
                onChange={(e) => setCategory(cat.id, { emoji: e.target.value })}
                placeholder="Emoji"
                className={inputCls}
                maxLength={64}
              />
              <select
                value={cat.style}
                onChange={(e) =>
                  setCategory(cat.id, { style: e.target.value as TicketCategory['style'] })
                }
                className="rounded-md border border-line bg-elevated px-2 py-2 text-sm outline-none focus:border-accent"
              >
                {STYLES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <RoleSelect
                value={cat.supportRoleId}
                onChange={(v) => setCategory(cat.id, { supportRoleId: v })}
                roles={guild.roles}
                placeholder="— rola obsługi kategorii —"
              />
              <div className="flex gap-2">
                <input
                  value={cat.welcome}
                  onChange={(e) => setCategory(cat.id, { welcome: e.target.value })}
                  placeholder="Powitanie (opcjonalne, {user}/{subject})"
                  className={inputCls}
                  maxLength={1000}
                />
                <button
                  type="button"
                  onClick={() => removeCategory(cat.id)}
                  className="rounded-md border border-line px-2 text-muted transition hover:border-accent hover:text-accent"
                  title="Usuń kategorię"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            Auto-zamknij po bezczynności (godziny, 0 = off)
          </span>
          <input
            type="number"
            value={c.slaHours}
            onChange={(e) =>
              setC({ ...c, slaHours: Math.max(0, Math.floor(Number(e.target.value) || 0)) })
            }
            className={inputCls}
          />
        </label>
        <label className="flex items-center gap-3 pt-6 text-sm">
          <input
            type="checkbox"
            checked={c.ratingEnabled}
            onChange={(e) => setC({ ...c, ratingEnabled: e.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">Proś o ocenę (1–5 ⭐)</span>
        </label>
      </div>

      <div className="space-y-2 rounded-xl border border-line bg-bg/40 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">
            📋 Pytania formularza przed otwarciem (max 4)
          </span>
          <button
            type="button"
            onClick={() =>
              c.questions.length < 4 && setC({ ...c, questions: [...c.questions, ''] })
            }
            disabled={c.questions.length >= 4}
            className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated disabled:opacity-40"
          >
            <Plus size={12} /> Dodaj
          </button>
        </div>
        {c.questions.length === 0 && (
          <p className="text-xs text-muted">
            Brak pytań — użytkownik poda tylko temat. Dodaj pytania (np. „Jaki masz nick w grze?"),
            a bot zada je w okienku przed otwarciem ticketu i wklei odpowiedzi do wątku.
          </p>
        )}
        {c.questions.map((q, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: lista edytowalna po indeksie
          <div key={i} className="grid grid-cols-[1fr_auto] gap-2">
            <input
              value={q}
              onChange={(e) =>
                setC({ ...c, questions: c.questions.map((x, j) => (j === i ? e.target.value : x)) })
              }
              placeholder={`Pytanie ${i + 1}`}
              maxLength={100}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setC({ ...c, questions: c.questions.filter((_, j) => j !== i) })}
              className="rounded-md border border-line p-2 text-muted transition hover:border-accent hover:text-accent"
              aria-label="Usuń pytanie"
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
        Po zapisie wyślij/odśwież panel komendą <code className="text-accent">/ticketpanel</code> na
        docelowym kanale. Ocena wymaga <code>f5-tickets-schema.sql</code>.
      </p>
    </div>
  );
}
