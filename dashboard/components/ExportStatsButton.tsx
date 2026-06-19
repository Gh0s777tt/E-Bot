'use client';

// Eksport serii aktywności /stats do CSV — generowany klient-side (Blob), bez API route.
import { Download } from 'lucide-react';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';

type Row = { day: string; messages: number; joins: number; leaves: number; voice: number };

export default function ExportStatsButton({ rows }: { rows: Row[] }) {
  const { lang } = useLang();
  function exportCsv() {
    const header = ['day', 'messages', 'joins', 'leaves', 'voice'];
    const lines = [header.join(',')].concat(
      rows.map((r) => [r.day, r.messages, r.joins, r.leaves, r.voice].join(',')),
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `e-bot-stats-${rows.length}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <button
      type="button"
      onClick={exportCsv}
      disabled={rows.length === 0}
      className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1 text-xs font-semibold text-muted transition hover:border-accent hover:text-accent disabled:opacity-50"
    >
      <Download size={13} /> {tp(lang, 'ui.stats.exportCsv')}
    </button>
  );
}
