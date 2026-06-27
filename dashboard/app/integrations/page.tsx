import { redirect } from 'next/navigation';
import IntegrationsManager from '../../components/IntegrationsManager';
import WebhookRelayForm from '../../components/WebhookRelayForm';
import { getGuildMeta } from '../../lib/guild';
import { getIntegrationConfig, getIntegrations, getWebhookRelay } from '../../lib/integrations';
import { isInstanceAdmin } from '../../lib/panelRoles';

export const dynamic = 'force-dynamic';

export default async function IntegrationsPage() {
  // Globalny config integracji (provider AI, webhook relay) — tylko admin instancji; inni → pulpit.
  if (!(await isInstanceAdmin())) redirect('/');
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
