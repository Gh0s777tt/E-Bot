'use client';

import { useState } from 'react';
import SaveButton from './SaveButton';

type Cfg = {
  enabled: boolean;
  model: 'deepseek' | 'openai';
  dailyRequestLimit: number;
  dailyTokenLimit: number;
  persona: string;
};

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const num = (v: string): number => Math.max(0, Math.floor(Number(v) || 0));

export default function AiConfigForm({ initial }: { initial: Cfg }) {
  const [c, setC] = useState<Cfg>(initial);
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  async function save() {
    setSt('saving');
    try {
      const r = await fetch('/api/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      });
      setSt(r.ok ? 'ok' : 'err');
    } catch {
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 2500);
  }

  return (
    <div className="max-w-xl space-y-4">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={c.enabled}
          onChange={(e) => setC({ ...c, enabled: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">Komendy AI włączone</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Model</span>
          <select
            value={c.model}
            onChange={(e) => setC({ ...c, model: e.target.value as Cfg['model'] })}
            className={inputCls}
          >
            <option value="deepseek">DeepSeek (tani)</option>
            <option value="openai">OpenAI</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Limit zapytań / dzień / użytkownik</span>
          <input
            type="number"
            value={c.dailyRequestLimit}
            onChange={(e) => setC({ ...c, dailyRequestLimit: num(e.target.value) })}
            className={inputCls}
          />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-semibold text-white/90">Limit tokenów / dzień / użytkownik</span>
          <input
            type="number"
            value={c.dailyTokenLimit}
            onChange={(e) => setC({ ...c, dailyTokenLimit: num(e.target.value) })}
            className={inputCls}
          />
        </label>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-semibold text-white/90">Persona — osobowość /ai (opcjonalnie)</span>
        <textarea
          value={c.persona}
          onChange={(e) => setC({ ...c, persona: e.target.value })}
          rows={3}
          maxLength={1000}
          placeholder="np. Jesteś zadziornym, dowcipnym botem gamingowym serwera GH0ST…"
          className={inputCls}
        />
      </label>

      <SaveButton st={st} onClick={save} />
      <p className="text-xs text-muted">
        Komenda <code className="text-accent">/ai</code> w bocie sprawdza dzienny limit (tabela
        <code className="text-accent"> ai_usage</code>) przed wywołaniem modelu — twardy bezpiecznik
        kosztów. Klucze API (DeepSeek/OpenAI) są w <code>.env</code> bota.
      </p>
    </div>
  );
}
