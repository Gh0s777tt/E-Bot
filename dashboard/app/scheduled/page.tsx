import { CalendarClock } from 'lucide-react';
import ScheduledPostsForm from '../../components/ScheduledPostsForm';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getScheduledPosts } from '../../lib/scheduledPosts';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function ScheduledPage() {
  const [posts, guild, lang] = await Promise.all([
    getScheduledPosts(),
    getGuildMeta(),
    getPanelLocale(),
  ]);
  const active = posts.filter((p) => p.enabled).length;
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        {tp(lang, 'ui.scheduled.intro')}{' '}
        {active > 0 ? (
          <span className="font-semibold text-green-400">
            {tp(lang, 'ui.scheduled.active')} {active}
          </span>
        ) : (
          <span className="font-semibold text-accent">{tp(lang, 'ui.scheduled.noneActive')}</span>
        )}
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <CalendarClock size={16} className="text-accent" /> {tp(lang, 'ui.scheduled.heading')}
        </h2>
        <ScheduledPostsForm initial={posts} guild={guild} />
      </section>
    </div>
  );
}
