import { MessageSquarePlus } from 'lucide-react';
import ResponderForm from '../../components/ResponderForm';
import { getResponderConfig } from '../../lib/community';

export const dynamic = 'force-dynamic';

export default async function ResponderPage() {
  const cfg = await getResponderConfig();
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Komendy własne i autoresponder — szybkie, tekstowe odpowiedzi bez kodu. Komendy działają na
        prefiks (np. <code className="text-accent">!regulamin</code>), a autoresponder reaguje na
        słowa-klucze w wiadomościach. Obsługują zmienne{' '}
        <code className="text-accent">{'{user}'}</code> i{' '}
        <code className="text-accent">{'{server}'}</code>.{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">Moduł: WŁĄCZONY</span>
        ) : (
          <span className="font-semibold text-accent">Moduł: WYŁĄCZONY</span>
        )}
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <MessageSquarePlus size={16} className="text-accent" /> Komendy własne + autoresponder
        </h2>
        <ResponderForm initial={cfg} />
      </section>
    </div>
  );
}
