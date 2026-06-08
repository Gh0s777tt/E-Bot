import { ShieldCheck } from 'lucide-react';
import type { AutomodStats as AutomodStatsData } from '../lib/community';

// Statystyki ochrony (ostatnie 7 dni) — zliczane przez bota. Server component (statyczny widok).
const CAT_LABEL: Record<string, string> = {
  scam: 'Scam / phishing',
  pii: 'Dane osobowe',
  word: 'Zakazane słowa',
  regex: 'Wzorce regex',
  invite: 'Zaproszenia',
  link: 'Linki',
  mention: 'Wzmianki',
  spam: 'Spam',
  inne: 'Inne',
};

export default function AutomodStats({ stats }: { stats: AutomodStatsData }) {
  const days: string[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const totals: Record<string, number> = {};
  for (const day of days) {
    for (const [cat, n] of Object.entries(stats[day] ?? {})) totals[cat] = (totals[cat] ?? 0) + n;
  }
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const grand = entries.reduce((s, [, n]) => s + n, 0);
  const max = entries[0]?.[1] ?? 1;

  return (
    <section className="panel-glow rounded-2xl border border-line bg-card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
        <ShieldCheck size={16} className="text-accent" /> Statystyki ochrony (7 dni)
      </h2>
      {grand === 0 ? (
        <p className="text-sm text-muted">
          Brak zablokowanych naruszeń w ostatnim tygodniu (albo bot dopiero zaczął liczyć).
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted">
            Łącznie usunięto: <strong className="text-white">{grand}</strong> wiadomości
          </p>
          {entries.map(([cat, n]) => (
            <div key={cat} className="flex items-center gap-3 text-sm">
              <span className="w-32 shrink-0 text-muted">{CAT_LABEL[cat] ?? cat}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.round((n / max) * 100)}%` }}
                />
              </div>
              <span className="w-10 text-right tabular-nums">{n}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
