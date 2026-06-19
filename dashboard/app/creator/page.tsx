import { Clapperboard, Rss } from 'lucide-react';
import CreatorForm from '../../components/CreatorForm';
import SocialFeedsForm from '../../components/SocialFeedsForm';
import { getSocialFeedsConfig } from '../../lib/community';
import { getCreatorConfig } from '../../lib/creator';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function CreatorPage() {
  const [cfg, social, guild, lang] = await Promise.all([
    getCreatorConfig(),
    getSocialFeedsConfig(),
    getGuildMeta(),
    getPanelLocale(),
  ]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">{tp(lang, 'ui.creator.intro')}</p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Clapperboard size={16} className="text-accent" /> {tp(lang, 'ui.creator.creatorHeading')}
        </h2>
        <CreatorForm initial={cfg} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Rss size={16} className="text-accent" /> {tp(lang, 'ui.creator.socialHeading')}
        </h2>
        <SocialFeedsForm initial={social} guild={guild} />
      </section>
    </div>
  );
}
