'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Application, ApplicationsConfig } from '../lib/community';
import type { GuildMeta } from '../lib/guild';
import { fromLegacy, normalizeRich, type RichMessage } from '../lib/richMessage';
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

const STYLES: { value: Application['style']; label: string }[] = [
  { value: 'primary', label: 'Niebieski' },
  { value: 'secondary', label: 'Szary' },
  { value: 'success', label: 'Zielony' },
  { value: 'danger', label: 'Czerwony' },
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

  async function save() {
    setSt('saving');
    try {
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
      const r = await fetch('/api/applications', {
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
        <span className="font-semibold text-white/90">Aplikacje włączone</span>
      </label>

      <div className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">
          Wiadomość panelu (komenda <code className="text-accent">/applypanel</code>)
        </span>
        <MessageStudio value={panelSpec} onChange={setPanelSpec} emojis={guild.emojis} />
      </div>

      <div className="space-y-3 rounded-xl border border-line bg-bg/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="font-semibold text-white/90">Aplikacje (przyciski panelu)</span>
            <p className="text-xs text-muted">
              Każda aplikacja = osobny przycisk (np. Moderator, Builder) z własnym kanałem recenzji,
              rolą i pytaniami (max 5 — limit Discorda na modal).
            </p>
          </div>
          <button
            type="button"
            onClick={addApp}
            disabled={apps.length >= 10}
            className="flex shrink-0 items-center gap-1 rounded-md border border-line px-2 py-1 text-xs transition hover:border-accent hover:bg-elevated disabled:opacity-40"
          >
            <Plus size={13} /> Dodaj
          </button>
        </div>

        {apps.map((app) => (
          <div key={app.id} className="space-y-2 rounded-md border border-line bg-elevated/40 p-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_6rem_8rem]">
              <input
                value={app.label}
                onChange={(e) => setApp(app.id, { label: e.target.value })}
                placeholder="Nazwa przycisku (np. Moderator)"
                className={inputCls}
                maxLength={80}
              />
              <input
                value={app.emoji}
                onChange={(e) => setApp(app.id, { emoji: e.target.value })}
                placeholder="Emoji"
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
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <ChannelSelect
                value={app.reviewChannelId}
                onChange={(v) => setApp(app.id, { reviewChannelId: v })}
                channels={guild.channels}
                placeholder="— kanał recenzji —"
              />
              <RoleSelect
                value={app.acceptRoleId}
                onChange={(v) => setApp(app.id, { acceptRoleId: v })}
                roles={guild.roles}
                placeholder="— rola po akceptacji —"
              />
            </div>

            <div className="space-y-1.5 rounded-md border border-line/60 bg-bg/30 p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted">
                  Pytania ({app.questions.length}/5)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addQ(app.id)}
                    disabled={app.questions.length >= 5}
                    className="flex items-center gap-1 rounded-md border border-line px-2 py-0.5 text-xs transition hover:border-accent hover:bg-elevated disabled:opacity-40"
                  >
                    <Plus size={11} /> Pytanie
                  </button>
                  <button
                    type="button"
                    onClick={() => removeApp(app.id)}
                    className="rounded-md border border-line px-2 py-0.5 text-xs text-muted transition hover:border-accent hover:text-accent"
                  >
                    Usuń aplikację
                  </button>
                </div>
              </div>
              {app.questions.map((qq) => (
                <div key={qq.id} className="flex gap-2">
                  <input
                    value={qq.q}
                    onChange={(e) => setQ(app.id, qq.id, e.target.value)}
                    placeholder="Pytanie do kandydata"
                    className={inputCls}
                    maxLength={200}
                  />
                  <button
                    type="button"
                    onClick={() => removeQ(app.id, qq.id)}
                    className="rounded-md border border-line px-2 text-muted transition hover:border-accent hover:text-accent"
                    aria-label="Usuń pytanie"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">
        Po zapisie opublikuj/odśwież panel komendą <code className="text-accent">/applypanel</code>.
        Brak aplikacji = pojedynczy przycisk z pól domyślnych (wstecznie zgodne).
      </p>
    </div>
  );
}
