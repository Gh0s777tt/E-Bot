import { getAntinuke } from '../../lib/data';
import AntinukeForm from '../../components/AntinukeForm';

export const dynamic = 'force-dynamic';

export default async function SecurityPage() {
  const config = await getAntinuke();
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Anti-Nuke wykrywa masowe akcje (usuwanie kanałów/ról, bany, webhooki, dodawanie botów) przez dziennik audytu
        i karze sprawcę po przekroczeniu progu. Właściciel serwera i whitelista są pomijani. Zmiany bot pobiera na
        żywo (~15 s). Bot potrzebuje uprawnień: <em>Wyświetlanie dziennika audytu, Ban, Kick, Timeout, Zarządzanie rolami</em>.
      </p>
      <AntinukeForm initial={config} />
    </div>
  );
}
