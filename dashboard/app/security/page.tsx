import { ShieldAlert, Siren, UserCheck } from 'lucide-react';
import AntinukeForm from '../../components/AntinukeForm';
import AntiRaidForm from '../../components/AntiRaidForm';
import VerificationForm from '../../components/VerificationForm';
import { getAntiRaidConfig, getVerificationConfig } from '../../lib/community';
import { getAntinuke } from '../../lib/data';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function SecurityPage() {
  const [config, verification, antiraid, guild, lang] = await Promise.all([
    getAntinuke(),
    getVerificationConfig(),
    getAntiRaidConfig(),
    getGuildMeta(),
    getPanelLocale(),
  ]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">{tp(lang, 'ui.security.intro')}</p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <ShieldAlert size={16} className="text-accent" /> Anti-Nuke
        </h2>
        <AntinukeForm initial={config} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <UserCheck size={16} className="text-accent" /> {tp(lang, 'ui.security.headingVerify')}
        </h2>
        <VerificationForm initial={verification} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Siren size={16} className="text-accent" /> Anti-raid
        </h2>
        <AntiRaidForm initial={antiraid} guild={guild} />
      </section>
    </div>
  );
}
