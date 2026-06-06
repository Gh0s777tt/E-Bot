'use client';

import { UploadCloud } from 'lucide-react';
import { type ChangeEvent, useState } from 'react';

type Profile = { username: string; avatarUrl: string | null };

export default function BotCustomizeForm({ initial }: { initial: Profile | null }) {
  const [username, setUsername] = useState(initial?.username ?? '');
  const [preview, setPreview] = useState<string | null>(initial?.avatarUrl ?? null);
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const [status, setStatus] = useState<{ t: 'idle' | 'saving' | 'ok' | 'err'; m?: string }>({
    t: 'idle',
  });

  if (!initial) {
    return (
      <p className="text-sm text-muted">
        Personalizacja niedostępna — brak <code className="text-accent">DISCORD_BOT_TOKEN</code> w
        środowisku panelu.
      </p>
    );
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      setStatus({ t: 'err', m: 'Plik za duży (max 8 MB).' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result as string;
      setAvatarData(r);
      setPreview(r);
    };
    reader.readAsDataURL(f);
  }

  async function save() {
    const body: { username?: string; avatarDataUri?: string } = {};
    if (username.trim() && username.trim() !== initial!.username) body.username = username.trim();
    if (avatarData) body.avatarDataUri = avatarData;
    if (!Object.keys(body).length) {
      setStatus({ t: 'err', m: 'Nic nie zmieniono.' });
      return;
    }
    setStatus({ t: 'saving' });
    try {
      const r = await fetch('/api/bot/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (r.ok && d.ok) {
        setStatus({ t: 'ok', m: 'Zapisano! Zmiany widać w Discordzie.' });
        setAvatarData(null);
        if (d.avatarUrl) setPreview(d.avatarUrl);
      } else {
        setStatus({ t: 'err', m: d.error || 'Błąd zapisu.' });
      }
    } catch (e) {
      setStatus({ t: 'err', m: (e as Error).message });
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="h-20 w-20 rounded-2xl border border-line object-cover"
          />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-accent font-display text-3xl">
            E
          </div>
        )}
        <label className="cursor-pointer rounded-md border border-line px-4 py-2 text-sm transition hover:bg-elevated">
          <span className="flex items-center gap-2">
            <UploadCloud size={15} /> Zmień avatar
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/gif"
            onChange={onFile}
            className="hidden"
          />
        </label>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-semibold text-white/90">Nazwa bota</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={32}
          className="block w-full max-w-sm rounded-md border border-line bg-elevated px-3 py-2 outline-none focus:border-accent"
        />
        <span className="block text-xs text-muted">
          2–32 znaki. Discord pozwala zmienić nazwę bota maks. 2×/godz.
        </span>
      </label>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={status.t === 'saving'}
          className="rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          {status.t === 'saving' ? 'Zapisywanie…' : 'Zapisz zmiany'}
        </button>
        {status.t === 'ok' && <span className="text-sm text-green-400">✓ {status.m}</span>}
        {status.t === 'err' && <span className="text-sm text-accent">{status.m}</span>}
      </div>
    </div>
  );
}
