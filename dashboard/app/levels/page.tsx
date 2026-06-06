import { Award, Trophy, Users } from 'lucide-react';
import LevelingForm from '../../components/LevelingForm';
import StatCard from '../../components/StatCard';
import { getLeaderboard, getLevelingConfig } from '../../lib/faza4';

export const dynamic = 'force-dynamic';

export default async function LevelsPage() {
  const [cfg, board] = await Promise.all([getLevelingConfig(), getLeaderboard(50)]);

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Leveling nagradza aktywność XP‑kami (czat + voice) i nadaje role po osiągnięciu poziomu.
        Konfigurację zapisujesz tu (do Supabase), a bot stosuje ją na żywo (settings‑sync).{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">Leveling: WŁĄCZONY</span>
        ) : (
          <span className="font-semibold text-accent">Leveling: WYŁĄCZONY</span>
        )}
      </p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="W rankingu" value={board.length} icon={<Users size={14} />} accent />
        <StatCard label="Status" value={cfg.enabled ? 'ON' : 'OFF'} icon={<Trophy size={14} />} />
        <StatCard label="Ról‑nagród" value={cfg.rewards.length} icon={<Award size={14} />} />
      </div>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Trophy size={16} className="text-accent" /> Konfiguracja levelingu
        </h2>
        <LevelingForm initial={cfg} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Users size={16} className="text-accent" /> Ranking (top 50)
        </h2>
        {board.length === 0 ? (
          <p className="text-sm text-muted">
            Brak danych. Po uruchomieniu{' '}
            <code className="text-accent">scripts/faza4-schema.sql</code> w Supabase i włączeniu
            logiki po stronie bota, ranking pojawi się tutaj.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Użytkownik</th>
                  <th className="py-2 pr-3">Poziom</th>
                  <th className="py-2">XP</th>
                </tr>
              </thead>
              <tbody>
                {board.map((r, i) => (
                  <tr key={r.user_id} className="border-b border-line/50">
                    <td className="py-2 pr-3 text-muted">{i + 1}</td>
                    <td className="py-2 pr-3">{r.username ?? r.user_id}</td>
                    <td className="py-2 pr-3 font-semibold text-accent">{r.level}</td>
                    <td className="py-2">{r.xp.toLocaleString('pl-PL')}</td>
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
