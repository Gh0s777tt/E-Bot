'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';

export default function TicketCloseButton({ id }: { id: string }) {
  const router = useRouter();
  const { lang } = useLang();
  const [busy, setBusy] = useState(false);

  async function close() {
    setBusy(true);
    try {
      await fetch('/api/tickets/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      router.refresh();
    } catch {
      /* ignore */
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={close}
      disabled={busy}
      className="rounded border border-line px-2 py-0.5 text-xs text-muted transition hover:border-accent hover:text-accent disabled:opacity-50"
    >
      {busy ? '…' : tp(lang, 'ui.tickets.close')}
    </button>
  );
}
