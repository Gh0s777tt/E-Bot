'use client';

import { AlertTriangle, Download, Upload } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';

type Diff = { total: number; added: number; changed: number; same: number; sample: string[] };

const btn =
  'inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm font-semibold transition hover:border-accent hover:bg-elevated disabled:opacity-50';

export default function ConfigBackupForm() {
  const { lang } = useLang();
  const [busy, setBusy] = useState<'idle' | 'exporting' | 'importing'>('idle');
  const [msg, setMsg] = useState('');
  const [pending, setPending] = useState<Record<string, string> | null>(null);
  const [diff, setDiff] = useState<Diff | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function doExport() {
    setBusy('exporting');
    setMsg('');
    try {
      const r = await fetch('/api/config/export');
      if (!r.ok) throw new Error('http');
      const data = (await r.json()) as { keys?: number; settings?: Record<string, string> };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, '0');
      const stamp = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
      a.href = url;
      a.download = `ebot-config-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMsg(
        `✓ ${tp(lang, 'ui.settings.exportedDone')} (${data.keys ?? Object.keys(data.settings ?? {}).length} ${tp(lang, 'ui.settings.keysWord')}).`,
      );
    } catch {
      setMsg(tp(lang, 'ui.settings.exportError'));
    }
    setBusy('idle');
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setMsg('');
    setDiff(null);
    setPending(null);
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as { settings?: unknown };
      const raw =
        parsed &&
        typeof parsed === 'object' &&
        parsed.settings &&
        typeof parsed.settings === 'object'
          ? parsed.settings
          : parsed;
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('format');
      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(raw)) if (typeof v === 'string') clean[k] = v;
      if (!Object.keys(clean).length) throw new Error('empty');

      const cur = (await fetch('/api/config/export')
        .then((r) => r.json())
        .catch(() => ({ settings: {} }))) as { settings?: Record<string, string> };
      const current = cur.settings ?? {};
      let added = 0;
      let changed = 0;
      let same = 0;
      const sample: string[] = [];
      for (const [k, v] of Object.entries(clean)) {
        if (!(k in current)) {
          added++;
          if (sample.length < 8) sample.push(`+ ${k}`);
        } else if (current[k] !== v) {
          changed++;
          if (sample.length < 8) sample.push(`~ ${k}`);
        } else same++;
      }
      setPending(clean);
      setDiff({ total: Object.keys(clean).length, added, changed, same, sample });
    } catch {
      setMsg(tp(lang, 'ui.settings.readFileError'));
    }
  }

  async function applyImport() {
    if (!pending) return;
    setBusy('importing');
    setMsg('');
    try {
      const r = await fetch('/api/config/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: pending }),
      });
      const j = (await r.json()) as { ok?: boolean; count?: number };
      if (!r.ok || !j.ok) throw new Error('http');
      setMsg(
        `✓ ${tp(lang, 'ui.settings.restoredPre')} ${j.count} ${tp(lang, 'ui.settings.keysWord')}. ${tp(lang, 'ui.settings.restoredPost')}`,
      );
      setPending(null);
      setDiff(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch {
      setMsg(tp(lang, 'ui.settings.importError'));
    }
    setBusy('idle');
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted">{tp(lang, 'ui.settings.backupIntro')}</p>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={doExport} disabled={busy !== 'idle'} className={btn}>
          <Download size={15} />{' '}
          {busy === 'exporting'
            ? tp(lang, 'ui.settings.downloading')
            : tp(lang, 'ui.settings.downloadBackup')}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy !== 'idle'}
          className={btn}
        >
          <Upload size={15} /> {tp(lang, 'ui.settings.loadBackup')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={onFile}
          className="hidden"
        />
      </div>

      {diff && (
        <div className="space-y-3 rounded-lg border border-line bg-bg/40 p-4">
          <p className="font-semibold text-white/90">
            {tp(lang, 'ui.settings.previewRestorePre')} {diff.total}{' '}
            {tp(lang, 'ui.settings.previewRestorePost')}
          </p>
          <div className="flex flex-wrap gap-4 text-xs">
            <span className="text-green-400">
              + {diff.added} {tp(lang, 'ui.settings.diffNew')}
            </span>
            <span className="text-amber-400">
              ~ {diff.changed} {tp(lang, 'ui.settings.diffChanged')}
            </span>
            <span className="text-muted">
              = {diff.same} {tp(lang, 'ui.settings.diffSame')}
            </span>
          </div>
          {diff.sample.length > 0 && (
            <pre className="max-h-32 overflow-auto rounded bg-elevated px-3 py-2 font-mono text-[11px] text-muted">
              {diff.sample.join('\n')}
              {diff.added + diff.changed > diff.sample.length ? '\n…' : ''}
            </pre>
          )}
          <div className="flex items-start gap-2 rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200/90">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>
              {tp(lang, 'ui.settings.importWarnPre')} {diff.changed + diff.added}{' '}
              {tp(lang, 'ui.settings.importWarnPost')}
            </span>
          </div>
          <button
            type="button"
            onClick={applyImport}
            disabled={busy !== 'idle'}
            className="rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
          >
            {busy === 'importing'
              ? tp(lang, 'ui.settings.restoring')
              : `${tp(lang, 'ui.settings.restoreBtn')} ${diff.added + diff.changed} ${tp(lang, 'ui.settings.keysWord')}`}
          </button>
        </div>
      )}

      {msg && (
        <p className={msg.startsWith('✓') ? 'text-sm text-green-400' : 'text-sm text-accent'}>
          {msg}
        </p>
      )}

      <p className="flex items-start gap-2 text-xs text-muted">
        <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-400/80" />
        <span>{tp(lang, 'ui.settings.backupWarn')}</span>
      </p>
    </div>
  );
}
