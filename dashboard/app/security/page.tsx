import { ShieldAlert, Siren, UserCheck } from 'lucide-react';
import AntinukeForm from '../../components/AntinukeForm';
import AntiRaidForm from '../../components/AntiRaidForm';
import StatusPill from '../../components/StatusPill';
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

  // Kokpit Dowództwa: kafelki statusu 3 ochron (stan z configu) + licznik aktywnych.
  const protections = [
    { label: 'Anti-Nuke', icon: ShieldAlert, on: config.enabled },
    { label: tp(lang, 'ui.security.headingVerify'), icon: UserCheck, on: verification.enabled },
    { label: 'Anti-raid', icon: Siren, on: antiraid.enabled },
  ];
  const active = protections.filter((p) => p.on).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted">{tp(lang, 'ui.security.intro')}</p>
        <span className={`status-pill${active ? ' is-on' : ''}`}>
          <span className="dot" />
          {active}/{protections.length} {active ? tp(lang, 'ui.cmd.on') : tp(lang, 'ui.cmd.off')}
        </span>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {protections.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.label} className="stat-tile lift flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                <Icon size={17} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{p.label}</div>
                <StatusPill on={p.on} lang={lang} />
              </div>
            </div>
          );
        })}
      </div>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <ShieldAlert size={16} className="text-accent" /> Anti-Nuke
          <span className="ms-auto normal-case">
            <StatusPill on={config.enabled} lang={lang} />
          </span>
        </h2>
        <AntinukeForm initial={config} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <UserCheck size={16} className="text-accent" /> {tp(lang, 'ui.security.headingVerify')}
          <span className="ms-auto normal-case">
            <StatusPill on={verification.enabled} lang={lang} />
          </span>
        </h2>
        <VerificationForm initial={verification} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Siren size={16} className="text-accent" /> Anti-raid
          <span className="ms-auto normal-case">
            <StatusPill on={antiraid.enabled} lang={lang} />
          </span>
        </h2>
        <AntiRaidForm initial={antiraid} guild={guild} />
      </section>
    </div>
  );
}
