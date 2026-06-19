import OnboardingGuilds from '../../components/OnboardingGuilds';
import { botInviteUrl } from '../../lib/enroll';
import { getAccessibleGuildIds, getBotGuilds } from '../../lib/guild';

export const dynamic = 'force-dynamic';

// M4 — onboarding self-serve: krok „dodaj bota" (link zaproszenia) + Twoje serwery (dostępne dla
// zalogowanego, z getAccessibleGuildIds przez chokepoint). Klik na serwerze ustawia kontekst
// i przenosi do pulpitu. Teksty po polsku (bazowy język).
export default async function OnboardingPage() {
  const [accessible, bots] = await Promise.all([getAccessibleGuildIds(), getBotGuilds()]);
  const allow = new Set(accessible);
  const mine = bots.filter((g) => allow.has(g.id));
  const invite = botInviteUrl();
  return (
    <div className="max-w-2xl space-y-8">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/80">
          Krok 1 — dodaj bota
        </h2>
        <p className="text-sm text-muted">
          Zaproś E-BOT na swój serwer Discord, aby zarządzać nim z panelu.
        </p>
        {invite ? (
          <a
            href={invite}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/20"
          >
            Dodaj E-BOT do serwera →
          </a>
        ) : (
          <p className="text-xs text-muted">
            Link zaproszenia niedostępny (brak DISCORD_CLIENT_ID).
          </p>
        )}
      </section>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/80">
          Krok 2 — Twoje serwery
        </h2>
        {mine.length ? (
          <OnboardingGuilds guilds={mine} />
        ) : (
          <p className="text-sm text-muted">
            Brak serwerów do zarządzania. Dodaj bota powyżej i odśwież stronę.
          </p>
        )}
      </section>
    </div>
  );
}
