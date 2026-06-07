import { Gift, Newspaper, TrendingDown } from 'lucide-react';
import FreeGamesForm from '../../components/FreeGamesForm';
import PatchNotesForm from '../../components/PatchNotesForm';
import PriceTrackerForm from '../../components/PriceTrackerForm';
import {
  getFreeGamesConfig,
  getPatchNotesConfig,
  getPriceTrackerConfig,
} from '../../lib/community';
import { getGuildMeta } from '../../lib/guild';

export const dynamic = 'force-dynamic';

export default async function GamingPage() {
  const [free, patch, price, guild] = await Promise.all([
    getFreeGamesConfig(),
    getPatchNotesConfig(),
    getPriceTrackerConfig(),
    getGuildMeta(),
  ]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Funkcje gamingowe oparte na publicznych API (bez kluczy): automatyczny feed{' '}
        <strong>darmowych gier</strong> z Epic Games Store oraz{' '}
        <strong>patch-notes / aktualności</strong> wybranych gier ze Steam. Bot ogłasza nowości na
        wskazanych kanałach.
      </p>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Gift size={16} className="text-accent" /> Darmowe gry (Epic)
        </h2>
        <FreeGamesForm initial={free} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Newspaper size={16} className="text-accent" /> Patch-notes (Steam)
        </h2>
        <PatchNotesForm initial={patch} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <TrendingDown size={16} className="text-accent" /> Śledzenie cen (ITAD)
        </h2>
        <PriceTrackerForm initial={price} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5 text-sm text-muted">
        <h2 className="mb-3 text-base font-semibold uppercase tracking-wide text-white/90">
          Backlog gier
        </h2>
        <p>
          Osobista lista „do ogrania" — komenda <code className="text-accent">/backlog</code> (add ·
          list · set · remove) ze statusami: do ogrania / w trakcie / ukończone / porzucone. Włącz
          moduł <strong>Backlog gier</strong> w Centrum sterowania (wymaga <code>_ALL.sql</code> w
          Supabase).
        </p>
      </section>
    </div>
  );
}
