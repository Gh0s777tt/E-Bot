'use client';

// M4 — onboarding: lista serwerów dostępnych dla zalogowanego. Klik ustawia kontekst serwera
// (cookie panel_guild, jak GuildSwitcher) i przenosi do pulpitu.
import { Server } from 'lucide-react';

type BotGuild = { id: string; name: string; icon: string | null };

export default function OnboardingGuilds({ guilds }: { guilds: BotGuild[] }) {
  function pick(id: string): void {
    try {
      // biome-ignore lint/suspicious/noDocumentCookie: prosty zapis cookie wystarcza (jak GuildSwitcher)
      document.cookie = `panel_guild=${id}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* brak cookies */
    }
    window.location.href = '/';
  }

  return (
    <div className="space-y-2">
      {guilds.map((g) => (
        <button
          key={g.id}
          type="button"
          onClick={() => pick(g.id)}
          className="flex w-full items-center gap-3 rounded-lg border border-line bg-card p-3 text-start transition hover:border-accent/60"
        >
          {g.icon ? (
            <img
              src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=32`}
              alt=""
              className="h-7 w-7 rounded-full"
            />
          ) : (
            <span className="grid h-7 w-7 place-items-center rounded-full bg-elevated text-xs text-muted">
              {g.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="flex-1 truncate text-sm font-medium text-white">{g.name}</span>
          <Server size={14} className="text-muted" />
        </button>
      ))}
    </div>
  );
}
