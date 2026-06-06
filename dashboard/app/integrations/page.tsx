import IntegrationsManager from '../../components/IntegrationsManager';
import { getIntegrationConfig, getIntegrations } from '../../lib/integrations';

export const dynamic = 'force-dynamic';

export default async function IntegrationsPage() {
  const integrations = getIntegrations();
  const config = await getIntegrationConfig();
  return <IntegrationsManager integrations={integrations} config={config} />;
}
