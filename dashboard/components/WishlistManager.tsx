'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { tp } from '../lib/panelI18n';
import IgdbSearch, { type IgdbResult } from './IgdbSearch';
import { useLang } from './LangContext';

type Item = {
  id: string;
  title: string;
  cover_url: string | null;
  store: string | null;
  release_year: number | null;
  note: string | null;
};

const STORES = ['steam', 'gog', 'xbox', 'epic', 'psn', 'ubisoft', 'other'];
const selectCls =
  'rounded-md border border-line bg-elevated px-3 py-2 text-sm uppercase tracking-wide outline-none focus:border-accent';
const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function WishlistManager({ initial }: { initial: Item[] }) {
  const { lang } = useLang();
  const [items, setItems] = useState<Item[]>(initial);
  const [picked, setPicked] = useState<IgdbResult | null>(null);
  const [store, setStore] = useState('steam');
  const [note, setNote] = useState('');
  const [st, setSt] = useState<'idle' | 'saving' | 'err'>('idle');

  async function add() {
    if (!picked) return;
    setSt('saving');
    try {
      const r = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: picked.name,
          cover_url: picked.cover_url ?? '',
          igdb_id: picked.igdb_id,
          store,
          release_year: picked.year,
          note,
        }),
      });
      const j = (await r.json()) as { ok?: boolean; items?: Item[] };
      if (r.ok && j.items) {
        setItems(j.items);
        setPicked(null);
        setNote('');
        setSt('idle');
      } else {
        setSt('err');
      }
    } catch {
      setSt('err');
    }
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/wishlist?id=${id}`, { method: 'DELETE' }).catch(() => {});
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-2xl border border-line bg-card p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-accent">
          {tp(lang, 'ui.wishlist.addTitle')}
        </h3>
        <IgdbSearch onPick={setPicked} placeholder={tp(lang, 'ui.wishlist.searchPlaceholder')} />
        {picked && (
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-line bg-elevated p-3">
            {picked.cover_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={picked.cover_url} alt="" className="h-16 w-12 rounded object-cover" />
            )}
            <div className="min-w-[140px] flex-1">
              <p className="text-sm font-semibold">
                {picked.name}
                {picked.year ? <span className="text-muted"> · {picked.year}</span> : null}
              </p>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={tp(lang, 'ui.wishlist.notePlaceholder')}
                className={`${inputCls} mt-1`}
              />
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
              {st === 'saving' ? tp(lang, 'ui.wishlist.adding') : tp(lang, 'ui.wishlist.add')}
            </button>
          </div>
        )}
        {st === 'err' && <span className="text-sm text-accent">{tp(lang, 'ui.saveError')}</span>}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted">{tp(lang, 'ui.wishlist.empty')}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((it) => (
            <div
              key={it.id}
              className="group relative overflow-hidden rounded-xl border border-line bg-card"
            >
              {it.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.cover_url}
                  alt={it.title}
                  className="aspect-[2/3] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[2/3] w-full items-center justify-center bg-elevated text-xs text-muted">
                  {tp(lang, 'ui.wishlist.noCover')}
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(it.id)}
                className="absolute end-1.5 top-1.5 rounded-md bg-black/60 p-1.5 text-white/80 opacity-0 transition hover:text-accent group-hover:opacity-100"
                aria-label={tp(lang, 'ui.wishlist.remove')}
              >
                <Trash2 size={14} />
              </button>
              <div className="p-2">
                <p className="truncate text-xs font-semibold">{it.title}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted">
                  {it.store || '—'}
                  {it.release_year ? ` · ${it.release_year}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
