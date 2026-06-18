'use client';

import { CheckCircle2, Plug, Save, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { Integration, IntegrationConfig } from '../lib/integrations';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';

export default function IntegrationsManager({
  integrations,
  config,
}: {
  integrations: Integration[];
  config: IntegrationConfig;
}) {
  const { lang } = useLang();
  const [enabled, setEnabled] = useState<Record<string, boolean>>(config.enabled ?? {});
  const [aiProvider, setAiProvider] = useState(config.aiProvider ?? '');
  const [aiModel, setAiModel] = useState(config.aiModel ?? '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const groups = [...new Set(integrations.map((i) => i.group))];
  const isOn = (name: string) => enabled[name] !== false; // domyślnie włączona

  async function save() {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, aiProvider, aiModel }),
      });
      const data = await res.json();
      setMsg(
        data.ok
          ? tp(lang, 'ui.saved')
          : `${tp(lang, 'ui.integrations.errorPrefix')} ${data.error ?? tp(lang, 'ui.integrations.unknownError')}`,
      );
    } catch (e) {
      setMsg(`${tp(lang, 'ui.integrations.errorPrefix')} ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{tp(lang, 'ui.integrations.intro')}</p>
        <button
          onClick={save}
          disabled={saving}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold transition hover:bg-accent-hover disabled:opacity-50"
        >
          <Save size={15} /> {saving ? tp(lang, 'ui.saving') : tp(lang, 'ui.save')}
        </button>
      </div>
      {msg && <p className="text-sm text-muted">{msg}</p>}

      {groups.map((group) => (
        <section key={group} className="panel-glow rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
            <Plug size={16} className="text-accent" /> {group}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {integrations
              .filter((i) => i.group === group)
              .map((i) => (
                <div
                  key={i.name}
                  className={`rounded-xl border p-3.5 ${i.ok ? 'border-line bg-bg/40' : 'border-accent/30 bg-accent/5'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{i.name}</div>
                      <div className="text-xs text-muted">{i.note}</div>
                    </div>
                    {i.ok ? (
                      <span className="flex items-center gap-1.5 text-sm text-green-400">
                        <CheckCircle2 size={16} /> {tp(lang, 'ui.integrations.statusOk')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm text-accent">
                        <XCircle size={16} /> {tp(lang, 'ui.integrations.statusMissing')}
                      </span>
                    )}
                  </div>
                  <label className="mt-3 flex cursor-pointer items-center justify-between text-sm">
                    <span className="text-muted">{tp(lang, 'ui.integrations.toggleOn')}</span>
                    <input
                      type="checkbox"
                      checked={isOn(i.name)}
                      onChange={(e) => setEnabled((s) => ({ ...s, [i.name]: e.target.checked }))}
                      className="h-4 w-4 accent-[#E50914]"
                    />
                  </label>
                </div>
              ))}
          </div>
        </section>
      ))}

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
          <Plug size={16} className="text-accent" /> {tp(lang, 'ui.integrations.aiHeading')}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-muted">
              {tp(lang, 'ui.integrations.providerLabel')}
            </span>
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
              className="w-full rounded-md border border-line bg-bg/40 px-3 py-2"
            >
              <option value="">{tp(lang, 'ui.integrations.providerNone')}</option>
              <option value="openai">OpenAI</option>
              <option value="deepseek">DeepSeek</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">{tp(lang, 'ui.integrations.modelLabel')}</span>
            <input
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              placeholder={tp(lang, 'ui.integrations.modelPh')}
              className="w-full rounded-md border border-line bg-bg/40 px-3 py-2"
            />
          </label>
        </div>
      </section>
    </div>
  );
}
