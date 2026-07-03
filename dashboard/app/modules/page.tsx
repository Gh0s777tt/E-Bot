import ControlCenter from '../../components/ControlCenter';
import { getModuleHealth } from '../../lib/moduleState';
import { MODULE_VIEWS } from '../../lib/modules';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function ModulesPage() {
  const [health, lang] = await Promise.all([getModuleHealth(), getPanelLocale()]);
  const initial: Record<string, boolean> = Object.fromEntries(
    Object.entries(health).map(([k, v]) => [k, v.enabled]),
  );
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">{tp(lang, 'ui.modules.intro')}</p>
      <ControlCenter modules={MODULE_VIEWS} initial={initial} health={health} />
    </div>
  );
}
