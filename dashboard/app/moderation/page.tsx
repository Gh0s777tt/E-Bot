import { ShieldCheck } from 'lucide-react';
import AutomodForm from '../../components/AutomodForm';
import { getAutomodConfig } from '../../lib/community';

export const dynamic = 'force-dynamic';

export default async function ModerationPage() {
  const cfg = await getAutomodConfig();
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Automoderacja: blokowanie zaproszeń/linków, limit wzmianek i anty-spam. Naruszenia są
        usuwane i logowane na mod-log. (Anti-Nuke przeciw masowym akcjom admina znajdziesz w{' '}
        <strong>Bezpieczeństwo</strong>.){' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">Automod: WŁĄCZONY</span>
        ) : (
          <span className="font-semibold text-accent">Automod: WYŁĄCZONY</span>
        )}
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <ShieldCheck size={16} className="text-accent" /> Automod
        </h2>
        <AutomodForm initial={cfg} />
      </section>
    </div>
  );
}
