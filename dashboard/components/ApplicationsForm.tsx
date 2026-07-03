'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Application, ApplicationsConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { fromLegacy, normalizeRich, type RichMessage } from '../lib/richMessage';
import { saveConfig } from '../lib/saveConfig';
import { useLang } from './LangContext';
import MessageStudio from './MessageStudio';
import { ChannelSelect, RoleSelect } from './pickers';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

type FormQ = { id: string; q: string };
type FormApp = {
  id: string;
  label: string;
  emoji: string;
  style: Application['style'];
  reviewChannelId: string;
  acceptRoleId: string;
  questions: FormQ[];
};

const STYLES: { value: Application['style']; key: string }[] = [
  { value: 'primary', key: 'ui.applications.styleBlue' },
  { value: 'secondary', key: 'ui.applications.styleGray' },
  { value: 'success', key: 'ui.applications.styleGreen' },
  { value: 'danger', key: 'ui.applications.styleRed' },
];

const newId = () => crypto.randomUUID().slice(0, 8);

function toFormApp(a: Application): FormApp {
  return { ...a, questions: a.questions.map((q, i) => ({ id: `${a.id}-q${i}`, q })) };
}

export default function ApplicationsForm({
  initial,
  guild,
}: {
  initial: ApplicationsConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [panelSpec, setPanelSpec] = useState<RichMessage>(
    initial.panelSpec ? normalizeRich(initial.panelSpec) : fromLegacy(initial.panelMessage),
  );
  const [apps, setApps] = useState<FormApp[]>(() =>
    initial.applications?.length
      ? initial.applications.map(toFormApp)
      : [
          {
            id: 'default',
            label: 'Aplikuj',
            emoji: '📋',
            style: 'primary',
            reviewChannelId: initial.reviewChannelId,
            acceptRoleId: initial.roleId,
            questions: (initial.questions ?? []).map((q, i) => ({ id: `default-q${i}`, q })),
          },
        ],
  );
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function save() {
    setSt('saving');
    const applications: Application[] = apps.map((a) => ({
      id: a.id,
      label: a.label.trim() || 'Aplikuj',
      emoji: a.emoji,
      style: a.style,
      reviewChannelId: a.reviewChannelId,
      acceptRoleId: a.acceptRoleId,
      questions: a.questions.map((x) => x.q.trim()).filter(Boolean),
    }));
    const first = applications[0];
    const payload: ApplicationsConfig = {
      enabled,
      panelMessage: panelSpec.content || initial.panelMessage,
      panelSpec,
      applications,
      reviewChannelId: first?.reviewChannelId ?? '',
      roleId: first?.acceptRoleId ?? '',
      questions: first?.questions ?? [],
    };
    const res = await saveConfig('/api/applications', payload);
    setErrMsg(res.error);
    setSt(res.ok ? 'ok' : 'err');
    setTimeout(() => setSt('idle'), 2500);
  }

  function addApp() {
    if (apps.length >= 10) return;
    setApps([
      ...apps,
      {
        id: newId(),
        label: '',
        emoji: '',
        style: 'primary',
        reviewChannelId: '',
        acceptRoleId: '',
        questions: [],
      },
    ]);
  }
  function setApp(id: string, patch: Partial<FormApp>) {
    setApps(apps.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }
  function removeApp(id: string) {
    setApps(apps.filter((a) => a.id !== id));
  }
  function addQ(appId: string) {
    setApps(
      apps.map((a) =>
        a.id === appId && a.questions.length < 5
          ? { ...a, questions: [...a.questions, { id: newId(), q: '' }] }
          : a,
      ),
    );
  }
  function setQ(appId: string, qId: string, q: string) {
    setApps(
      apps.map((a) =>
        a.id === appId
          ? { ...a, questions: a.questions.map((x) => (x.id === qId ? { ...x, q } : x)) }
          : a,
      ),
    );
  }
  function removeQ(appId: string, qId: string) {
    setApps(
      apps.map((a) =>
        a.id === appId ? { ...a, questions: a.questions.filter((x) => x.id !== qId) } : a,
      ),
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">
          {tp(lang, 'ui.applications.enabledToggle')}
        </span>
      </label>

      <div className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">
          {tp(lang, 'ui.applications.panelMsgLabelPre')}
          <code className="text-accent">/applypanel</code>
          {tp(lang, 'ui.applications.panelMsgLabelPost')}
        </span>
        <MessageStudio value={panelSpec} onChange={setPanelSpec} emojis={guild.emojis} />
      </div>

      <div className="space-y-3 rounded-xl border border-line bg-bg/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="font-semibold text-white/90">
              {tp(lang, 'ui.applications.appsLabel')}
            </span>
            <p className="text-xs text-muted">{tp(lang, 'ui.applications.appsHint')}</p>
          </div>
          <button
            type="button"
            onClick={addApp}
            disabled={apps.length >= 10}
            className="flex shrink-0 items-center gap-1 rounded-md border border-line px-2 py-1 text-xs transition hover:border-accent hover:bg-elevated disabled:opacity-40"
          >
            <Plus size={13} /> {tp(lang, 'ui.applications.addBtn')}
          </button>
        </div>

        {apps.map((app) => (
          <div key={app.id} className="space-y-2 rounded-md border border-line bg-elevated/40 p-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_6rem_8rem]">
              <input
                value={app.label}
                onChange={(e) => setApp(app.id, { label: e.target.value })}
                placeholder={tp(lang, 'ui.applications.labelPh')}
                className={inputCls}
                maxLength={80}
              />
              <input
                value={app.emoji}
                onChange={(e) => setApp(app.id, { emoji: e.target.value })}
                placeholder={tp(lang, 'ui.applications.emojiPh')}
                className={inputCls}
                maxLength={64}
              />
              <select
                value={app.style}
                onChange={(e) => setApp(app.id, { style: e.target.value as Application['style'] })}
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
              <ChannelSelect
                value={app.reviewChannelId}
                onChange={(v) => setApp(app.id, { reviewChannelId: v })}
                channels={guild.channels}
                placeholder={tp(lang, 'ui.applications.reviewChannelPh')}
              />
              <RoleSelect
                value={app.acceptRoleId}
                onChange={(v) => setApp(app.id, { acceptRoleId: v })}
                roles={guild.roles}
                placeholder={tp(lang, 'ui.applications.acceptRolePh')}
              />
            </div>

            <div className="space-y-1.5 rounded-md border border-line/60 bg-bg/30 p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted">
                  {tp(lang, 'ui.applications.questionsLabel')} ({app.questions.length}/5)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addQ(app.id)}
                    disabled={app.questions.length >= 5}
                    className="flex items-center gap-1 rounded-md border border-line px-2 py-0.5 text-xs transition hover:border-accent hover:bg-elevated disabled:opacity-40"
                  >
                    <Plus size={11} /> {tp(lang, 'ui.applications.addQBtn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeApp(app.id)}
                    className="rounded-md border border-line px-2 py-0.5 text-xs text-muted transition hover:border-accent hover:text-accent"
                  >
                    {tp(lang, 'ui.applications.removeAppBtn')}
                  </button>
                </div>
              </div>
              {app.questions.map((qq) => (
                <div key={qq.id} className="flex gap-2">
                  <input
                    value={qq.q}
                    onChange={(e) => setQ(app.id, qq.id, e.target.value)}
                    placeholder={tp(lang, 'ui.applications.questionPh')}
                    className={inputCls}
                    maxLength={200}
                  />
                  <button
                    type="button"
                    onClick={() => removeQ(app.id, qq.id)}
                    className="rounded-md border border-line px-2 text-muted transition hover:border-accent hover:text-accent"
                    aria-label={tp(lang, 'ui.applications.delQAria')}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SaveButton st={st} onClick={save} errorText={errMsg} />
      <p className="text-xs text-muted">
        {tp(lang, 'ui.applications.footerPre')}
        <code className="text-accent">/applypanel</code>
        {tp(lang, 'ui.applications.footerPost')}
      </p>
    </div>
  );
}
