import ControlCenter from '../../components/ControlCenter';
import { getModuleStates } from '../../lib/moduleState';
import { MODULE_VIEWS } from '../../lib/modules';

export const dynamic = 'force-dynamic';

export default async function ModulesPage() {
  const states = await getModuleStates();
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted">
        Centrum sterowania — włącz lub wyłącz każdy moduł bota jednym kliknięciem. Szczegółową
        konfigurację znajdziesz pod „konfig" przy module.
      </p>
      <ControlCenter modules={MODULE_VIEWS} initial={states} />
    </div>
  );
}
