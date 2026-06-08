import { Clapperboard, Rss } from 'lucide-react';
import CreatorForm from '../../components/CreatorForm';
import SocialFeedsForm from '../../components/SocialFeedsForm';
import { getSocialFeedsConfig } from '../../lib/community';
import { getCreatorConfig } from '../../lib/creator';
import { getGuildMeta } from '../../lib/guild';

export const dynamic = 'force-dynamic';

export default async function CreatorPage() {
  const [cfg, social, guild] = await Promise.all([
    getCreatorConfig(),
    getSocialFeedsConfig(),
    getGuildMeta(),
  ]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Narzędzia twórcy: automatyczne <strong>wydarzenie Discord</strong> gdy wejdziesz na live
        (Twitch EventSub) oraz <strong>relay klipów</strong> — bot wrzuca nowe klipy z Twitcha na
        wskazany kanał. Konfigurację zapisujesz tu (Supabase); bot stosuje ją na żywo.
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Clapperboard size={16} className="text-accent" /> Narzędzia twórcy
        </h2>
        <CreatorForm initial={cfg} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Rss size={16} className="text-accent" /> Powiadomienia o nowych postach (social / RSS)
        </h2>
        <SocialFeedsForm initial={social} guild={guild} />
      </section>
    </div>
  );
}
