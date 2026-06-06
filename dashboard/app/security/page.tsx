import { ShieldAlert } from 'lucide-react';
import AntinukeForm from '../../components/AntinukeForm';
import { getAntinuke } from '../../lib/data';

export const dynamic = 'force-dynamic';

export default async function SecurityPage() {
  const config = await getAntinuke();
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Anti-Nuke wykrywa masowe akcje (usuwanie kanałów/ról, bany, webhooki, dodawanie botów) przez
        dziennik audytu i karze sprawcę po przekroczeniu progu. Właściciel serwera i whitelista są
        pomijani. Zmiany bot pobiera na żywo (~15 s). Bot potrzebuje uprawnień:{' '}
        <em>Wyświetlanie dziennika audytu, Ban, Kick, Timeout, Zarządzanie rolami</em>.
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <ShieldAlert size={16} className="text-accent" /> Anti-Nuke
        </h2>
        <AntinukeForm initial={config} />
      </section>
    </div>
  );
}
