import { Gift, Newspaper } from 'lucide-react';
import FreeGamesForm from '../../components/FreeGamesForm';
import PatchNotesForm from '../../components/PatchNotesForm';
import { getFreeGamesConfig, getPatchNotesConfig } from '../../lib/community';
import { getGuildMeta } from '../../lib/guild';

export const dynamic = 'force-dynamic';

export default async function GamingPage() {
  const [free, patch, guild] = await Promise.all([
    getFreeGamesConfig(),
    getPatchNotesConfig(),
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
    </div>
  );
}
