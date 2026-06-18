'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { tp } from '../lib/panelI18n';
import IgdbSearch, { type IgdbResult } from './IgdbSearch';
import { useLang } from './LangContext';

const STORES = ['steam', 'gog', 'xbox', 'epic', 'psn', 'ubisoft', 'other'];
const selectCls =
  'rounded-md border border-line bg-elevated px-3 py-2 text-sm uppercase tracking-wide outline-none focus:border-accent';

export default function AddGameForm() {
  const { lang } = useLang();
  const router = useRouter();
  const [picked, setPicked] = useState<IgdbResult | null>(null);
  const [store, setStore] = useState('xbox');
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function add() {
    if (!picked) return;
    setSt('saving');
    try {
      const r = await fetch('/api/library/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: picked.name,
          store,
          igdb_id: picked.igdb_id,
          release_year: picked.year,
          genres: picked.genres,
          cover_url: picked.cover_url ?? '',
          summary: picked.summary ?? '',
        }),
      });
      if (r.ok) {
        setSt('ok');
        setPicked(null);
        router.refresh();
      } else {
        setSt('err');
      }
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  return (
    <div className="space-y-3">
      <IgdbSearch onPick={setPicked} placeholder={tp(lang, 'ui.library.igdbPlaceholder')} />
      {picked && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-line bg-elevated p-3">
          {picked.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={picked.cover_url} alt="" className="h-16 w-12 rounded object-cover" />
          )}
          <div className="min-w-[160px] flex-1">
            <p className="text-sm font-semibold">
              {picked.name}
              {picked.year ? <span className="text-muted"> · {picked.year}</span> : null}
            </p>
            <p className="text-xs text-muted">{picked.genres.join(', ')}</p>
          </div>
          <select value={store} onChange={(e) => setStore(e.target.value)} className={selectCls}>
            {STORES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={add}
            disabled={st === 'saving'}
            className="rounded-md bg-accent px-5 py-2 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
          >
            {st === 'saving' ? tp(lang, 'ui.library.addingBtn') : tp(lang, 'ui.library.addBtn')}
          </button>
        </div>
      )}
      {st === 'ok' && (
        <span className="text-sm text-green-400">{tp(lang, 'ui.library.addedOk')}</span>
      )}
      {st === 'err' && <span className="text-sm text-accent">{tp(lang, 'ui.saveError')}</span>}
    </div>
  );
}
