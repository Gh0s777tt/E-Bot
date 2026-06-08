'use client';

import { useState } from 'react';
import type { GuildMeta } from '../lib/guild';
import { ChannelSelect, RoleSelect } from './pickers';

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
const PII_FIELDS: { key: keyof PiiTypes; label: string }[] = [
  { key: 'creditCard', label: 'Karty płatnicze' },
  { key: 'pesel', label: 'PESEL' },
  { key: 'idCard', label: 'Nr dowodu' },
  { key: 'iban', label: 'IBAN / konto' },
  { key: 'email', label: 'E-mail' },
  { key: 'phone', label: 'Telefon (PL)' },
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
};
type ListKey = 'bannedWords' | 'bannedRegex' | 'allowedLinks' | 'ignoreChannels';
type Init = Omit<Cfg, ListKey | 'antiScam' | 'pii'> &
  Partial<Pick<Cfg, ListKey>> & {
    antiScam?: { enabled?: boolean; customDomains?: string[] };
    pii?: { enabled?: boolean; types?: Partial<PiiTypes> };
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
  });
  const [wordsText, setWordsText] = useState(toLines(initial.bannedWords ?? []));
  const [regexText, setRegexText] = useState(toLines(initial.bannedRegex ?? []));
  const [linksText, setLinksText] = useState(toLines(initial.allowedLinks ?? []));
  const [scamText, setScamText] = useState(toLines(initial.antiScam?.customDomains ?? []));
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const payload: Cfg = {
        ...c,
        bannedWords: fromLines(wordsText),
        bannedRegex: fromLines(regexText),
        allowedLinks: fromLines(linksText),
        antiScam: { enabled: c.antiScam.enabled, customDomains: fromLines(scamText) },
      };
      const r = await fetch('/api/automod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSt(r.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
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
      {toggle('enabled', 'Automod włączony')}
      <div className="grid gap-2 sm:grid-cols-2">
        {toggle('blockInvites', 'Blokuj zaproszenia Discord')}
        {toggle('blockLinks', 'Blokuj linki (http/https)')}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Maks. wzmianek / wiadomość</span>
          <input
            type="number"
            value={c.maxMentions}
            onChange={(e) => setC({ ...c, maxMentions: num(e.target.value) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Anty-spam: wiadomości</span>
          <input
            type="number"
            value={c.antiSpamCount}
            onChange={(e) => setC({ ...c, antiSpamCount: num(e.target.value) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">…w ciągu (s)</span>
          <input
            type="number"
            value={c.antiSpamSec}
            onChange={(e) => setC({ ...c, antiSpamSec: Math.max(1, num(e.target.value)) })}
            className={inputCls}
          />
        </label>
      </div>

      {/* Własne filtry (Faza 8) */}
      <div className="space-y-3 rounded-xl border border-line bg-bg/40 p-4">
        <span className="font-semibold text-white/90">Własne filtry treści</span>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-muted">Zakazane słowa/frazy (jedna na linię)</span>
            <textarea
              value={wordsText}
              onChange={(e) => setWordsText(e.target.value)}
              rows={4}
              className={inputCls}
              placeholder={'spam\nzakazane słowo\n...'}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted">Wzorce regex (zaawansowane, jedna na linię)</span>
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
          <span className="text-muted">
            Dozwolone domeny linków (whitelist, gdy „Blokuj linki" — jedna na linię)
          </span>
          <textarea
            value={linksText}
            onChange={(e) => setLinksText(e.target.value)}
            rows={2}
            className={inputCls}
            placeholder={'youtube.com\ntwitch.tv\ngh0st-empire.com'}
          />
        </label>

        <div className="space-y-2">
          <span className="text-sm text-muted">Kanały zwolnione z automodu</span>
          <ChannelSelect
            value=""
            onChange={addIgnore}
            channels={guild.channels}
            placeholder="+ dodaj kanał"
          />
          {c.ignoreChannels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {c.ignoreChannels.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => removeIgnore(id)}
                  className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted transition hover:border-accent hover:text-accent"
                  title="Kliknij, by usunąć"
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
        <span className="font-semibold text-white/90">
          Ochrona przed oszustwami i danymi osobowymi
        </span>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={c.antiScam.enabled}
            onChange={(e) => setC({ ...c, antiScam: { ...c.antiScam, enabled: e.target.checked } })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">Anti-scam / phishing</span>
          <span className="hidden text-xs text-muted sm:inline">
            (podrabiany Discord/Steam, „darmowe nitro/gift", linki na IP)
          </span>
        </label>
        {c.antiScam.enabled && (
          <label className="block space-y-1 text-sm">
            <span className="text-muted">Dodatkowe domeny do blokady (jedna na linię)</span>
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
          <span className="font-semibold text-white/90">Ochrona danych osobowych (PII)</span>
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
                {f.label}
              </label>
            ))}
          </div>
        )}
        <p className="text-xs text-muted">
          Wiadomości z oszustwem lub danymi osobowymi są usuwane; do mod-logu <strong>nie</strong>{' '}
          trafia treść z danymi (zero wtórnego wycieku). Autor dostaje krótkie wyjaśnienie w DM.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Kanał mod-log</span>
          <ChannelSelect
            value={c.modlogChannelId}
            onChange={(v) => setC({ ...c, modlogChannelId: v })}
            channels={guild.channels}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Rola zwolniona z automodu</span>
          <RoleSelect
            value={c.exemptRoleId}
            onChange={(v) => setC({ ...c, exemptRoleId: v })}
            roles={guild.roles}
            placeholder="— brak —"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={st === 'saving'}
          className="rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          {st === 'saving' ? 'Zapisywanie…' : 'Zapisz'}
        </button>
        {st === 'ok' && <span className="text-sm text-green-400">✓ Zapisano</span>}
        {st === 'err' && <span className="text-sm text-accent">Błąd zapisu</span>}
      </div>
      <p className="text-xs text-muted">
        Bot usuwa naruszenia (zakazane słowa/regex, zaproszenia, linki spoza whitelisty, nadmiar
        wzmianek, spam) + loguje na mod-log. Pomijani: „Zarządzanie wiadomościami", rola zwolniona,
        kanały zwolnione.
      </p>
    </div>
  );
}
