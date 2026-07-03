'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { TicketCategory } from '../lib/faza4';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { fromLegacy, normalizeRich, type RichMessage } from '../lib/richMessage';
import { saveConfig } from '../lib/saveConfig';
import { useLang } from './LangContext';
import MessageStudio from './MessageStudio';
import { ChannelSelect, RoleSelect } from './pickers';
import SaveButton from './SaveButton';

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

const STYLES: { value: TicketCategory['style']; key: string }[] = [
  { value: 'primary', key: 'ui.tickets.styleBlue' },
  { value: 'secondary', key: 'ui.tickets.styleGray' },
  { value: 'success', key: 'ui.tickets.styleGreen' },
  { value: 'danger', key: 'ui.tickets.styleRed' },
];

export default function TicketsConfigForm({ initial, guild }: { initial: Init; guild: GuildMeta }) {
  const { lang } = useLang();
  const [c, setC] = useState<Cfg>({
    ...initial,
    panelSpec: initial.panelSpec
      ? normalizeRich(initial.panelSpec)
      : fromLegacy(initial.panelMessage),
    categories: initial.categories ?? [],
    questions: initial.questions ?? [],
  });
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function save() {
    setSt('saving');
    const res = await saveConfig('/api/tickets', {
      ...c,
      panelMessage: c.panelSpec.content || c.panelMessage,
      questions: c.questions.map((q) => q.trim()).filter(Boolean),
    });
    setErrMsg(res.error);
    setSt(res.ok ? 'ok' : 'err');
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
        <span className="font-semibold text-white/90">{tp(lang, 'ui.tickets.enabledLabel')}</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.tickets.categoryLabel')}
          </span>
          <ChannelSelect
            value={c.categoryId}
            onChange={(v) => setC({ ...c, categoryId: v })}
            channels={guild.channels}
            kind="category"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.tickets.supportRoleLabel')}
          </span>
          <RoleSelect
            value={c.supportRoleId}
            onChange={(v) => setC({ ...c, supportRoleId: v })}
            roles={guild.roles}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">
            {tp(lang, 'ui.tickets.logChannelLabel')}
          </span>
          <ChannelSelect
            value={c.logChannelId}
            onChange={(v) => setC({ ...c, logChannelId: v })}
            channels={guild.channels}
          />
        </label>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.tickets.welcomeLabel')}</span>
        <textarea
          value={c.welcome}
          onChange={(e) => setC({ ...c, welcome: e.target.value })}
          rows={2}
          className={inputCls}
          placeholder={tp(lang, 'ui.tickets.welcomePlaceholder')}
        />
        <span className="text-xs text-muted">{tp(lang, 'ui.tickets.welcomeHelp')}</span>
      </label>

      <div className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.tickets.panelMsgLabel')}</span>
        <MessageStudio
          value={c.panelSpec}
          onChange={(panelSpec) => setC({ ...c, panelSpec })}
          emojis={guild.emojis}
        />
      </div>

      <div className="space-y-3 rounded-xl border border-line bg-bg/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="font-semibold text-white/90">{tp(lang, 'ui.tickets.catsLabel')}</span>
            <p className="text-xs text-muted">{tp(lang, 'ui.tickets.catsHelp')}</p>
          </div>
          <button
            type="button"
            onClick={addCategory}
            className="flex shrink-0 items-center gap-1 rounded-md border border-line px-2 py-1 text-xs transition hover:border-accent hover:bg-elevated"
          >
            <Plus size={13} /> {tp(lang, 'ui.tickets.add')}
          </button>
        </div>
        {c.categories.map((cat) => (
          <div key={cat.id} className="space-y-2 rounded-md border border-line bg-elevated/40 p-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_6rem_8rem]">
              <input
                value={cat.label}
                onChange={(e) => setCategory(cat.id, { label: e.target.value })}
                placeholder={tp(lang, 'ui.tickets.catNamePlaceholder')}
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
                    {tp(lang, s.key)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <RoleSelect
                value={cat.supportRoleId}
                onChange={(v) => setCategory(cat.id, { supportRoleId: v })}
                roles={guild.roles}
                placeholder={tp(lang, 'ui.tickets.catRolePlaceholder')}
              />
              <div className="flex gap-2">
                <input
                  value={cat.welcome}
                  onChange={(e) => setCategory(cat.id, { welcome: e.target.value })}
                  placeholder={tp(lang, 'ui.tickets.catWelcomePlaceholder')}
                  className={inputCls}
                  maxLength={1000}
                />
                <button
                  type="button"
                  onClick={() => removeCategory(cat.id)}
                  className="rounded-md border border-line px-2 text-muted transition hover:border-accent hover:text-accent"
                  title={tp(lang, 'ui.tickets.removeCat')}
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
          <span className="font-semibold text-white/90">{tp(lang, 'ui.tickets.slaLabel')}</span>
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
          <span className="font-semibold text-white/90">{tp(lang, 'ui.tickets.ratingLabel')}</span>
        </label>
      </div>

      <div className="space-y-2 rounded-xl border border-line bg-bg/40 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">
            {tp(lang, 'ui.tickets.questionsLabel')}
          </span>
          <button
            type="button"
            onClick={() =>
              c.questions.length < 4 && setC({ ...c, questions: [...c.questions, ''] })
            }
            disabled={c.questions.length >= 4}
            className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-xs transition hover:bg-elevated disabled:opacity-40"
          >
            <Plus size={12} /> {tp(lang, 'ui.tickets.add')}
          </button>
        </div>
        {c.questions.length === 0 && (
          <p className="text-xs text-muted">{tp(lang, 'ui.tickets.questionsEmpty')}</p>
        )}
        {c.questions.map((q, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: lista edytowalna po indeksie
          <div key={i} className="grid grid-cols-[1fr_auto] gap-2">
            <input
              value={q}
              onChange={(e) =>
                setC({ ...c, questions: c.questions.map((x, j) => (j === i ? e.target.value : x)) })
              }
              placeholder={`${tp(lang, 'ui.tickets.questionPlaceholder')} ${i + 1}`}
              maxLength={100}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setC({ ...c, questions: c.questions.filter((_, j) => j !== i) })}
              className="rounded-md border border-line p-2 text-muted transition hover:border-accent hover:text-accent"
              aria-label={tp(lang, 'ui.tickets.removeQuestion')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <SaveButton st={st} onClick={save} errorText={errMsg} />
      <p className="text-xs text-muted">{tp(lang, 'ui.tickets.footNote')}</p>
    </div>
  );
}
