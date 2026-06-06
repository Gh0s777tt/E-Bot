import { Palette } from 'lucide-react';
import RankCardForm from '../../components/RankCardForm';
import { getRankCard } from '../../lib/appearance';

export const dynamic = 'force-dynamic';

export default async function AppearancePage() {
  const cfg = await getRankCard();
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Wygląd grafik bota — tu działają prawdziwe <strong>gradienty</strong> i{' '}
        <strong>czcionki</strong> (renderowane w obrazie). Karta rangi pokazuje się po komendzie{' '}
        <code className="text-accent">/rank</code>. Baner powitalny ustawisz w{' '}
        <strong>Powitaniach</strong>.
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Palette size={16} className="text-accent" /> Karta rangi (/rank)
        </h2>
        <RankCardForm initial={cfg} />
      </section>
    </div>
  );
}
