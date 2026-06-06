import { Mails } from 'lucide-react';
import ModmailForm from '../../components/ModmailForm';
import { getModmailConfig } from '../../lib/community';
import { getGuildMeta } from '../../lib/guild';

export const dynamic = 'force-dynamic';

export default async function ModmailPage() {
  const [cfg, guild] = await Promise.all([getModmailConfig(), getGuildMeta()]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Modmail — prywatny kanał kontaktu z obsługą przez DM. Użytkownik pisze wiadomość prywatną do
        bota, a ta trafia jako wątek na kanale obsługi; odpowiedzi obsługi w wątku wracają do
        użytkownika w DM. Komenda <code className="text-accent">!close</code> w wątku kończy
        rozmowę.{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">Modmail: WŁĄCZONY</span>
        ) : (
          <span className="font-semibold text-accent">Modmail: WYŁĄCZONY</span>
        )}
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Mails size={16} className="text-accent" /> Modmail
        </h2>
        <ModmailForm initial={cfg} guild={guild} />
      </section>
    </div>
  );
}
