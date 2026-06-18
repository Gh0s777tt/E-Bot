'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import type { ShopItem } from '../lib/serverEconomy';
import { useLang } from './LangContext';
import { RoleSelect } from './pickers';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function ShopManager({
  initial,
  guild,
  currency,
}: {
  initial: ShopItem[];
  guild: GuildMeta;
  currency: string;
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

  async function add() {
    if (!name.trim()) return;
    setSt('saving');
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
      const j = (await r.json()) as { ok?: boolean; items?: ShopItem[] };
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
        setSt('err');
      }
    } catch {
      setSt('err');
    }
  }

  async function remove(id: string) {
    setItems((p) => p.filter((i) => i.id !== id));
    await fetch(`/api/economy/shop?id=${id}`, { method: 'DELETE' }).catch(() => {});
  }

  return (
    <div className="space-y-4">
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
        disabled={st === 'saving' || !name.trim()}
        className="rounded-md bg-accent px-5 py-2 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
      >
        {st === 'saving' ? tp(lang, 'ui.eco.addingBtn') : tp(lang, 'ui.eco.addBtn')}
      </button>
      {st === 'err' && <span className="ml-3 text-sm text-accent">{tp(lang, 'ui.saveError')}</span>}

      {items.length === 0 ? (
        <p className="text-sm text-muted">{tp(lang, 'ui.eco.shopEmpty')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
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
                <tr key={i.id} className="border-b border-line/50">
                  <td className="px-3 py-2">
                    {i.name}
                    {i.effect ? (
                      <span className="ml-2 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
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
                      <span className="ml-2 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
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
