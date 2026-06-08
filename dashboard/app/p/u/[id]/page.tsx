import { Trophy } from 'lucide-react';
import Link from 'next/link';
import ProfileCard from '../../../../components/ProfileCard';
import { profileCard } from '../../../../lib/public';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await profileCard(id);
  const desc = `Poziom ${c.level}${c.rank ? ` · #${c.rank} w rankingu XP` : ''} · ${c.messages.toLocaleString('pl-PL')} wiadomości · ${c.badges}/13 odznak`;
  return { title: `${c.username} — profil E-Bot`, description: desc };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await profileCard(id);
  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-wide">Profil publiczny</h1>
          <p className="text-xs text-muted">E-Bot — karta gracza</p>
        </div>
        <Link
          href="/p/leaderboard"
          className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs text-muted transition hover:border-accent hover:text-accent"
        >
          <Trophy size={13} /> Ranking
        </Link>
      </header>

      <ProfileCard data={card} uname={card.username} />

      {!card.found && (
        <p className="mt-4 text-center text-sm text-muted">
          Brak danych dla tego użytkownika — być może jeszcze nie był aktywny.
        </p>
      )}
    </div>
  );
}
