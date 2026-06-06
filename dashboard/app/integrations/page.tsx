import { getIntegrations, getIntegrationConfig } from '../../lib/integrations';
import IntegrationsManager from '../../components/IntegrationsManager';

export const dynamic = 'force-dynamic';

export default async function IntegrationsPage() {
  const integrations = getIntegrations();
  const config = await getIntegrationConfig();
  return <IntegrationsManager integrations={integrations} config={config} />;
}
