import {
  Gift,
  Hash,
  Languages,
  Link2,
  Megaphone,
  MessageSquare,
  Mic,
  MousePointerClick,
  PartyPopper,
  Pin,
  SmilePlus,
  Star,
  Target,
  Trash2,
  UserPlus,
  Volume2,
} from 'lucide-react';
import AutoDeleteForm from '../../components/AutoDeleteForm';
import AutopublishForm from '../../components/AutopublishForm';
import AutoReactForm from '../../components/AutoReactForm';
import AutothreadForm from '../../components/AutothreadForm';
import ButtonRolesForm from '../../components/ButtonRolesForm';
import CountingForm from '../../components/CountingForm';
import EmptyState from '../../components/EmptyState';
import FlagTranslateForm from '../../components/FlagTranslateForm';
import GoalsForm from '../../components/GoalsForm';
import InvitesForm from '../../components/InvitesForm';
import MilestonesForm from '../../components/MilestonesForm';
import PinReactForm from '../../components/PinReactForm';
import QuoteLinkForm from '../../components/QuoteLinkForm';
import StarboardForm from '../../components/StarboardForm';
import StatusPill from '../../components/StatusPill';
import TempVoiceForm from '../../components/TempVoiceForm';
import VoiceRoleForm from '../../components/VoiceRoleForm';
import {
  getAutodeleteConfig,
  getAutopublishConfig,
  getAutoreactConfig,
  getAutothreadConfig,
  getFlagtransConfig,
  getGoalsConfig,
  getMilestonesConfig,
  getPinreactConfig,
  getQuotelinkConfig,
  getVoiceroleConfig,
} from '../../lib/community';
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
  const [
    btn,
    star,
    tv,
    counting,
    invites,
    autothread,
    autoreact,
    autodelete,
    quotelink,
    flagtrans,
    pinreact,
    voicerole,
    milestones,
    goals,
    autopub,
    giveaways,
    guild,
    lang,
  ] = await Promise.all([
    getButtonRoles(),
    getStarboard(),
    getTempVoice(),
    getCounting(),
    getInvitesConfig(),
    getAutothreadConfig(),
    getAutoreactConfig(),
    getAutodeleteConfig(),
    getQuotelinkConfig(),
    getFlagtransConfig(),
    getPinreactConfig(),
    getVoiceroleConfig(),
    getMilestonesConfig(),
    getGoalsConfig(),
    getAutopublishConfig(),
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
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <MessageSquare size={16} className="text-accent" />{' '}
          {tp(lang, 'ui.engagement.autothreadHeading')}
          <span className="ms-auto normal-case">
            <StatusPill on={autothread.enabled} lang={lang} />
          </span>
        </h2>
        <AutothreadForm initial={autothread} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <SmilePlus size={16} className="text-accent" />{' '}
          {tp(lang, 'ui.engagement.autoreactHeading')}
          <span className="ms-auto normal-case">
            <StatusPill on={autoreact.enabled} lang={lang} />
          </span>
        </h2>
        <AutoReactForm initial={autoreact} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Trash2 size={16} className="text-accent" /> {tp(lang, 'ui.engagement.autodeleteHeading')}
          <span className="ms-auto normal-case">
            <StatusPill on={autodelete.rules.length > 0} lang={lang} />
          </span>
        </h2>
        <AutoDeleteForm initial={autodelete} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Link2 size={16} className="text-accent" /> {tp(lang, 'ui.engagement.quotelinkHeading')}
          <span className="ms-auto normal-case">
            <StatusPill on={quotelink.enabled} lang={lang} />
          </span>
        </h2>
        <QuoteLinkForm initial={quotelink} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Languages size={16} className="text-accent" />{' '}
          {tp(lang, 'ui.engagement.flagtransHeading')}
          <span className="ms-auto normal-case">
            <StatusPill on={flagtrans.enabled} lang={lang} />
          </span>
        </h2>
        <FlagTranslateForm initial={flagtrans} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Pin size={16} className="text-accent" /> {tp(lang, 'ui.engagement.pinreactHeading')}
          <span className="ms-auto normal-case">
            <StatusPill on={pinreact.enabled} lang={lang} />
          </span>
        </h2>
        <PinReactForm initial={pinreact} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Mic size={16} className="text-accent" /> {tp(lang, 'ui.engagement.voiceroleHeading')}
          <span className="ms-auto normal-case">
            <StatusPill on={voicerole.enabled} lang={lang} />
          </span>
        </h2>
        <VoiceRoleForm initial={voicerole} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <PartyPopper size={16} className="text-accent" />{' '}
          {tp(lang, 'ui.engagement.milestonesHeading')}
          <span className="ms-auto normal-case">
            <StatusPill on={milestones.enabled} lang={lang} />
          </span>
        </h2>
        <MilestonesForm initial={milestones} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Target size={16} className="text-accent" /> {tp(lang, 'ui.engagement.goalsHeading')}
          <span className="ms-auto normal-case">
            <StatusPill on={goals.enabled} lang={lang} />
          </span>
        </h2>
        <GoalsForm initial={goals} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Megaphone size={16} className="text-accent" />{' '}
          {tp(lang, 'ui.engagement.autopublishHeading')}
          <span className="ms-auto normal-case">
            <StatusPill on={autopub.enabled} lang={lang} />
          </span>
        </h2>
        <AutopublishForm initial={autopub} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Gift size={16} className="text-accent" /> {tp(lang, 'ui.engagement.giveawaysHeading')}
        </h2>
        {giveaways.length === 0 ? (
          <EmptyState>
            {tp(lang, 'ui.engagement.giveawaysEmptyPre')}{' '}
            <code className="text-accent">/giveaway start</code>{' '}
            {tp(lang, 'ui.engagement.giveawaysEmptyMid')} <code>b5-schema.sql</code>{' '}
            {tp(lang, 'ui.engagement.giveawaysEmptyPost')}
          </EmptyState>
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
                  <tr
                    key={g.id}
                    className="border-b border-line/50 transition-colors hover:bg-white/[0.03]"
                  >
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
