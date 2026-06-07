import { Coins, MessageSquare, Sparkles, Users } from 'lucide-react';
import AiConfigForm from '../../components/AiConfigForm';
import StatCard from '../../components/StatCard';
import { getAiConfig, getAiUsageToday } from '../../lib/faza4';

export const dynamic = 'force-dynamic';

export default async function AiPage() {
  const [cfg, usage] = await Promise.all([getAiConfig(), getAiUsageToday()]);

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Komendy AI na Discordzie (DeepSeek/OpenAI) z <strong>twardym limitem kosztów</strong> per
        użytkownik/dzień: <code className="text-accent">/ai</code> (pytanie z pamięcią kontekstu),{' '}
        <code className="text-accent">/tldr</code> (podsumowanie kanału),{' '}
        <code className="text-accent">/translate</code> (tłumaczenie),{' '}
        <code className="text-accent">/imagine</code> (obraz z opisu, OpenAI). Wszystkie dzielą
        poniższą konfigurację i limity. Bot stosuje ją na żywo.{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">AI: WŁĄCZONE</span>
        ) : (
          <span className="font-semibold text-accent">AI: WYŁĄCZONE</span>
        )}
      </p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Zapytania dziś"
          value={usage.totalRequests}
          icon={<MessageSquare size={14} />}
          accent
        />
        <StatCard label="Tokeny dziś" value={usage.totalTokens} icon={<Coins size={14} />} />
        <StatCard label="Użytkownicy dziś" value={usage.users} icon={<Users size={14} />} />
        <StatCard label="Model" value={cfg.model} icon={<Sparkles size={14} />} />
      </div>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Sparkles size={16} className="text-accent" /> Konfiguracja AI
        </h2>
        <AiConfigForm initial={cfg} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Users size={16} className="text-accent" /> Zużycie dziś (top 10)
        </h2>
        {usage.top.length === 0 ? (
          <p className="text-sm text-muted">
            Brak zużycia dziś. Po uruchomieniu{' '}
            <code className="text-accent">scripts/faza4-schema.sql</code> i użyciu{' '}
            <code className="text-accent">/ai</code> dane pojawią się tutaj.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-3">Użytkownik (ID)</th>
                  <th className="py-2 pr-3">Zapytania</th>
                  <th className="py-2">Tokeny</th>
                </tr>
              </thead>
              <tbody>
                {usage.top.map((u) => (
                  <tr key={u.user_id} className="border-b border-line/50">
                    <td className="py-2 pr-3 font-mono text-xs">{u.user_id}</td>
                    <td className="py-2 pr-3">{u.requests}</td>
                    <td className="py-2">{u.tokens_used.toLocaleString('pl-PL')}</td>
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
