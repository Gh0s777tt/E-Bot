import { Bot, Gauge, Gavel, Hourglass, Inbox, ShieldCheck, UserCog, Zap } from 'lucide-react';
import AiModForm from '../../components/AiModForm';
import AppealsForm from '../../components/AppealsForm';
import AutomodForm from '../../components/AutomodForm';
import AutomodStats from '../../components/AutomodStats';
import AutoslowForm from '../../components/AutoslowForm';
import EmptyState from '../../components/EmptyState';
import NativeAutomodForm from '../../components/NativeAutomodForm';
import RegexTester from '../../components/RegexTester';
import StatusPill from '../../components/StatusPill';
import StickyRolesForm from '../../components/StickyRolesForm';
import {
  getAiModConfig,
  getAppealsConfig,
  getAutomodConfig,
  getAutomodStats,
  getAutoslowConfig,
  getStickyrolesConfig,
} from '../../lib/community';
import { getNativeRules } from '../../lib/discordAutomod';
import { getModCases, getTempBans } from '../../lib/faza4';
import { getGuildMeta, getPrimaryGuildId } from '../../lib/guild';
import { type PanelLocale, tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

const ACTION_STYLE: Record<string, string> = {
  warn: 'bg-yellow-500/15 text-yellow-300',
  timeout: 'bg-orange-500/15 text-orange-300',
  clear: 'bg-sky-500/15 text-sky-300',
  note: 'bg-violet-500/15 text-violet-300',
  kick: 'bg-accent/15 text-accent',
  tempban: 'bg-accent/15 text-accent',
  unban: 'bg-green-500/15 text-green-300',
  ban: 'bg-accent/20 text-accent',
};

function fmt(d: string): string {
  try {
    return new Date(d).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return d;
  }
}

function remaining(iso: string, lang: PanelLocale): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return tp(lang, 'ui.mod.soon');
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(' ') || '<1m';
}

export default async function ModerationPage() {
  const [
    cfg,
    aimod,
    cases,
    tempbans,
    guild,
    stats,
    nativeRules,
    appeals,
    autoslow,
    sticky,
    guildId,
    lang,
  ] = await Promise.all([
    getAutomodConfig(),
    getAiModConfig(),
    getModCases(30),
    getTempBans(50),
    getGuildMeta(),
    getAutomodStats(),
    getNativeRules(),
    getAppealsConfig(),
    getAutoslowConfig(),
    getStickyrolesConfig(),
    getPrimaryGuildId(),
    getPanelLocale(),
  ]);
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-3xl text-sm text-muted">
          {tp(lang, 'ui.mod.introPre')} <code className="text-accent">/mod</code>{' '}
          {tp(lang, 'ui.mod.introMid')} <code className="text-accent">/case user|recent</code>{' '}
          {tp(lang, 'ui.mod.introMid2')} <strong>{tp(lang, 'ui.mod.introSecurity')}</strong>
          {tp(lang, 'ui.mod.introPost')}
        </p>
        <StatusPill on={cfg.enabled} lang={lang} />
      </header>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <ShieldCheck size={16} className="text-accent" /> {tp(lang, 'ui.mod.headingAutomod')}
          <span className="ms-auto normal-case">
            <StatusPill on={cfg.enabled} lang={lang} />
          </span>
        </h2>
        <AutomodForm initial={cfg} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Zap size={16} className="text-accent" /> {tp(lang, 'ui.mod.headingNative')}
        </h2>
        <NativeAutomodForm initial={nativeRules} guild={guild} />
      </section>

      <AutomodStats stats={stats} lang={lang} />

      <RegexTester />

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Bot size={16} className="text-accent" /> {tp(lang, 'ui.mod.headingAiMod')}
          <span className="ms-auto normal-case">
            <StatusPill on={aimod.enabled} lang={lang} />
          </span>
        </h2>
        <AiModForm initial={aimod} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Inbox size={16} className="text-accent" /> {tp(lang, 'ui.appeals.heading')}
          <span className="ms-auto normal-case">
            <StatusPill on={appeals.enabled} lang={lang} />
          </span>
        </h2>
        <AppealsForm initial={appeals} guild={guild} guildId={guildId} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Gauge size={16} className="text-accent" /> {tp(lang, 'ui.autoslow.heading')}
          <span className="ms-auto normal-case">
            <StatusPill on={autoslow.enabled} lang={lang} />
          </span>
        </h2>
        <AutoslowForm initial={autoslow} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <UserCog size={16} className="text-accent" /> {tp(lang, 'ui.sticky.heading')}
          <span className="ms-auto normal-case">
            <StatusPill on={sticky.enabled} lang={lang} />
          </span>
        </h2>
        <StickyRolesForm initial={sticky} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Gavel size={16} className="text-accent" /> {tp(lang, 'ui.mod.headingCases')}
        </h2>
        {cases.length === 0 ? (
          <EmptyState>
            {tp(lang, 'ui.mod.casesEmptyPre')}{' '}
            <code className="text-accent">/mod warn|timeout|clear</code>{' '}
            {tp(lang, 'ui.mod.casesEmptyMid')} <code>mod-cases-schema.sql</code>{' '}
            {tp(lang, 'ui.mod.casesEmptyPost')}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-line">
                  <th className="px-3 py-2">{tp(lang, 'ui.mod.thAction')}</th>
                  <th className="px-3 py-2">{tp(lang, 'ui.mod.thUser')}</th>
                  <th className="px-3 py-2">{tp(lang, 'ui.mod.thMod')}</th>
                  <th className="px-3 py-2">{tp(lang, 'ui.mod.thReason')}</th>
                  <th className="px-3 py-2">{tp(lang, 'ui.mod.thWhen')}</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-line/50 transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold uppercase ${ACTION_STYLE[c.action] ?? 'bg-line text-muted'}`}
                      >
                        {c.action}
                      </span>
                    </td>
                    <td className="px-3 py-2">{c.username || c.user_id || '—'}</td>
                    <td className="px-3 py-2 text-muted">{c.moderator_name || '—'}</td>
                    <td className="px-3 py-2 text-muted">{c.reason || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted">{fmt(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <Hourglass size={16} className="text-accent" /> {tp(lang, 'ui.mod.headingTempbans')}
        </h2>
        {tempbans.length === 0 ? (
          <EmptyState>
            {tp(lang, 'ui.mod.tbEmptyPre')} <code className="text-accent">/mod tempban</code>{' '}
            {tp(lang, 'ui.mod.tbEmptyMid')} <code>f6-moderation-schema.sql</code>{' '}
            {tp(lang, 'ui.mod.tbEmptyPost')}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-line">
                  <th className="px-3 py-2">{tp(lang, 'ui.mod.thUser')}</th>
                  <th className="px-3 py-2">{tp(lang, 'ui.mod.thReason')}</th>
                  <th className="px-3 py-2">{tp(lang, 'ui.mod.thAutoUnban')}</th>
                  <th className="px-3 py-2">{tp(lang, 'ui.mod.thRemaining')}</th>
                </tr>
              </thead>
              <tbody>
                {tempbans.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-line/50 transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-3 py-2">{t.username || t.user_id}</td>
                    <td className="px-3 py-2 text-muted">{t.reason || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted">{fmt(t.unban_at)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted">
                      {remaining(t.unban_at, lang)}
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
