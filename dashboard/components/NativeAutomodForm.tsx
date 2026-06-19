'use client';

// Etap I — sekcja „Discord AutoMod (natywny)": lista reguł serwera + kreatory szablonów
// jednym kliknięciem. Reguły egzekwuje sam Discord (działają nawet gdy bot offline).
import { useState } from 'react';
import type { NativeRule } from '../lib/discordAutomod';
import type { GuildMeta } from '../lib/guild';
import { type PanelLocale, tp } from '../lib/panelI18n';
import Hint from './Hint';
import { useLang } from './LangContext';
import { ChannelSelect } from './pickers';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

const TRIGGER_KEY: Record<number, string> = {
  1: 'ui.mod.nTrigger1',
  3: 'ui.mod.nTrigger3',
  4: 'ui.mod.nTrigger4',
  5: 'ui.mod.nTrigger5',
  6: 'ui.mod.nTrigger6',
};

function ruleDetail(r: NativeRule, lang: PanelLocale): string {
  if (r.triggerType === 1) return `${r.keywords.length} ${tp(lang, 'ui.mod.nDetailWords')}`;
  if (r.triggerType === 4) return tp(lang, 'ui.mod.nDetailPreset');
  if (r.triggerType === 5) return `max ${r.mentionLimit ?? '?'} ${tp(lang, 'ui.mod.nMentions')}`;
  return '';
}

function actionBadges(r: NativeRule, lang: PanelLocale): string[] {
  return r.actions.map((a) => {
    if (a.type === 1) return tp(lang, 'ui.mod.nBadgeBlock');
    if (a.type === 2) return tp(lang, 'ui.mod.nBadgeAlert');
    if (a.type === 3)
      return `${tp(lang, 'ui.mod.nBadgeTimeout')} ${Math.round((a.durationSec ?? 0) / 60)} ${tp(lang, 'ui.mod.nMin')}`;
    return `${tp(lang, 'ui.mod.nBadgeAction')} ${a.type}`;
  });
}

export default function NativeAutomodForm({
  initial,
  guild,
}: {
  initial: NativeRule[] | null;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [rules, setRules] = useState<NativeRule[]>(initial ?? []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [kwName, setKwName] = useState('');
  const [kwWords, setKwWords] = useState('');
  const [kwAlert, setKwAlert] = useState('');
  const [mentionLimit, setMentionLimit] = useState(8);

  if (initial === null) {
    return (
      <p className="text-sm text-muted">
        {tp(lang, 'ui.mod.nErrorFetchPre')} <strong>{tp(lang, 'ui.mod.nErrorFetchPerm')}</strong>{' '}
        {tp(lang, 'ui.mod.nErrorFetchPost')} <code>DISCORD_BOT_TOKEN</code>
        {tp(lang, 'ui.mod.nErrorFetchEnd')}
      </p>
    );
  }

  async function call(body: Record<string, unknown>): Promise<void> {
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/automod-native', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = (await r.json()) as { ok: boolean; error?: string };
      if (!j.ok) {
        setErr(j.error || tp(lang, 'ui.mod.nUnknownError'));
      } else {
        const fresh = await fetch('/api/automod-native');
        const fj = (await fresh.json()) as { ok: boolean; rules: NativeRule[] };
        if (fj.ok) setRules(fj.rules);
      }
    } catch {
      setErr(tp(lang, 'ui.mod.nConnError'));
    }
    setBusy(false);
  }

  const has = (t: number) => rules.some((r) => r.triggerType === t);
  const keywordCount = rules.filter((r) => r.triggerType === 1).length;

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        {tp(lang, 'ui.mod.nIntroPre')} <strong>{tp(lang, 'ui.mod.nIntroStrong')}</strong>{' '}
        {tp(lang, 'ui.mod.nIntroMid')} <em>{tp(lang, 'ui.mod.nIntroEm')}</em>{' '}
        {tp(lang, 'ui.mod.nIntroPost')}
      </p>

      {rules.length === 0 ? (
        <p className="text-sm text-muted">{tp(lang, 'ui.mod.nEmpty')}</p>
      ) : (
        <ul className="space-y-2">
          {rules.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-bg/40 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white/90">{r.name}</p>
                <p className="text-xs text-muted">
                  {TRIGGER_KEY[r.triggerType]
                    ? tp(lang, TRIGGER_KEY[r.triggerType])
                    : `${tp(lang, 'ui.mod.nTypePrefix')} ${r.triggerType}`}
                  {ruleDetail(r, lang) && <> · {ruleDetail(r, lang)}</>}
                  {actionBadges(r, lang).length > 0 && <> · {actionBadges(r, lang).join(' · ')}</>}
                </p>
              </div>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-semibold ${r.enabled ? 'bg-green-500/15 text-green-300' : 'bg-line text-muted'}`}
              >
                {r.enabled ? tp(lang, 'ui.mod.nActive') : tp(lang, 'ui.mod.nDisabled')}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => call({ action: 'toggle', id: r.id, enabled: !r.enabled })}
                className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold transition hover:border-accent disabled:opacity-50"
              >
                {r.enabled ? tp(lang, 'ui.mod.nDisable') : tp(lang, 'ui.mod.nEnable')}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => call({ action: 'delete', id: r.id })}
                className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-accent transition hover:border-accent disabled:opacity-50"
              >
                {tp(lang, 'ui.mod.nDelete')}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-xl border border-line bg-bg/40 p-4 space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          {tp(lang, 'ui.mod.nTemplatesLabel')}
          <Hint text={tp(lang, 'ui.mod.nTemplatesHint')} />
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || has(4)}
            onClick={() => call({ action: 'create-preset' })}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold transition hover:bg-accent-hover disabled:opacity-40"
          >
            {tp(lang, 'ui.mod.nBtnPreset')}
          </button>
          <button
            type="button"
            disabled={busy || has(3)}
            onClick={() => call({ action: 'create-spam' })}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold transition hover:bg-accent-hover disabled:opacity-40"
          >
            {tp(lang, 'ui.mod.nBtnSpam')}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={busy || has(5)}
              onClick={() => call({ action: 'create-mention', limit: mentionLimit })}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold transition hover:bg-accent-hover disabled:opacity-40"
            >
              {tp(lang, 'ui.mod.nBtnMention')}
            </button>
            <input
              type="number"
              min={1}
              max={50}
              value={mentionLimit}
              onChange={(e) =>
                setMentionLimit(Math.min(50, Math.max(1, Math.floor(Number(e.target.value) || 8))))
              }
              className={`${inputCls} w-20`}
              title={tp(lang, 'ui.mod.nMentionInputTitle')}
            />
          </div>
        </div>

        <div className="space-y-3 border-t border-line pt-4">
          <p className="text-sm font-semibold text-white/90">
            {tp(lang, 'ui.mod.nKeywordListPre')} ({keywordCount}/6)
            <Hint text={tp(lang, 'ui.mod.nKeywordHint')} />
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={kwName}
              onChange={(e) => setKwName(e.target.value)}
              className={inputCls}
              placeholder={tp(lang, 'ui.mod.nRuleNamePh')}
              maxLength={100}
            />
            <ChannelSelect
              value={kwAlert}
              onChange={setKwAlert}
              channels={guild.channels}
              placeholder={tp(lang, 'ui.mod.nAlertChannelPh')}
            />
          </div>
          <textarea
            value={kwWords}
            onChange={(e) => setKwWords(e.target.value)}
            className={`${inputCls} min-h-20`}
            placeholder={tp(lang, 'ui.mod.nWordsPh')}
          />
          <button
            type="button"
            disabled={busy || keywordCount >= 6 || !kwName.trim() || !kwWords.trim()}
            onClick={() => {
              const keywords = kwWords
                .split(',')
                .map((w) => w.trim())
                .filter(Boolean)
                .slice(0, 50);
              void call({
                action: 'create-keyword',
                name: kwName.trim(),
                keywords,
                ...(kwAlert ? { alertChannelId: kwAlert } : {}),
              }).then(() => {
                setKwName('');
                setKwWords('');
              });
            }}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold transition hover:bg-accent-hover disabled:opacity-40"
          >
            {tp(lang, 'ui.mod.nAddKeywordRule')}
          </button>
        </div>
      </div>

      {busy && <p className="text-sm text-muted">{tp(lang, 'ui.mod.nSaving')}</p>}
      {err && <p className="text-sm text-accent">⚠️ {err}</p>}
    </div>
  );
}
