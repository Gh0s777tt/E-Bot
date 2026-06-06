import { Banknote, ShoppingCart } from 'lucide-react';
import EconomyForm from '../../components/EconomyForm';
import ShopManager from '../../components/ShopManager';
import { getGuildMeta } from '../../lib/guild';
import { getServerEconomy, getShopItems } from '../../lib/serverEconomy';

export const dynamic = 'force-dynamic';

export default async function EcoPage() {
  const [cfg, items, guild] = await Promise.all([
    getServerEconomy(),
    getShopItems(),
    getGuildMeta(),
  ]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Ekonomia serwera — waluta natywna, praca, rabunki, hazard i sklep ról. Komenda bota:{' '}
        <code className="text-accent">/eco</code> (balance · daily · work · rob · pay · deposit ·
        withdraw · gamble · slots · shop · buy · top). Wymaga <code>f3-economy-schema.sql</code> w
        Supabase.{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">Ekonomia: WŁĄCZONA</span>
        ) : (
          <span className="font-semibold text-accent">Ekonomia: WYŁĄCZONA</span>
        )}
      </p>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Banknote size={16} className="text-accent" /> Konfiguracja ekonomii
        </h2>
        <EconomyForm initial={cfg} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <ShoppingCart size={16} className="text-accent" /> Sklep
        </h2>
        <ShopManager initial={items} guild={guild} currency={cfg.currency} />
      </section>
    </div>
  );
}
