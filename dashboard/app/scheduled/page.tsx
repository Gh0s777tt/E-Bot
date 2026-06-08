import { CalendarClock } from 'lucide-react';
import ScheduledPostsForm from '../../components/ScheduledPostsForm';
import { getGuildMeta } from '../../lib/guild';
import { getScheduledPosts } from '../../lib/scheduledPosts';

export const dynamic = 'force-dynamic';

export default async function ScheduledPage() {
  const [posts, guild] = await Promise.all([getScheduledPosts(), getGuildMeta()]);
  const active = posts.filter((p) => p.enabled).length;
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Zaplanowane ogłoszenia z pełnym edytorem (treść + embed). Bot wysyła je automatycznie —
        jednorazowo o danej dacie albo cyklicznie (codziennie / co tydzień) o wybranej godzinie.{' '}
        {active > 0 ? (
          <span className="font-semibold text-green-400">Aktywnych: {active}</span>
        ) : (
          <span className="font-semibold text-accent">Brak aktywnych</span>
        )}
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <CalendarClock size={16} className="text-accent" /> Zaplanowane posty
        </h2>
        <ScheduledPostsForm initial={posts} guild={guild} />
      </section>
    </div>
  );
}
