import { Coffee, Heart } from 'lucide-react';
import DonateLinksForm from '../../components/DonateLinksForm';
import KofiForm from '../../components/KofiForm';
import { getDonateConfig, getKofiConfig } from '../../lib/community';
import { getGuildMeta } from '../../lib/guild';

export const dynamic = 'force-dynamic';

export default async function DonationsPage() {
  const [cfg, donate, guild] = await Promise.all([
    getKofiConfig(),
    getDonateConfig(),
    getGuildMeta(),
  ]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Donejty Ko-fi — gdy ktoś Cię wesprze, Ko-fi wyśle webhook, a bot ogłosi to na wybranym
        kanale. Bez kluczy API: wystarczy URL webhooka i verification token z panelu Ko-fi.{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">Donejty: WŁĄCZONE</span>
        ) : (
          <span className="font-semibold text-accent">Donejty: WYŁĄCZONE</span>
        )}
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Coffee size={16} className="text-accent" /> Ko-fi
        </h2>
        <KofiForm initial={cfg} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Heart size={16} className="text-accent" /> Linki wsparcia — komenda /donate
        </h2>
        <DonateLinksForm initial={donate} />
      </section>
    </div>
  );
}
