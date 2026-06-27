import { Coffee, Heart } from 'lucide-react';
import DonateLinksForm from '../../components/DonateLinksForm';
import KofiForm from '../../components/KofiForm';
import StatusPill from '../../components/StatusPill';
import { getDonateConfig, getKofiConfig } from '../../lib/community';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function DonationsPage() {
  const [cfg, donate, guild, lang] = await Promise.all([
    getKofiConfig(),
    getDonateConfig(),
    getGuildMeta(),
    getPanelLocale(),
  ]);
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted">{tp(lang, 'ui.donations.intro')}</p>
        <StatusPill on={cfg.enabled} lang={lang} />
      </header>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Coffee size={16} className="text-accent" /> Ko-fi
          <span className="ms-auto normal-case">
            <StatusPill on={cfg.enabled} lang={lang} />
          </span>
        </h2>
        <KofiForm initial={cfg} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Heart size={16} className="text-accent" /> {tp(lang, 'ui.donations.donateLinksHeading')}
          <span className="ms-auto normal-case">
            <StatusPill on={donate.enabled} lang={lang} />
          </span>
        </h2>
        <DonateLinksForm initial={donate} />
      </section>
    </div>
  );
}
