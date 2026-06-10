'use client';

import { useState } from 'react';
import type { EconomyConfig } from '../lib/serverEconomy';
import AdvancedOnly from './AdvancedOnly';
import Hint from './Hint';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const num = (v: string): number => Math.max(0, Math.floor(Number(v) || 0));

export default function EconomyForm({ initial }: { initial: EconomyConfig }) {
  const [c, setC] = useState<EconomyConfig>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/economy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      });
      setSt(r.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
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
      {Toggle('Ekonomia włączona', 'enabled')}
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Waluta (emoji/tekst)</span>
          <input
            value={c.currency}
            onChange={(e) => setC({ ...c, currency: e.target.value })}
            className={inputCls}
            placeholder="🪙"
          />
        </label>
        {N('Saldo startowe', 'startBalance', 'Tyle waluty dostaje każdy nowy gracz na start.')}
        {N(
          'Maks. stawka hazardu',
          'gambleMax',
          'Górny limit zakładu w /eco gamble, slots, highlow itd.',
        )}
      </div>

      <div className="rounded-xl border border-line bg-bg/40 p-4">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">Zarobki</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {N('Dzienna kwota', 'dailyAmount', 'Bazowa wypłata /eco daily.')}
          {N(
            'Bonus za streak',
            'dailyStreakBonus',
            'Dodatek za każdy kolejny dzień serii daily (motywuje do codziennego wbijania).',
          )}
          {N('Cooldown pracy (min)', 'workCooldownMin', 'Co ile minut można użyć /eco work.')}
          {N(
            'Praca: min',
            'workMin',
            'Dolna granica losowanej wypłaty z /eco work (i bazy /eco crime).',
          )}
          {N(
            'Praca: max',
            'workMax',
            'Górna granica losowanej wypłaty z /eco work (i bazy /eco crime).',
          )}
          {N(
            'Odsetki bank / dzień (%)',
            'bankInterestPct',
            'Dzienny % doliczany do salda w banku (pasywny dochód). 0 = wyłączone.',
          )}
          {N(
            'Podatek od przelewów (%)',
            'payTaxPct',
            'Potrącany z kwoty /eco pay. 0 = brak podatku.',
          )}
          {N(
            'Nagroda za awans poziomu',
            'levelUpMoney',
            'Tyle waluty dostaje użytkownik przy każdym level-upie. 0 = wyłączone.',
          )}
        </div>
        <p className="mt-2 text-xs text-muted">
          💰 <strong>Odsetki bankowe</strong> — co dzień dolicza ten % do salda w banku każdej osoby
          (pasywny dochód). 0 = wyłączone. Trafia też do historii transakcji jako „odsetki".
        </p>
        <p className="mt-1 text-xs text-muted">
          🧾 <strong>Podatek od przelewów</strong> — potrącany z kwoty <code>/eco pay</code> (0 =
          brak). 💰 <strong>Nagroda za awans</strong> — tyle waluty dostaje użytkownik przy każdym
          awansie poziomu (0 = wyłączone).
        </p>
      </div>

      <AdvancedOnly>
        <div className="rounded-xl border border-line bg-bg/40 p-4 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Rabunki i hazard
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {Toggle('Rabunki włączone', 'robEnabled')}
            {Toggle('Hazard włączony', 'gambleEnabled')}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {N('Szansa rabunku (%)', 'robChance', 'Prawdopodobieństwo udanego /eco rob.')}
            {N(
              'Cooldown rabunku (min)',
              'robCooldownMin',
              'Wspólny cooldown dla /eco rob i /eco crime.',
            )}
            {N(
              'Maks. łup (% portfela)',
              'robMaxPercent',
              'Ile maksymalnie % portfela ofiary można ukraść.',
            )}
          </div>
        </div>
      </AdvancedOnly>

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
    </div>
  );
}
