import { publicProfile } from '../../../../lib/public';

export const dynamic = 'force-dynamic';

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-line bg-elevated/40 p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 font-display text-2xl text-accent">{value}</div>
    </div>
  );
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await publicProfile(id);
  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <section className="panel-glow rounded-2xl border border-line bg-card p-6">
        <h1 className="font-display text-2xl tracking-wide">{p.username}</h1>
        <p className="text-xs text-muted">Publiczny profil — E-Bot.</p>
        {p.found ? (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Poziom" value={p.level} />
            <Stat label="XP" value={p.xp.toLocaleString('pl-PL')} />
            <Stat label="Saldo" value={p.total.toLocaleString('pl-PL')} />
            <Stat label="Zaproszenia" value={p.invites} />
            <Stat label="Odznaki" value={`${p.badges}/13`} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">Brak danych dla tego użytkownika.</p>
        )}
      </section>
    </div>
  );
}
