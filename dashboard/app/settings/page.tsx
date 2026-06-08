import { Activity, Archive, Bot, Cloud, Palette, Server } from 'lucide-react';
import BotCustomizeForm from '../../components/BotCustomizeForm';
import BotPresenceForm from '../../components/BotPresenceForm';
import ConfigBackupForm from '../../components/ConfigBackupForm';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import { getBotProfile } from '../../lib/botProfile';
import { activeSource, getRawSetting, getStats } from '../../lib/data';
import { hasSupabase } from '../../lib/supabase';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const [src, stats, botProfile, presenceRaw] = await Promise.all([
    activeSource(),
    getStats(),
    getBotProfile(),
    getRawSetting('bot_presence'),
  ]);

  let presence = { status: 'online', type: 'none', text: '', url: '' };
  if (presenceRaw) {
    try {
      presence = { ...presence, ...(JSON.parse(presenceRaw) as Record<string, string>) };
    } catch {
      /* domyślne */
    }
  }

  const rows: { label: string; value: string }[] = [
    {
      label: 'Aktywne źródło danych',
      value:
        src === 'supabase' ? 'Supabase (chmura)' : src === 'sqlite' ? 'SQLite (lokalnie)' : 'brak',
    },
    { label: 'Supabase skonfigurowane', value: hasSupabase ? 'tak (klucze obecne)' : 'nie' },
    { label: 'Gry w bibliotece', value: String(stats.total) },
    { label: 'Hosting docelowy', value: 'Vercel (kraina-duchow / e-bot)' },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Bot size={16} className="text-accent" /> Personalizacja bota
        </h2>
        <BotCustomizeForm initial={botProfile} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Activity size={16} className="text-accent" /> Status / aktywność bota
        </h2>
        <BotPresenceForm initial={presence} />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Palette size={16} className="text-accent" /> Motyw / kolor akcentu
        </h2>
        <ThemeSwitcher />
        <p className="mt-3 text-xs text-muted">
          Zmiana koloru zapisuje się w przeglądarce (per urządzenie) i działa natychmiast.
        </p>
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Server size={16} className="text-accent" /> System
        </h2>
        <dl className="space-y-3 text-sm">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex justify-between gap-4 border-b border-line/60 pb-2 last:border-0"
            >
              <dt className="text-muted">{r.label}</dt>
              <dd className="text-right font-medium">{r.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Archive size={16} className="text-accent" /> Kopia / przywracanie konfiguracji
        </h2>
        <ConfigBackupForm />
      </section>

      <section className="panel-glow rounded-2xl border border-line bg-card p-5 text-sm text-muted">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold uppercase tracking-wide text-white">
          <Cloud size={16} className="text-accent" /> Wdrożenie do chmury
        </h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Utwórz tabele: wklej <code className="text-accent">supabase/schema.sql</code> w Supabase
            → SQL Editor.
          </li>
          <li>
            Zasiej dane: <code className="text-accent">npm run seed</code> (wysyła bibliotekę do
            Supabase).
          </li>
          <li>Deploy na Vercel (ustaw zmienne SUPABASE_URL + klucze).</li>
        </ol>
      </section>
    </div>
  );
}
