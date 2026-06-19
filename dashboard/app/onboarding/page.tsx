import OnboardingGuilds from '../../components/OnboardingGuilds';
import { botInviteUrl } from '../../lib/enroll';
import { getAccessibleGuildIds, getBotGuilds } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

// M4 — onboarding self-serve: krok „dodaj bota" (link zaproszenia) + Twoje serwery (dostępne dla
// zalogowanego, z getAccessibleGuildIds przez chokepoint). Klik na serwerze ustawia kontekst
// i przenosi do pulpitu. i18n: ui.onb.* (14 języków).
export default async function OnboardingPage() {
  const [accessible, bots, lang] = await Promise.all([
    getAccessibleGuildIds(),
    getBotGuilds(),
    getPanelLocale(),
  ]);
  const allow = new Set(accessible);
  const mine = bots.filter((g) => allow.has(g.id));
  const invite = botInviteUrl();
  return (
    <div className="max-w-2xl space-y-8">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/80">
          {tp(lang, 'ui.onb.step1')}
        </h2>
        <p className="text-sm text-muted">{tp(lang, 'ui.onb.step1desc')}</p>
        {invite ? (
          <a
            href={invite}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/20"
          >
            {tp(lang, 'ui.onb.addBot')} →
          </a>
        ) : (
          <p className="text-xs text-muted">{tp(lang, 'ui.onb.noInvite')}</p>
        )}
      </section>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/80">
          {tp(lang, 'ui.onb.step2')}
        </h2>
        {mine.length ? (
          <OnboardingGuilds guilds={mine} />
        ) : (
          <p className="text-sm text-muted">{tp(lang, 'ui.onb.noGuilds')}</p>
        )}
      </section>
    </div>
  );
}
