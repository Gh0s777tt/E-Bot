'use client';

// M6 — formularz zgłaszania pluginu community (autor). POST /api/community/submit → wpis
// 'pending' do moderacji. Walidacja zgodna z communityManifestSchema (serwer waliduje ponownie).
import { type FormEvent, useState } from 'react';

type FormState = {
  key: string;
  title: string;
  description: string;
  version: string;
  homepage: string;
};
const EMPTY: FormState = { key: '', title: '', description: '', version: '', homepage: '' };

export default function CommunitySubmitForm() {
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
      const r = await fetch('/api/community/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = (await r.json()) as { ok?: boolean; error?: string };
      if (r.ok && j.ok) {
        setStatus({ ok: true, msg: 'Zgłoszono! Plugin czeka na moderację.' });
        setForm(EMPTY);
      } else {
        setStatus({ ok: false, msg: j.error || 'Nie udało się zgłosić.' });
      }
    } catch {
      setStatus({ ok: false, msg: 'Błąd sieci.' });
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
          Klucz (małe litery, cyfry, myślniki)
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
          Nazwa
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
          Opis (opcjonalnie)
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
            Wersja (opcjonalnie)
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
            Strona (opcjonalnie)
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
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/20 disabled:opacity-40"
      >
        Zgłoś plugin
      </button>
      {status && (
        <p className={`text-sm ${status.ok ? 'text-accent' : 'text-red-400'}`}>{status.msg}</p>
      )}
    </form>
  );
}
