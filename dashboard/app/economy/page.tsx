import { Coins, ExternalLink, MessageSquare, Mic } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { getEconomyConfig, ghostUrl } from '../../lib/economy';

export const dynamic = 'force-dynamic';

export default async function EconomyPage() {
  const cfg = await getEconomyConfig();
  const portal = ghostUrl();

  if (!cfg) {
    return (
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <p className="text-sm text-muted">
          Nie udało się pobrać konfiguracji ekonomii z portalu GH0ST (
          <code className="text-accent">/api/bot/config</code>).
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Ghost Tokens (GT) za aktywność na Discordzie. Stawki ustawiasz w portalu GH0ST (admin) — bot
        pobiera je na żywo.{' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">Ekonomia: WŁĄCZONA</span>
        ) : (
          <span className="font-semibold text-accent">Ekonomia: WYŁĄCZONA</span>
        )}
      </p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="GT za wiadomość"
          value={cfg.messageReward}
          hint={`cooldown ${cfg.messageCooldownSeconds}s`}
          icon={<MessageSquare size={14} />}
          accent
        />
        <StatCard
          label="GT za minutę voice"
          value={cfg.voiceRewardPerMinute}
          hint={`tick co ${cfg.voiceTickSeconds}s`}
          icon={<Mic size={14} />}
        />
        <StatCard
          label="Status ekonomii"
          value={cfg.enabled ? 'ON' : 'OFF'}
          icon={<Coins size={14} />}
        />
      </div>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Coins size={16} className="text-accent" /> Zasady naliczania
        </h2>
        <ul className="space-y-2 text-sm">
          <li>
            💬 Wiadomość: <strong className="text-accent">+{cfg.messageReward} GT</strong> (maks.
            raz na {cfg.messageCooldownSeconds}s)
          </li>
          <li>
            🎙️ Voice: <strong className="text-accent">+{cfg.voiceRewardPerMinute} GT/min</strong>{' '}
            (tick co {cfg.voiceTickSeconds}s)
          </li>
          <li>😴 AFK liczy się: {cfg.afkGivesReward ? 'tak' : 'nie'}</li>
          <li>🔇 Wyciszony liczy się: {cfg.mutedGivesReward ? 'tak' : 'nie'}</li>
        </ul>
        <p className="mt-3 text-xs text-muted">
          Ostatnia zmiana stawek:{' '}
          {cfg.updatedAt ? new Date(cfg.updatedAt).toLocaleString('pl-PL') : '—'}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={portal}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold transition hover:bg-accent-hover"
          >
            Portal GH0ST <ExternalLink size={14} />
          </a>
          <a
            href={`${portal}/admin`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-4 py-2 text-sm font-semibold transition hover:bg-elevated"
          >
            Zmień stawki (admin)
          </a>
        </div>
      </section>

      <p className="text-xs text-muted">
        GT zdobywasz po połączeniu konta: na Discordzie użyj{' '}
        <code className="text-accent">/link &lt;kod&gt;</code> (kod z portalu). Saldo GT żyje w
        portalu.
      </p>
    </div>
  );
}
