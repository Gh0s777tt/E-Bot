import { TerminalSquare } from 'lucide-react';
import CustomCommandsForm from '../../components/CustomCommandsForm';
import { getCustomCommands } from '../../lib/customCommands';
import { getGuildMeta } from '../../lib/guild';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function CustomCommandsPage() {
  const [commands, guild, lang] = await Promise.all([
    getCustomCommands(),
    getGuildMeta(),
    getPanelLocale(),
  ]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        {tp(lang, 'ui.cc.intro')}{' '}
        <span className="font-semibold text-white/80">{commands.length}</span>{' '}
        {tp(lang, 'ui.cc.introCount')}
      </p>
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <TerminalSquare size={16} className="text-accent" /> {tp(lang, 'ui.cc.heading')}
        </h2>
        <CustomCommandsForm initial={commands} guild={guild} />
      </section>
    </div>
  );
}
