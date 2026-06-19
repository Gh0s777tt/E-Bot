import { Coins, FileText, HelpCircle, MessageSquare, Sparkles, Users } from 'lucide-react';
import AiConfigForm from '../../components/AiConfigForm';
import AiDigestForm from '../../components/AiDigestForm';
import AiHelpForm from '../../components/AiHelpForm';
import StatCard from '../../components/StatCard';
import { getAiDigestConfig, getAiHelpConfig } from '../../lib/community';
import { getAiConfig, getAiUsageToday } from '../../lib/faza4';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function AiPage() {
  const [cfg, usage, aihelp, aidigest, guild, lang] = await Promise.all([
    getAiConfig(),
    getAiUsageToday(),
    getAiHelpConfig(),
    getAiDigestConfig(),
    getGuildMeta(),
    getPanelLocale(),
  ]);

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        {tp(lang, 'ui.ai.introPre')}
        <code className="text-accent">/ai</code>
        {tp(lang, 'ui.ai.introAi')}
        <code className="text-accent">/tldr</code>
        {tp(lang, 'ui.ai.introTldr')}
        <code className="text-accent">/translate</code>
        {tp(lang, 'ui.ai.introTranslate')}
        <code className="text-accent">/imagine</code>
        {tp(lang, 'ui.ai.introImagine')}{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">{tp(lang, 'ui.ai.enabledOn')}</span>
        ) : (
          <span className="font-semibold text-accent">{tp(lang, 'ui.ai.enabledOff')}</span>
        )}
      </p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={tp(lang, 'ui.ai.cardRequests')}
          value={usage.totalRequests}
          icon={<MessageSquare size={14} />}
          accent
        />
        <StatCard
          label={tp(lang, 'ui.ai.cardTokens')}
          value={usage.totalTokens}
          icon={<Coins size={14} />}
        />
        <StatCard
          label={tp(lang, 'ui.ai.cardUsers')}
          value={usage.users}
          icon={<Users size={14} />}
        />
        <StatCard
          label={tp(lang, 'ui.ai.cardModel')}
          value={cfg.model}
          icon={<Sparkles size={14} />}
        />
      </div>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Sparkles size={16} className="text-accent" /> {tp(lang, 'ui.ai.configHeading')}
        </h2>
        <AiConfigForm initial={cfg} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <HelpCircle size={16} className="text-accent" /> {tp(lang, 'ui.ai.helpHeading')}
        </h2>
        <AiHelpForm initial={aihelp} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <FileText size={16} className="text-accent" /> {tp(lang, 'ui.ai.digestHeading')}
        </h2>
        <AiDigestForm initial={aidigest} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Users size={16} className="text-accent" /> {tp(lang, 'ui.ai.usageHeading')}
        </h2>
        {usage.top.length === 0 ? (
          <p className="text-sm text-muted">
            {tp(lang, 'ui.ai.usageEmptyPre')}
            <code className="text-accent">scripts/faza4-schema.sql</code>
            {tp(lang, 'ui.ai.usageEmptyMid')}
            <code className="text-accent">/ai</code>
            {tp(lang, 'ui.ai.usageEmptyPost')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-3">{tp(lang, 'ui.ai.thUser')}</th>
                  <th className="py-2 pr-3">{tp(lang, 'ui.ai.thRequests')}</th>
                  <th className="py-2">{tp(lang, 'ui.ai.thTokens')}</th>
                </tr>
              </thead>
              <tbody>
                {usage.top.map((u) => (
                  <tr key={u.user_id} className="border-b border-line/50">
                    <td className="py-2 pr-3 font-mono text-xs">{u.user_id}</td>
                    <td className="py-2 pr-3">{u.requests}</td>
                    <td className="py-2">{u.tokens_used.toLocaleString('pl-PL')}</td>
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
