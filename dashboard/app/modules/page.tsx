import ControlCenter from '../../components/ControlCenter';
import { getModuleStates } from '../../lib/moduleState';
import { MODULE_VIEWS } from '../../lib/modules';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function ModulesPage() {
  const [states, lang] = await Promise.all([getModuleStates(), getPanelLocale()]);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">{tp(lang, 'ui.modules.intro')}</p>
      <ControlCenter modules={MODULE_VIEWS} initial={states} />
    </div>
  );
}
