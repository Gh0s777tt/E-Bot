import { TerminalSquare } from 'lucide-react';
import CustomCommandsForm from '../../components/CustomCommandsForm';
import { getCustomCommands } from '../../lib/customCommands';
import { getGuildMeta } from '../../lib/guild';

export const dynamic = 'force-dynamic';

export default async function CustomCommandsPage() {
  const [commands, guild] = await Promise.all([getCustomCommands(), getGuildMeta()]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Twórz własne komendy slash bez kodu — bot odpowie ustaloną treścią lub embedem. Komendy
        rejestrują się w Discordzie automatycznie po zapisaniu.{' '}
        <span className="font-semibold text-white/80">{commands.length}</span> zdefiniowanych.
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <TerminalSquare size={16} className="text-accent" /> Własne komendy slash
        </h2>
        <CustomCommandsForm initial={commands} guild={guild} />
      </section>
    </div>
  );
}
