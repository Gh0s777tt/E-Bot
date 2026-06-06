import { Gavel, Hourglass, ShieldCheck } from 'lucide-react';
import AutomodForm from '../../components/AutomodForm';
import { getAutomodConfig } from '../../lib/community';
import { getModCases, getTempBans } from '../../lib/faza4';
import { getGuildMeta } from '../../lib/guild';

export const dynamic = 'force-dynamic';

const ACTION_STYLE: Record<string, string> = {
  warn: 'bg-yellow-500/15 text-yellow-300',
  timeout: 'bg-orange-500/15 text-orange-300',
  clear: 'bg-sky-500/15 text-sky-300',
  note: 'bg-violet-500/15 text-violet-300',
  kick: 'bg-accent/15 text-accent',
  tempban: 'bg-accent/15 text-accent',
  unban: 'bg-green-500/15 text-green-300',
  ban: 'bg-accent/20 text-accent',
};

function fmt(d: string): string {
  try {
    return new Date(d).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return d;
  }
}

function remaining(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'lada chwila';
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(' ') || '<1m';
}

export default async function ModerationPage() {
  const [cfg, cases, tempbans, guild] = await Promise.all([
    getAutomodConfig(),
    getModCases(30),
    getTempBans(50),
    getGuildMeta(),
  ]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Automoderacja: blokowanie zaproszeń/linków, limit wzmianek i anty-spam. Naruszenia są
        usuwane i logowane na mod-log. Ręczne komendy bota:{' '}
        <code className="text-accent">/mod</code> (warn · timeout · kick · ban · tempban · unban ·
        note · clear · warnings) oraz <code className="text-accent">/case user|recent</code> —
        historia spraw (tylko moderatorzy; akcje twarde wymagają stosownych uprawnień). Tempbany bot
        zdejmuje automatycznie po upływie czasu. (Anti-Nuke przeciw masowym akcjom admina znajdziesz
        w <strong>Bezpieczeństwo</strong>.){' '}
        {cfg.enabled ? (
          <span className="font-semibold text-green-400">Automod: WŁĄCZONY</span>
        ) : (
          <span className="font-semibold text-accent">Automod: WYŁĄCZONY</span>
        )}
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <ShieldCheck size={16} className="text-accent" /> Automod
        </h2>
        <AutomodForm initial={cfg} guild={guild} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Gavel size={16} className="text-accent" /> Historia spraw
        </h2>
        {cases.length === 0 ? (
          <p className="text-sm text-muted">
            Brak spraw. Akcje z <code className="text-accent">/mod warn|timeout|clear</code> pojawią
            się tutaj (wymaga uruchomienia <code>mod-cases-schema.sql</code> w Supabase).
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-line">
                  <th className="px-3 py-2">Akcja</th>
                  <th className="px-3 py-2">Użytkownik</th>
                  <th className="px-3 py-2">Moderator</th>
                  <th className="px-3 py-2">Powód</th>
                  <th className="px-3 py-2">Kiedy</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id} className="border-b border-line/50">
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold uppercase ${ACTION_STYLE[c.action] ?? 'bg-line text-muted'}`}
                      >
                        {c.action}
                      </span>
                    </td>
                    <td className="px-3 py-2">{c.username || c.user_id || '—'}</td>
                    <td className="px-3 py-2 text-muted">{c.moderator_name || '—'}</td>
                    <td className="px-3 py-2 text-muted">{c.reason || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted">{fmt(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Hourglass size={16} className="text-accent" /> Aktywne tempbany
        </h2>
        {tempbans.length === 0 ? (
          <p className="text-sm text-muted">
            Brak aktywnych tempbanów. Nadaj je przez{' '}
            <code className="text-accent">/mod tempban</code> (wymaga uruchomienia{' '}
            <code>f6-moderation-schema.sql</code> w Supabase). Bot zdejmie ban automatycznie po
            upływie czasu.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-line">
                  <th className="px-3 py-2">Użytkownik</th>
                  <th className="px-3 py-2">Powód</th>
                  <th className="px-3 py-2">Auto-unban</th>
                  <th className="px-3 py-2">Pozostało</th>
                </tr>
              </thead>
              <tbody>
                {tempbans.map((t) => (
                  <tr key={t.id} className="border-b border-line/50">
                    <td className="px-3 py-2">{t.username || t.user_id}</td>
                    <td className="px-3 py-2 text-muted">{t.reason || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted">{fmt(t.unban_at)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted">
                      {remaining(t.unban_at)}
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
