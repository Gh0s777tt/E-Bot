'use client';

// Etap K — asystent AI panelu. Pływający przycisk (zawsze dostępny) → panel czatu. Użytkownik
// opisuje, czego chce, a asystent rozpisuje plan krok-po-kroku z klikalnymi linkami do stron.
// Odpowiedź w języku użytkownika (model). Bez kluczy AI → uczciwa podpowiedź. Etykiety w 14 językach.
import { Send, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ASSISTANT_I18N } from '../lib/assistantI18n';
import { useLang } from './LangContext';

type Step = { title: string; detail: string; href: string | null };
type Reply = { ok: boolean; summary: string; steps: Step[]; error?: string };

export default function Assistant() {
  const { lang } = useLang();
  const a = ASSISTANT_I18N[lang] ?? ASSISTANT_I18N.pl;
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<Reply | null>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  // A11y: Escape zamyka panel (non-modal popover — bez focus-trapu) i przywraca focus na FAB.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        setOpen(false);
        fabRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function ask(text?: string): Promise<void> {
    const prompt = (text ?? q).trim();
    if (!prompt || busy) return;
    setBusy(true);
    setReply(null);
    try {
      const r = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      setReply((await r.json()) as Reply);
    } catch {
      setReply({ ok: false, summary: '', steps: [], error: 'network' });
    }
    setBusy(false);
  }

  return (
    <>
      {/* Pływający przycisk — zawsze widoczny */}
      <button
        ref={fabRef}
        type="button"
        data-tour="assistant"
        onClick={() => setOpen((o) => !o)}
        title={a.tooltip}
        className="fixed bottom-5 end-5 z-[90] flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-[0_8px_30px_-6px_rgb(var(--accent-rgb)/0.8)] transition hover:bg-accent-hover hover:scale-105"
      >
        {open ? <X size={20} /> : <Sparkles size={20} />}
      </button>

      {open && (
        <div className="fixed bottom-20 end-5 z-[90] flex max-h-[70vh] w-[min(420px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-2xl">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <Sparkles size={16} className="text-accent" />
            <span className="text-sm font-semibold">{a.header}</span>
          </div>

          <div className="flex-1 space-y-3 overflow-auto p-4 text-sm">
            {!reply && !busy && (
              <>
                <p className="text-muted">{a.intro}</p>
                <div className="space-y-1.5">
                  {a.examples.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => {
                        setQ(ex);
                        void ask(ex);
                      }}
                      className="block w-full rounded-md border border-line px-3 py-2 text-start text-xs text-muted transition hover:border-accent hover:text-white"
                    >
                      💬 {ex}
                    </button>
                  ))}
                </div>
              </>
            )}

            {busy && <p className="text-muted">{a.busy}</p>}

            {reply && !reply.ok && (
              <div className="rounded-md border border-line bg-bg/40 p-3 text-muted">
                {reply.error === 'nokey' ? (
                  <>
                    {a.nokeyLead} <strong>DEEPSEEK_API_KEY</strong> /{' '}
                    <strong>OPENAI_API_KEY</strong> {a.nokeyTail}{' '}
                    <Link href="/integrations" className="text-accent hover:underline">
                      {a.integrations}
                    </Link>
                    .
                  </>
                ) : (
                  a.error
                )}
              </div>
            )}

            {reply?.ok && (
              <div className="space-y-3">
                {reply.summary && <p className="text-white/90">{reply.summary}</p>}
                <ol className="space-y-2">
                  {reply.steps.map((s, i) => (
                    <li
                      key={`${s.href ?? 'x'}:${s.title}`}
                      className="rounded-md border border-line bg-bg/40 p-3"
                    >
                      <p className="font-semibold text-white/90">
                        {i + 1}. {s.title}
                      </p>
                      {s.detail && <p className="mt-1 text-xs text-muted">{s.detail}</p>}
                      {s.href && (
                        <Link
                          href={s.href}
                          onClick={() => setOpen(false)}
                          className="mt-2 inline-block rounded-md bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent transition hover:bg-accent/25"
                        >
                          → {a.open} {s.href}
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  onClick={() => {
                    setReply(null);
                    setQ('');
                  }}
                  className="text-xs text-muted hover:text-accent"
                >
                  {a.askAnother}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-line p-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void ask();
              }}
              placeholder={a.placeholder}
              className="w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => void ask()}
              disabled={busy || !q.trim()}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-accent text-white transition hover:bg-accent-hover disabled:opacity-50"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
