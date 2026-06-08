import IntegrationsManager from '../../components/IntegrationsManager';
import WebhookRelayForm from '../../components/WebhookRelayForm';
import { getGuildMeta } from '../../lib/guild';
import { getIntegrationConfig, getIntegrations, getWebhookRelay } from '../../lib/integrations';

export const dynamic = 'force-dynamic';

export default async function IntegrationsPage() {
  const integrations = getIntegrations();
  const [config, relay, guild] = await Promise.all([
    getIntegrationConfig(),
    getWebhookRelay(),
    getGuildMeta(),
  ]);
  return (
    <div className="space-y-6">
      <IntegrationsManager integrations={integrations} config={config} />
      <WebhookRelayForm initial={relay} guild={guild} />
    </div>
  );
}
