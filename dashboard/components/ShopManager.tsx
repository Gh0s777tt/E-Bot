'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Tier } from '../lib/billing';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import type { ShopItem } from '../lib/serverEconomy';
import EmptyState from './EmptyState';
import { useLang } from './LangContext';
import { RoleSelect } from './pickers';
import UsageMeter from './UsageMeter';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function ShopManager({
  initial,
  guild,
  currency,
  tier,
  freeLimit,
  premiumLimit,
  billingOn,
}: {
  initial: ShopItem[];
  guild: GuildMeta;
  currency: string;
  tier: Tier;
  freeLimit: number;
  premiumLimit: number;
  billingOn: boolean;
}) {
  const { lang } = useLang();
  const [items, setItems] = useState<ShopItem[]>(initial);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(1000);
  const [roleId, setRoleId] = useState('');
  const [desc, setDesc] = useState('');
  const [effect, setEffect] = useState('');
  const [durationDays, setDurationDays] = useState(0);
  const [st, setSt] = useState<'idle' | 'saving' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function add() {
    if (!name.trim()) return;
    setSt('saving');
    setErrMsg('');
    try {
      const r = await fetch('/api/economy/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price,
          role_id: roleId,
          description: desc,
          effect,
          duration_days: roleId ? durationDays : 0,
        }),
      });
      const j = (await r.json()) as { ok?: boolean; items?: ShopItem[]; error?: string };
      if (r.ok && j.items) {
        setItems(j.items);
        setName('');
        setDesc('');
        setRoleId('');
        setEffect('');
        setDurationDays(0);
        setPrice(1000);
        setSt('idle');
      } else {
        setErrMsg(j.error || '');
        setSt('err');
      }
    } catch {
      setSt('err');
    }
  }

  async function remove(id: string) {
    // Potwierdzenie przed nieodwracalnym usunięciem itemu sklepu (komunikat zlokalizowany).
    const it = items.find((i) => i.id === id);
    const label = tp(lang, 'ui.eco.delAria');
    if (!window.confirm(it ? `${label} „${it.name}"?` : `${label}?`)) return;
    setItems((p) => p.filter((i) => i.id !== id));
    await fetch(`/api/economy/shop?id=${id}`, { method: 'DELETE' }).catch(() => {});
  }

  return (
    <div className="space-y-4">
      <UsageMeter
        used={items.length}
        freeLimit={freeLimit}
        premiumLimit={premiumLimit}
        tier={tier}
        billingOn={billingOn}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={tp(lang, 'ui.eco.namePh')}
          className={inputCls}
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
          placeholder={tp(lang, 'ui.eco.pricePh')}
          className={inputCls}
        />
        <RoleSelect
          value={roleId}
          onChange={setRoleId}
          roles={guild.roles}
          placeholder={tp(lang, 'ui.eco.rolePh')}
        />
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={tp(lang, 'ui.eco.descPh')}
          className={inputCls}
        />
        <select value={effect} onChange={(e) => setEffect(e.target.value)} className={inputCls}>
          <option value="">{tp(lang, 'ui.eco.effectNone')}</option>
          <option value="xp2">{tp(lang, 'ui.eco.effectXp2')}</option>
          <option value="shield">{tp(lang, 'ui.eco.effectShield')}</option>
          <option value="lootbox">{tp(lang, 'ui.eco.effectLootbox')}</option>
        </select>
        {roleId && (
          <label className="space-y-1 text-sm sm:col-span-2">
            <span className="font-semibold text-white/90">{tp(lang, 'ui.eco.durationLabel')}</span>
            <input
              type="number"
              min={0}
              max={3650}
              value={durationDays}
              onChange={(e) =>
                setDurationDays(
                  Math.max(0, Math.min(3650, Math.floor(Number(e.target.value) || 0))),
                )
              }
              placeholder={tp(lang, 'ui.eco.durationPh')}
              className={inputCls}
            />
          </label>
        )}
      </div>
      <button
        type="button"
        onClick={add}
        disabled={
          st === 'saving' ||
          !name.trim() ||
          (billingOn && tier === 'free' && items.length >= freeLimit)
        }
        className="rounded-md bg-accent px-5 py-2 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
      >
        {st === 'saving' ? tp(lang, 'ui.eco.addingBtn') : tp(lang, 'ui.eco.addBtn')}
      </button>
      {st === 'err' && (
        <span className="ms-3 text-sm text-accent">{errMsg || tp(lang, 'ui.saveError')}</span>
      )}

      {items.length === 0 ? (
        <EmptyState>{tp(lang, 'ui.eco.shopEmpty')}</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr className="border-b border-line">
                <th className="px-3 py-2">{tp(lang, 'ui.eco.thName')}</th>
                <th className="px-3 py-2">{tp(lang, 'ui.eco.thPrice')}</th>
                <th className="px-3 py-2">{tp(lang, 'ui.eco.thRole')}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr
                  key={i.id}
                  className="border-b border-line/50 transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-3 py-2">
                    {i.name}
                    {i.effect ? (
                      <span className="ms-2 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                        {i.effect}
                      </span>
                    ) : null}
                    {i.description ? (
                      <span className="block text-xs text-muted">{i.description}</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {i.price.toLocaleString('pl-PL')} {currency}
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {i.role_id
                      ? `@${guild.roles.find((r) => r.id === i.role_id)?.name ?? tp(lang, 'ui.eco.roleFallback')}`
                      : '—'}
                    {i.duration_days ? (
                      <span className="ms-2 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                        ⏳ {i.duration_days}d
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => remove(i.id)}
                      className="rounded-md border border-line p-2 text-muted transition hover:border-accent hover:text-accent"
                      aria-label={tp(lang, 'ui.eco.delAria')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
