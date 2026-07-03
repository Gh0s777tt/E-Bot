'use client';

import { useState } from 'react';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { saveConfig } from '../lib/saveConfig';
import { useLang } from './LangContext';
import { ChannelSelect, RoleSelect } from './pickers';
import SaveButton from './SaveButton';

type PiiTypes = {
  creditCard: boolean;
  pesel: boolean;
  idCard: boolean;
  iban: boolean;
  email: boolean;
  phone: boolean;
};
const PII_DEF: PiiTypes = {
  creditCard: true,
  pesel: true,
  idCard: true,
  iban: true,
  email: true,
  phone: false,
};
const PII_FIELDS: { key: keyof PiiTypes; labelKey: string }[] = [
  { key: 'creditCard', labelKey: 'ui.mod.piiCreditCard' },
  { key: 'pesel', labelKey: 'ui.mod.piiPesel' },
  { key: 'idCard', labelKey: 'ui.mod.piiIdCard' },
  { key: 'iban', labelKey: 'ui.mod.piiIban' },
  { key: 'email', labelKey: 'ui.mod.piiEmail' },
  { key: 'phone', labelKey: 'ui.mod.piiPhone' },
];
type Cfg = {
  enabled: boolean;
  blockInvites: boolean;
  blockLinks: boolean;
  maxMentions: number;
  antiSpamCount: number;
  antiSpamSec: number;
  modlogChannelId: string;
  exemptRoleId: string;
  bannedWords: string[];
  bannedRegex: string[];
  allowedLinks: string[];
  ignoreChannels: string[];
  antiScam: { enabled: boolean; customDomains: string[] };
  pii: { enabled: boolean; types: PiiTypes };
  action: 'delete' | 'timeout' | 'kick' | 'ban';
  timeoutMinutes: number;
  escalation: {
    enabled: boolean;
    threshold: number;
    windowMin: number;
    action: 'timeout' | 'kick' | 'ban';
  };
  antiCaps: { enabled: boolean; percent: number; minLength: number };
  antiSpoiler: { enabled: boolean; maxSpoilers: number };
};
type ListKey = 'bannedWords' | 'bannedRegex' | 'allowedLinks' | 'ignoreChannels';
type Init = Omit<
  Cfg,
  | ListKey
  | 'antiScam'
  | 'pii'
  | 'action'
  | 'timeoutMinutes'
  | 'escalation'
  | 'antiCaps'
  | 'antiSpoiler'
> &
  Partial<Pick<Cfg, ListKey>> & {
    antiScam?: { enabled?: boolean; customDomains?: string[] };
    pii?: { enabled?: boolean; types?: Partial<PiiTypes> };
    action?: Cfg['action'];
    timeoutMinutes?: number;
    escalation?: Partial<Cfg['escalation']>;
    antiCaps?: Partial<Cfg['antiCaps']>;
    antiSpoiler?: Partial<Cfg['antiSpoiler']>;
  };

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const num = (v: string): number => Math.max(0, Math.floor(Number(v) || 0));
const toLines = (a: string[]): string => a.join('\n');
const fromLines = (s: string): string[] =>
  s
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);

export default function AutomodForm({ initial, guild }: { initial: Init; guild: GuildMeta }) {
  const { lang } = useLang();
  const [c, setC] = useState<Cfg>({
    ...initial,
    bannedWords: initial.bannedWords ?? [],
    bannedRegex: initial.bannedRegex ?? [],
    allowedLinks: initial.allowedLinks ?? [],
    ignoreChannels: initial.ignoreChannels ?? [],
    antiScam: {
      enabled: initial.antiScam?.enabled ?? false,
      customDomains: initial.antiScam?.customDomains ?? [],
    },
    pii: {
      enabled: initial.pii?.enabled ?? false,
      types: { ...PII_DEF, ...(initial.pii?.types ?? {}) },
    },
    action: initial.action ?? 'delete',
    timeoutMinutes: initial.timeoutMinutes ?? 10,
    escalation: {
      enabled: initial.escalation?.enabled ?? false,
      threshold: initial.escalation?.threshold ?? 3,
      windowMin: initial.escalation?.windowMin ?? 10,
      action: initial.escalation?.action ?? 'timeout',
    },
    antiCaps: {
      enabled: initial.antiCaps?.enabled ?? false,
      percent: initial.antiCaps?.percent ?? 70,
      minLength: initial.antiCaps?.minLength ?? 10,
    },
    antiSpoiler: {
      enabled: initial.antiSpoiler?.enabled ?? false,
      maxSpoilers: initial.antiSpoiler?.maxSpoilers ?? 5,
    },
  });
  const [wordsText, setWordsText] = useState(toLines(initial.bannedWords ?? []));
  const [regexText, setRegexText] = useState(toLines(initial.bannedRegex ?? []));
  const [linksText, setLinksText] = useState(toLines(initial.allowedLinks ?? []));
  const [scamText, setScamText] = useState(toLines(initial.antiScam?.customDomains ?? []));
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function save() {
    setSt('saving');
    const payload: Cfg = {
      ...c,
      bannedWords: fromLines(wordsText),
      bannedRegex: fromLines(regexText),
      allowedLinks: fromLines(linksText),
      antiScam: { enabled: c.antiScam.enabled, customDomains: fromLines(scamText) },
    };
    const res = await saveConfig('/api/automod', payload);
    setErrMsg(res.error);
    setSt(res.ok ? 'ok' : 'err');
    setTimeout(() => setSt('idle'), 2500);
  }

  const toggle = (k: keyof Cfg, label: string) => (
    <label className="flex items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={c[k] as boolean}
        onChange={(e) => setC({ ...c, [k]: e.target.checked })}
        className="h-4 w-4 accent-accent"
      />
      <span className="font-semibold text-white/90">{label}</span>
    </label>
  );

  const channelName = (id: string) => guild.channels.find((ch) => ch.id === id)?.name ?? id;
  const addIgnore = (id: string) => {
    if (id && !c.ignoreChannels.includes(id))
      setC({ ...c, ignoreChannels: [...c.ignoreChannels, id] });
  };
  const removeIgnore = (id: string) =>
    setC({ ...c, ignoreChannels: c.ignoreChannels.filter((x) => x !== id) });

  return (
    <div className="max-w-xl space-y-4">
      {toggle('enabled', tp(lang, 'ui.mod.enabledToggle'))}
      <div className="grid gap-2 sm:grid-cols-2">
        {toggle('blockInvites', tp(lang, 'ui.mod.blockInvites'))}
        {toggle('blockLinks', tp(lang, 'ui.mod.blockLinks'))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.mod.maxMentions')}</span>
          <input
            type="number"
            value={c.maxMentions}
            onChange={(e) => setC({ ...c, maxMentions: num(e.target.value) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.mod.antiSpamCount')}</span>
          <input
            type="number"
            value={c.antiSpamCount}
            onChange={(e) => setC({ ...c, antiSpamCount: num(e.target.value) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.mod.antiSpamSec')}</span>
          <input
            type="number"
            value={c.antiSpamSec}
            onChange={(e) => setC({ ...c, antiSpamSec: Math.max(1, num(e.target.value)) })}
            className={inputCls}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.mod.actionLabel')}</span>
          <select
            value={c.action}
            onChange={(e) => setC({ ...c, action: e.target.value as Cfg['action'] })}
            className={inputCls}
          >
            <option value="delete">{tp(lang, 'ui.mod.actDelete')}</option>
            <option value="timeout">{tp(lang, 'ui.mod.actTimeout')}</option>
            <option value="kick">{tp(lang, 'ui.mod.actKick')}</option>
            <option value="ban">{tp(lang, 'ui.mod.actBan')}</option>
          </select>
        </label>
        {c.action === 'timeout' && (
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-white/90">{tp(lang, 'ui.mod.timeoutMinutes')}</span>
            <input
              type="number"
              value={c.timeoutMinutes}
              onChange={(e) => setC({ ...c, timeoutMinutes: Math.max(1, num(e.target.value)) })}
              className={inputCls}
            />
          </label>
        )}
      </div>
      {c.action !== 'delete' && (
        <p className="text-xs text-amber-300/80">
          {tp(lang, 'ui.mod.actionWarnPre')} „{c.action}" {tp(lang, 'ui.mod.actionWarnMid')}{' '}
          <strong>{tp(lang, 'ui.mod.actionWarnEvery')}</strong> {tp(lang, 'ui.mod.actionWarnPost')}
        </p>
      )}

      {/* Eskalacja recydywy */}
      <div className="space-y-3 rounded-xl border border-line bg-bg/40 p-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={c.escalation.enabled}
            onChange={(e) =>
              setC({ ...c, escalation: { ...c.escalation, enabled: e.target.checked } })
            }
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">{tp(lang, 'ui.mod.escalationToggle')}</span>
          <span className="hidden text-xs text-muted sm:inline">
            {tp(lang, 'ui.mod.escalationHint')}
          </span>
        </label>
        {c.escalation.enabled && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1 text-sm">
                <span className="text-muted">{tp(lang, 'ui.mod.escThreshold')}</span>
                <input
                  type="number"
                  value={c.escalation.threshold}
                  onChange={(e) =>
                    setC({
                      ...c,
                      escalation: { ...c.escalation, threshold: Math.max(2, num(e.target.value)) },
                    })
                  }
                  className={inputCls}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted">{tp(lang, 'ui.mod.escWindow')}</span>
                <input
                  type="number"
                  value={c.escalation.windowMin}
                  onChange={(e) =>
                    setC({
                      ...c,
                      escalation: { ...c.escalation, windowMin: Math.max(1, num(e.target.value)) },
                    })
                  }
                  className={inputCls}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted">{tp(lang, 'ui.mod.escActionLabel')}</span>
                <select
                  value={c.escalation.action}
                  onChange={(e) =>
                    setC({
                      ...c,
                      escalation: {
                        ...c.escalation,
                        action: e.target.value as Cfg['escalation']['action'],
                      },
                    })
                  }
                  className={inputCls}
                >
                  <option value="timeout">{tp(lang, 'ui.mod.escActTimeout')}</option>
                  <option value="kick">{tp(lang, 'ui.mod.escActKick')}</option>
                  <option value="ban">{tp(lang, 'ui.mod.escActBan')}</option>
                </select>
              </label>
            </div>
            <p className="text-xs text-muted">
              {tp(lang, 'ui.mod.escExamplePre')} {c.escalation.threshold}{' '}
              {tp(lang, 'ui.mod.escExampleMid')} {c.escalation.windowMin}{' '}
              {tp(lang, 'ui.mod.escExampleMid2')} „{c.escalation.action}"{' '}
              {tp(lang, 'ui.mod.escExamplePost')}
            </p>
          </>
        )}
      </div>

      {/* Anty-caps i anty-spoiler */}
      <div className="space-y-3 rounded-xl border border-line bg-bg/40 p-4">
        <span className="font-semibold text-white/90">
          {tp(lang, 'ui.mod.antiCapsSpoilerLabel')}
        </span>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={c.antiCaps.enabled}
            onChange={(e) => setC({ ...c, antiCaps: { ...c.antiCaps, enabled: e.target.checked } })}
            className="h-4 w-4 accent-accent"
          />
          <span>
            {tp(lang, 'ui.mod.antiCapsPre')} <strong>{tp(lang, 'ui.mod.antiCapsStrong')}</strong>{' '}
            <span className="text-muted">{tp(lang, 'ui.mod.antiCapsNote')}</span>
          </span>
        </label>
        {c.antiCaps.enabled && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-muted">{tp(lang, 'ui.mod.capsPercent')}</span>
              <input
                type="number"
                value={c.antiCaps.percent}
                onChange={(e) =>
                  setC({
                    ...c,
                    antiCaps: {
                      ...c.antiCaps,
                      percent: Math.min(100, Math.max(10, num(e.target.value))),
                    },
                  })
                }
                className={inputCls}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted">{tp(lang, 'ui.mod.capsMinLength')}</span>
              <input
                type="number"
                value={c.antiCaps.minLength}
                onChange={(e) =>
                  setC({
                    ...c,
                    antiCaps: { ...c.antiCaps, minLength: Math.max(1, num(e.target.value)) },
                  })
                }
                className={inputCls}
              />
            </label>
          </div>
        )}
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={c.antiSpoiler.enabled}
            onChange={(e) =>
              setC({ ...c, antiSpoiler: { ...c.antiSpoiler, enabled: e.target.checked } })
            }
            className="h-4 w-4 accent-accent"
          />
          <span>
            {tp(lang, 'ui.mod.antiSpoilerPre')}{' '}
            <strong>{tp(lang, 'ui.mod.antiSpoilerStrong')}</strong>{' '}
            <span className="text-muted">{tp(lang, 'ui.mod.antiSpoilerNote')}</span>
          </span>
        </label>
        {c.antiSpoiler.enabled && (
          <label className="space-y-1 text-sm sm:max-w-xs">
            <span className="text-muted">{tp(lang, 'ui.mod.spoilerMax')}</span>
            <input
              type="number"
              value={c.antiSpoiler.maxSpoilers}
              onChange={(e) =>
                setC({
                  ...c,
                  antiSpoiler: { ...c.antiSpoiler, maxSpoilers: Math.max(0, num(e.target.value)) },
                })
              }
              className={inputCls}
            />
          </label>
        )}
      </div>

      {/* Własne filtry (Faza 8) */}
      <div className="space-y-3 rounded-xl border border-line bg-bg/40 p-4">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.mod.customFiltersLabel')}</span>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-muted">{tp(lang, 'ui.mod.bannedWordsLabel')}</span>
            <textarea
              value={wordsText}
              onChange={(e) => setWordsText(e.target.value)}
              rows={4}
              className={inputCls}
              placeholder={tp(lang, 'ui.mod.bannedWordsPh')}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted">{tp(lang, 'ui.mod.regexLabel')}</span>
            <textarea
              value={regexText}
              onChange={(e) => setRegexText(e.target.value)}
              rows={4}
              className={`${inputCls} font-mono`}
              placeholder={'(buy|sell).*nitro\\b\nh[a4]ck'}
            />
          </label>
        </div>
        <label className="block space-y-1 text-sm">
          <span className="text-muted">{tp(lang, 'ui.mod.allowedLinksLabel')}</span>
          <textarea
            value={linksText}
            onChange={(e) => setLinksText(e.target.value)}
            rows={2}
            className={inputCls}
            placeholder={'youtube.com\ntwitch.tv\ngh0st-empire.com'}
          />
        </label>

        <div className="space-y-2">
          <span className="text-sm text-muted">{tp(lang, 'ui.mod.ignoreChannelsLabel')}</span>
          <ChannelSelect
            value=""
            onChange={addIgnore}
            channels={guild.channels}
            placeholder={tp(lang, 'ui.mod.addChannelPh')}
          />
          {c.ignoreChannels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {c.ignoreChannels.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => removeIgnore(id)}
                  className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted transition hover:border-accent hover:text-accent"
                  title={tp(lang, 'ui.mod.chipRemoveTitle')}
                >
                  #{channelName(id)} ✕
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ochrona: anti-scam + PII */}
      <div className="space-y-3 rounded-xl border border-line bg-bg/40 p-4">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.mod.protectionLabel')}</span>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={c.antiScam.enabled}
            onChange={(e) => setC({ ...c, antiScam: { ...c.antiScam, enabled: e.target.checked } })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">{tp(lang, 'ui.mod.antiScamToggle')}</span>
          <span className="hidden text-xs text-muted sm:inline">
            {tp(lang, 'ui.mod.antiScamHint')}
          </span>
        </label>
        {c.antiScam.enabled && (
          <label className="block space-y-1 text-sm">
            <span className="text-muted">{tp(lang, 'ui.mod.scamDomainsLabel')}</span>
            <textarea
              value={scamText}
              onChange={(e) => setScamText(e.target.value)}
              rows={2}
              className={`${inputCls} font-mono`}
              placeholder={'zly-scam.example\nfake-gift.ru'}
            />
          </label>
        )}

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={c.pii.enabled}
            onChange={(e) => setC({ ...c, pii: { ...c.pii, enabled: e.target.checked } })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">{tp(lang, 'ui.mod.piiToggle')}</span>
        </label>
        {c.pii.enabled && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PII_FIELDS.map((f) => (
              <label key={f.key} className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={c.pii.types[f.key]}
                  onChange={(e) =>
                    setC({
                      ...c,
                      pii: { ...c.pii, types: { ...c.pii.types, [f.key]: e.target.checked } },
                    })
                  }
                  className="h-4 w-4 accent-accent"
                />
                {tp(lang, f.labelKey)}
              </label>
            ))}
          </div>
        )}
        <p className="text-xs text-muted">
          {tp(lang, 'ui.mod.piiNotePre')} <strong>{tp(lang, 'ui.mod.piiNoteNot')}</strong>{' '}
          {tp(lang, 'ui.mod.piiNotePost')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.mod.modlogLabel')}</span>
          <ChannelSelect
            value={c.modlogChannelId}
            onChange={(v) => setC({ ...c, modlogChannelId: v })}
            channels={guild.channels}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.mod.exemptRoleLabel')}</span>
          <RoleSelect
            value={c.exemptRoleId}
            onChange={(v) => setC({ ...c, exemptRoleId: v })}
            roles={guild.roles}
            placeholder={tp(lang, 'ui.mod.none')}
          />
        </label>
      </div>

      <SaveButton st={st} onClick={save} errorText={errMsg} />
      <p className="text-xs text-muted">{tp(lang, 'ui.mod.footer')}</p>
    </div>
  );
}
