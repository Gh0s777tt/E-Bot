import { Gift, MousePointerClick, Star, Volume2 } from 'lucide-react';
import ButtonRolesForm from '../../components/ButtonRolesForm';
import StarboardForm from '../../components/StarboardForm';
import TempVoiceForm from '../../components/TempVoiceForm';
import { getButtonRoles, getGiveaways, getStarboard, getTempVoice } from '../../lib/engagement';
import { getGuildMeta } from '../../lib/guild';

export const dynamic = 'force-dynamic';

function fmt(d: string): string {
  try {
    return new Date(d).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return d;
  }
}

export default async function EngagementPage() {
  const [btn, star, tv, giveaways, guild] = await Promise.all([
    getButtonRoles(),
    getStarboard(),
    getTempVoice(),
    getGiveaways(20),
    getGuildMeta(),
  ]);

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Zaangażowanie społeczności: role za przyciski, starboard, kanały głosowe na żądanie oraz
        konkursy. Komendy bota: <code className="text-accent">/buttonpanel</code>,{' '}
        <code className="text-accent">/giveaway start</code>,{' '}
        <code className="text-accent">/remind</code>.
      </p>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <MousePointerClick size={16} className="text-accent" /> Role za przyciski
        </h2>
        <ButtonRolesForm initial={btn} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Star size={16} className="text-accent" /> Starboard
        </h2>
        <StarboardForm initial={star} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Volume2 size={16} className="text-accent" /> Kanały głosowe na żądanie
        </h2>
        <TempVoiceForm initial={tv} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Gift size={16} className="text-accent" /> Giveawaye
        </h2>
        {giveaways.length === 0 ? (
          <p className="text-sm text-muted">
            Brak konkursów. Uruchom <code className="text-accent">/giveaway start</code> na
            Discordzie (wymaga <code>b5-schema.sql</code> w Supabase).
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-line">
                  <th className="px-3 py-2">Nagroda</th>
                  <th className="px-3 py-2">Zwycięzców</th>
                  <th className="px-3 py-2">Koniec</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {giveaways.map((g) => (
                  <tr key={g.id} className="border-b border-line/50">
                    <td className="px-3 py-2">{g.prize}</td>
                    <td className="px-3 py-2 text-muted">{g.winners}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted">{fmt(g.ends_at)}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                          g.ended ? 'bg-white/10 text-muted' : 'bg-accent/15 text-accent'
                        }`}
                      >
                        {g.ended ? 'zakończony' : 'trwa'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
