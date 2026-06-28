import { Coins, ExternalLink, MessageSquare, Mic } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { getEconomyConfig, ghostUrl } from '../../lib/economy';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function EconomyPage() {
  const [cfg, lang] = await Promise.all([getEconomyConfig(), getPanelLocale()]);
  const portal = ghostUrl();

  if (!cfg) {
    return (
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <p className="text-sm text-muted">{tp(lang, 'ui.economy.configError')}</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        {tp(lang, 'ui.economy.intro')}{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">{tp(lang, 'ui.economy.enabledOn')}</span>
        ) : (
          <span className="font-semibold text-accent">{tp(lang, 'ui.economy.enabledOff')}</span>
        )}
      </p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label={tp(lang, 'ui.economy.cardMsgReward')}
          value={cfg.messageReward}
          hint={`${tp(lang, 'ui.economy.cooldown')} ${cfg.messageCooldownSeconds}s`}
          icon={<MessageSquare size={14} />}
          accent
        />
        <StatCard
          label={tp(lang, 'ui.economy.cardVoiceReward')}
          value={cfg.voiceRewardPerMinute}
          hint={`${tp(lang, 'ui.economy.tickEvery')} ${cfg.voiceTickSeconds}s`}
          icon={<Mic size={14} />}
        />
        <StatCard
          label={tp(lang, 'ui.economy.cardStatus')}
          value={cfg.enabled ? 'ON' : 'OFF'}
          icon={<Coins size={14} />}
        />
      </div>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Coins size={16} className="text-accent" /> {tp(lang, 'ui.economy.rulesHeading')}
        </h2>
        <ul className="space-y-2 text-sm">
          <li>
            {tp(lang, 'ui.economy.ruleMsgLabel')}{' '}
            <strong className="text-accent">+{cfg.messageReward} GT</strong> (
            {tp(lang, 'ui.economy.ruleMsgMax')} {cfg.messageCooldownSeconds}s)
          </li>
          <li>
            {tp(lang, 'ui.economy.ruleVoiceLabel')}{' '}
            <strong className="text-accent">+{cfg.voiceRewardPerMinute} GT/min</strong> (
            {tp(lang, 'ui.economy.tickEvery')} {cfg.voiceTickSeconds}s)
          </li>
          <li>
            {tp(lang, 'ui.economy.ruleAfk')}{' '}
            {cfg.afkGivesReward ? tp(lang, 'ui.economy.yes') : tp(lang, 'ui.economy.no')}
          </li>
          <li>
            {tp(lang, 'ui.economy.ruleMuted')}{' '}
            {cfg.mutedGivesReward ? tp(lang, 'ui.economy.yes') : tp(lang, 'ui.economy.no')}
          </li>
        </ul>
        <p className="mt-3 text-xs text-muted">
          {tp(lang, 'ui.economy.ratesUpdated')}{' '}
          {cfg.updatedAt ? new Date(cfg.updatedAt).toLocaleString('pl-PL') : '—'}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={portal}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold transition hover:bg-accent-hover"
          >
            {tp(lang, 'ui.economy.portalBtn')} <ExternalLink size={14} />
          </a>
          <a
            href={`${portal}/admin`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-4 py-2 text-sm font-semibold transition hover:bg-elevated"
          >
            {tp(lang, 'ui.economy.changeRatesBtn')}
          </a>
        </div>
      </section>

      <p className="text-xs text-muted">
        {tp(lang, 'ui.economy.linkHelpPre')}
        <code className="text-accent">/link &lt;{tp(lang, 'ui.economy.codeArg')}&gt;</code>
        {tp(lang, 'ui.economy.linkHelpPost')}
      </p>
    </div>
  );
}
