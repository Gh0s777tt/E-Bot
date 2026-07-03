'use client';

import { useState } from 'react';
import { tp } from '../lib/panelI18n';
import { saveConfig } from '../lib/saveConfig';
import type { EconomyConfig } from '../lib/serverEconomy';
import AdvancedOnly from './AdvancedOnly';
import Hint from './Hint';
import { useLang } from './LangContext';
import SaveButton from './SaveButton';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const num = (v: string): number => Math.max(0, Math.floor(Number(v) || 0));

export default function EconomyForm({ initial }: { initial: EconomyConfig }) {
  const { lang } = useLang();
  const [c, setC] = useState<EconomyConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function save() {
    setSt('saving');
    const res = await saveConfig('/api/economy', c);
    setErrMsg(res.error);
    setSt(res.ok ? 'ok' : 'err');
    setTimeout(() => setSt('idle'), 2500);
  }

  const N = (label: string, key: keyof EconomyConfig, hint?: string) => (
    <label className="space-y-1 text-sm">
      <span className="font-semibold text-white/90">
        {label}
        {hint && <Hint text={hint} />}
      </span>
      <input
        type="number"
        value={c[key] as number}
        onChange={(e) => setC({ ...c, [key]: num(e.target.value) })}
        className={inputCls}
      />
    </label>
  );
  const Toggle = (label: string, key: keyof EconomyConfig) => (
    <label className="flex items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={c[key] as boolean}
        onChange={(e) => setC({ ...c, [key]: e.target.checked })}
        className="h-4 w-4 accent-accent"
      />
      <span className="font-semibold text-white/90">{label}</span>
    </label>
  );

  return (
    <div className="max-w-2xl space-y-5">
      {Toggle(tp(lang, 'ui.eco.enabledToggle'), 'enabled')}
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.eco.currencyLabel')}</span>
          <input
            value={c.currency}
            onChange={(e) => setC({ ...c, currency: e.target.value })}
            className={inputCls}
            placeholder="🪙"
          />
        </label>
        {N(
          tp(lang, 'ui.eco.startBalanceLabel'),
          'startBalance',
          tp(lang, 'ui.eco.startBalanceHint'),
        )}
        {N(tp(lang, 'ui.eco.gambleMaxLabel'), 'gambleMax', tp(lang, 'ui.eco.gambleMaxHint'))}
      </div>

      <div className="rounded-xl border border-line bg-bg/40 p-4">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">
          {tp(lang, 'ui.eco.earningsHeading')}
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {N(
            tp(lang, 'ui.eco.dailyAmountLabel'),
            'dailyAmount',
            tp(lang, 'ui.eco.dailyAmountHint'),
          )}
          {N(
            tp(lang, 'ui.eco.dailyStreakBonusLabel'),
            'dailyStreakBonus',
            tp(lang, 'ui.eco.dailyStreakBonusHint'),
          )}
          {N(
            tp(lang, 'ui.eco.workCooldownLabel'),
            'workCooldownMin',
            tp(lang, 'ui.eco.workCooldownHint'),
          )}
          {N(tp(lang, 'ui.eco.workMinLabel'), 'workMin', tp(lang, 'ui.eco.workMinHint'))}
          {N(tp(lang, 'ui.eco.workMaxLabel'), 'workMax', tp(lang, 'ui.eco.workMaxHint'))}
          {N(
            tp(lang, 'ui.eco.bankInterestLabel'),
            'bankInterestPct',
            tp(lang, 'ui.eco.bankInterestHint'),
          )}
          {N(tp(lang, 'ui.eco.payTaxLabel'), 'payTaxPct', tp(lang, 'ui.eco.payTaxHint'))}
          {N(
            tp(lang, 'ui.eco.levelUpMoneyLabel'),
            'levelUpMoney',
            tp(lang, 'ui.eco.levelUpMoneyHint'),
          )}
        </div>
        <p className="mt-2 text-xs text-muted">{tp(lang, 'ui.eco.bankInterestNote')}</p>
        <p className="mt-1 text-xs text-muted">{tp(lang, 'ui.eco.taxNote')}</p>
      </div>

      <AdvancedOnly>
        <div className="rounded-xl border border-line bg-bg/40 p-4 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            {tp(lang, 'ui.eco.advHeading')}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {Toggle(tp(lang, 'ui.eco.robEnabledToggle'), 'robEnabled')}
            {Toggle(tp(lang, 'ui.eco.gambleEnabledToggle'), 'gambleEnabled')}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {N(tp(lang, 'ui.eco.robChanceLabel'), 'robChance', tp(lang, 'ui.eco.robChanceHint'))}
            {N(
              tp(lang, 'ui.eco.robCooldownLabel'),
              'robCooldownMin',
              tp(lang, 'ui.eco.robCooldownHint'),
            )}
            {N(tp(lang, 'ui.eco.robMaxLabel'), 'robMaxPercent', tp(lang, 'ui.eco.robMaxHint'))}
          </div>
        </div>
      </AdvancedOnly>

      <SaveButton st={st} onClick={save} errorText={errMsg} />
    </div>
  );
}
