'use client';

// M6 — panel moderacji community (klient). Approve/reject → POST /api/community/review
// (owner/staff-only, egzekwowane też po stronie serwera). Zatwierdzony plugin wpada do katalogu.
import { useState } from 'react';
import type { CommunityPlugin } from '../lib/communityPlugins';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';

export default function CommunityReview({ initial }: { initial: CommunityPlugin[] }) {
  const { lang } = useLang();
  const [items, setItems] = useState<CommunityPlugin[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function decide(key: string, status: 'approved' | 'rejected') {
    setBusy(key);
    try {
      const r = await fetch('/api/community/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, status }),
      });
      if (r.ok) setItems((xs) => xs.filter((x) => x.key !== key));
    } catch {
      /* sieć — pozycja zostaje na liście */
    } finally {
      setBusy(null);
    }
  }

  if (!items.length) {
    return <p className="text-sm text-muted">{tp(lang, 'ui.mkt.reviewEmpty')}</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((p) => (
        <div
          key={p.key}
          className="flex items-center justify-between gap-3 rounded-lg border border-line bg-card p-4"
        >
          <div className="min-w-0">
            <p className="font-semibold text-white">
              {p.title} <span className="text-xs font-normal text-muted">({p.key})</span>
            </p>
            {p.description && <p className="truncate text-xs text-muted">{p.description}</p>}
            {p.author_id && (
              <p className="text-[10px] text-muted/70">
                {tp(lang, 'ui.mkt.author')}: {p.author_id}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={busy === p.key}
              onClick={() => decide(p.key, 'approved')}
              className="rounded-md border border-accent/50 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/20 disabled:opacity-40"
            >
              {tp(lang, 'ui.mkt.approve')}
            </button>
            <button
              type="button"
              disabled={busy === p.key}
              onClick={() => decide(p.key, 'rejected')}
              className="rounded-md border border-line px-3 py-1.5 text-xs text-muted transition hover:border-red-500/50 hover:text-red-400 disabled:opacity-40"
            >
              {tp(lang, 'ui.mkt.reject')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
