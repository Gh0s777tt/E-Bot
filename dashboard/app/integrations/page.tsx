import { getIntegrations } from '../../lib/integrations';
import { CheckCircle2, XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function IntegrationsPage() {
  const integrations = getIntegrations();
  const groups = [...new Set(integrations.map((i) => i.group))];

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted">
        Status na podstawie skonfigurowanych zmiennych środowiskowych. Zielone = klucz/konfiguracja obecne.
      </p>
      {groups.map((group) => (
        <section key={group}>
          <h2 className="mb-3 text-lg font-semibold">{group}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {integrations
              .filter((i) => i.group === group)
              .map((i) => (
                <div
                  key={i.name}
                  className={`flex items-center justify-between rounded-xl border p-4 ${
                    i.ok ? 'border-line bg-card' : 'border-accent/30 bg-accent/5'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{i.name}</div>
                    <div className="text-xs text-muted">{i.note}</div>
                  </div>
                  {i.ok ? (
                    <span className="flex items-center gap-1.5 text-sm text-green-400">
                      <CheckCircle2 size={18} /> OK
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-sm text-accent">
                      <XCircle size={18} /> brak
                    </span>
                  )}
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
