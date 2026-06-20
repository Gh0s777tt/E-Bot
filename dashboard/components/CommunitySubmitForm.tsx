'use client';

// M6 — formularz zgłaszania pluginu community (autor). POST /api/community/submit → wpis
// 'pending' do moderacji. Walidacja zgodna z communityManifestSchema (serwer waliduje ponownie).
import { type FormEvent, useState } from 'react';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';

type FormState = {
  key: string;
  title: string;
  description: string;
  version: string;
  homepage: string;
  endpoint: string;
  secret: string;
};
const EMPTY: FormState = {
  key: '',
  title: '',
  description: '',
  version: '',
  homepage: '',
  endpoint: '',
  secret: '',
};

export default function CommunitySubmitForm() {
  const { lang } = useLang();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function set(k: keyof FormState, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const body: Record<string, string> = { key: form.key, title: form.title };
      if (form.description) body.description = form.description;
      if (form.version) body.version = form.version;
      if (form.homepage) body.homepage = form.homepage;
      if (form.endpoint) body.endpoint = form.endpoint;
      if (form.secret) body.secret = form.secret;
      const r = await fetch('/api/community/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = (await r.json()) as { ok?: boolean; error?: string };
      if (r.ok && j.ok) {
        setStatus({ ok: true, msg: tp(lang, 'ui.mkt.submitOk') });
        setForm(EMPTY);
      } else {
        setStatus({ ok: false, msg: j.error || tp(lang, 'ui.mkt.submitFail') });
      }
    } catch {
      setStatus({ ok: false, msg: tp(lang, 'ui.mkt.netErr') });
    } finally {
      setBusy(false);
    }
  }

  const input =
    'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none transition focus:border-accent';
  const lbl = 'mb-1 block text-xs text-muted';

  return (
    <form onSubmit={submit} className="max-w-lg space-y-3">
      <div>
        <label className={lbl} htmlFor="cp-key">
          {tp(lang, 'ui.mkt.fKey')}
        </label>
        <input
          id="cp-key"
          className={input}
          value={form.key}
          onChange={(e) => set('key', e.target.value)}
          required
          minLength={2}
          maxLength={48}
          placeholder="np. my-plugin"
        />
      </div>
      <div>
        <label className={lbl} htmlFor="cp-title">
          {tp(lang, 'ui.mkt.fTitle')}
        </label>
        <input
          id="cp-title"
          className={input}
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          required
          minLength={2}
          maxLength={80}
        />
      </div>
      <div>
        <label className={lbl} htmlFor="cp-desc">
          {tp(lang, 'ui.mkt.fDesc')}
        </label>
        <textarea
          id="cp-desc"
          className={input}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          maxLength={300}
          rows={3}
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={lbl} htmlFor="cp-ver">
            {tp(lang, 'ui.mkt.fVersion')}
          </label>
          <input
            id="cp-ver"
            className={input}
            value={form.version}
            onChange={(e) => set('version', e.target.value)}
            maxLength={20}
            placeholder="1.0.0"
          />
        </div>
        <div className="flex-1">
          <label className={lbl} htmlFor="cp-home">
            {tp(lang, 'ui.mkt.fHome')}
          </label>
          <input
            id="cp-home"
            className={input}
            type="url"
            value={form.homepage}
            onChange={(e) => set('homepage', e.target.value)}
            maxLength={200}
            placeholder="https://..."
          />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={lbl} htmlFor="cp-endpoint">
            {tp(lang, 'ui.mkt.fEndpoint')}
          </label>
          <input
            id="cp-endpoint"
            className={input}
            type="url"
            value={form.endpoint}
            onChange={(e) => set('endpoint', e.target.value)}
            maxLength={200}
            placeholder="https://..."
          />
        </div>
        <div className="flex-1">
          <label className={lbl} htmlFor="cp-secret">
            {tp(lang, 'ui.mkt.fSecret')}
          </label>
          <input
            id="cp-secret"
            className={input}
            type="password"
            value={form.secret}
            onChange={(e) => set('secret', e.target.value)}
            maxLength={200}
            autoComplete="new-password"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/20 disabled:opacity-40"
      >
        {tp(lang, 'ui.mkt.submitBtn')}
      </button>
      {status && (
        <p className={`text-sm ${status.ok ? 'text-accent' : 'text-red-400'}`}>{status.msg}</p>
      )}
    </form>
  );
}
