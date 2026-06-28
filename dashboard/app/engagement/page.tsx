import { Gift, Hash, MousePointerClick, Star, UserPlus, Volume2 } from 'lucide-react';
import ButtonRolesForm from '../../components/ButtonRolesForm';
import CountingForm from '../../components/CountingForm';
import InvitesForm from '../../components/InvitesForm';
import StarboardForm from '../../components/StarboardForm';
import StatusPill from '../../components/StatusPill';
import TempVoiceForm from '../../components/TempVoiceForm';
import {
  getButtonRoles,
  getCounting,
  getGiveaways,
  getInvitesConfig,
  getStarboard,
  getTempVoice,
} from '../../lib/engagement';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

function fmt(d: string): string {
  try {
    return new Date(d).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return d;
  }
}

export default async function EngagementPage() {
  const [btn, star, tv, counting, invites, giveaways, guild, lang] = await Promise.all([
    getButtonRoles(),
    getStarboard(),
    getTempVoice(),
    getCounting(),
    getInvitesConfig(),
    getGiveaways(20),
    getGuildMeta(),
    getPanelLocale(),
  ]);

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        {tp(lang, 'ui.engagement.intro')} <code className="text-accent">/buttonpanel</code>,{' '}
        <code className="text-accent">/giveaway start</code>,{' '}
        <code className="text-accent">/remind</code>.
      </p>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <MousePointerClick size={16} className="text-accent" />{' '}
          {tp(lang, 'ui.engagement.buttonRolesHeading')}
          <span className="ms-auto normal-case">
            <StatusPill on={btn.buttons.length > 0} lang={lang} />
          </span>
        </h2>
        <ButtonRolesForm initial={btn} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Star size={16} className="text-accent" /> {tp(lang, 'ui.engagement.starboardHeading')}
          <span className="ms-auto normal-case">
            <StatusPill on={star.enabled} lang={lang} />
          </span>
        </h2>
        <StarboardForm initial={star} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Volume2 size={16} className="text-accent" /> {tp(lang, 'ui.engagement.tempVoiceHeading')}
          <span className="ms-auto normal-case">
            <StatusPill on={tv.enabled} lang={lang} />
          </span>
        </h2>
        <TempVoiceForm initial={tv} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Hash size={16} className="text-accent" /> {tp(lang, 'ui.engagement.countingHeading')}
          <span className="ms-auto normal-case">
            <StatusPill on={counting.enabled} lang={lang} />
          </span>
        </h2>
        <CountingForm initial={counting} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <UserPlus size={16} className="text-accent" /> {tp(lang, 'ui.engagement.invitesHeading')}
          <span className="ms-auto normal-case">
            <StatusPill on={invites.enabled} lang={lang} />
          </span>
        </h2>
        <InvitesForm initial={invites} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Gift size={16} className="text-accent" /> {tp(lang, 'ui.engagement.giveawaysHeading')}
        </h2>
        {giveaways.length === 0 ? (
          <p className="text-sm text-muted">
            {tp(lang, 'ui.engagement.giveawaysEmptyPre')}{' '}
            <code className="text-accent">/giveaway start</code>{' '}
            {tp(lang, 'ui.engagement.giveawaysEmptyMid')} <code>b5-schema.sql</code>{' '}
            {tp(lang, 'ui.engagement.giveawaysEmptyPost')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-line">
                  <th className="px-3 py-2">{tp(lang, 'ui.engagement.thPrize')}</th>
                  <th className="px-3 py-2">{tp(lang, 'ui.engagement.thWinners')}</th>
                  <th className="px-3 py-2">{tp(lang, 'ui.engagement.thEnd')}</th>
                  <th className="px-3 py-2">{tp(lang, 'ui.engagement.thStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {giveaways.map((g) => (
                  <tr key={g.id} className="border-b border-line/50">
                    <td className="px-3 py-2">{g.prize}</td>
                    <td className="px-3 py-2 text-muted">{g.winners}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted">{fmt(g.ends_at)}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                          g.ended ? 'bg-white/10 text-muted' : 'bg-accent/15 text-accent'
                        }`}
                      >
                        {g.ended
                          ? tp(lang, 'ui.engagement.statusEnded')
                          : tp(lang, 'ui.engagement.statusActive')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
