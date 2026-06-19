'use client';

// Pulpit 2.0 — szybkie akcje: przełącznik raidmode (flaga w settings, bot podchwytuje ≤30 s)
// + skróty do modułów bezpieczeństwa.
import { ShieldAlert, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';

export default function QuickActionsCard() {
  const [on, setOn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const { lang } = useLang();

  useEffect(() => {
    fetch('/api/raidmode')
      .then((r) => r.json())
      .then((j: { on?: boolean }) => setOn(!!j.on))
      .catch(() => setOn(false));
  }, []);

  async function toggle() {
    if (on === null || busy) return;
    setBusy(true);
    try {
      const r = await fetch('/api/raidmode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ on: !on }),
      });
      const j = (await r.json()) as { ok?: boolean; on?: boolean };
      if (r.ok && j.ok) setOn(!!j.on);
    } catch {
      /* zostaw stan */
    }
    setBusy(false);
  }

  return (
    <section className="panel-glow rounded-2xl border border-line bg-card p-5">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
        <Zap size={16} className="text-accent" /> {tp(lang, 'ui.home.qaHeading')}
      </h2>

      <div className="flex items-center justify-between rounded-xl border border-line bg-bg/40 p-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-white/90">
            <ShieldAlert size={15} className={on ? 'text-accent' : 'text-muted'} /> Raidmode
            {on && (
              <span className="rounded bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                {tp(lang, 'ui.home.qaActive')}
              </span>
            )}
          </p>
          <p className="mt-1 text-xs text-muted">
            {tp(lang, 'ui.home.qaRaidPre')}
            <code className="text-accent">/raidmode</code>
            {tp(lang, 'ui.home.qaRaidPost')}
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={on === null || busy}
          className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
            on
              ? 'bg-elevated text-white hover:bg-elevated/70'
              : 'bg-accent text-white hover:bg-accent-hover'
          }`}
        >
          {on === null ? '…' : on ? tp(lang, 'ui.home.qaOff') : tp(lang, 'ui.home.qaOn')}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <a
          href="/security"
          className="rounded-md border border-line bg-bg/40 px-3 py-2 text-center transition hover:border-accent"
        >
          🛡️ {tp(lang, 'ui.home.security')}
        </a>
        <a
          href="/moderation"
          className="rounded-md border border-line bg-bg/40 px-3 py-2 text-center transition hover:border-accent"
        >
          ⚖️ {tp(lang, 'ui.home.moderation')}
        </a>
      </div>
      <p className="mt-3 text-xs text-muted">
        {tp(lang, 'ui.home.qaFooterPre')}
        <code className="text-accent">/panic</code>
        {tp(lang, 'ui.home.qaFooterMid')}
        <code className="text-accent">/backup restore</code>
        {tp(lang, 'ui.home.qaFooterPost')}
      </p>
    </section>
  );
}
