'use client';

// Zwijany dziennik zmian: wpisy audytu pogrupowane po dniach w akordeon — domyślnie otwarty tylko
// najnowszy dzień, reszta zwinięta (koniec przewijania w nieskończoność). Grupowanie czystą,
// otestowaną groupAuditByDay; tu tylko stan otwarcia + formatowanie zależne od locale.
import { Calendar, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { AuditEntry } from '../lib/audit';
import { groupAuditByDay } from '../lib/auditGroup';
import { type PanelLocale, tp } from '../lib/panelI18n';

// Kod obszaru → klucz i18n. Nazwy własne (Anti-Nuke/Automod/Modmail) tłumacze zostawiają.
const AREA_KEYS: Record<string, string> = {
  antinuke: 'ui.audit.areaAntinuke',
  automod: 'ui.audit.areaAutomod',
  aimod: 'ui.audit.areaAimod',
  verification: 'ui.audit.areaVerification',
  antiraid: 'ui.audit.areaAntiraid',
  logging: 'ui.audit.areaLogging',
  modmail: 'ui.audit.areaModmail',
  modules: 'ui.audit.areaModules',
  settings: 'ui.audit.areaSettings',
};

function fmtTime(ts: string | undefined, locale: PanelLocale): string {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return ts;
  }
}

function fmtDay(day: string, locale: PanelLocale): string {
  if (day === 'unknown') return '—';
  try {
    return new Date(`${day}T00:00:00`).toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return day;
  }
}

export default function AuditLog({ entries, lang }: { entries: AuditEntry[]; lang: PanelLocale }) {
  const groups = groupAuditByDay(entries);
  // Start: tylko najnowszy dzień otwarty (deterministycznie → zero hydration mismatch).
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    groups.length ? { [groups[0].day]: true } : {},
  );

  if (groups.length === 0) {
    return (
      <section className="panel-glow overflow-hidden rounded-2xl border border-line bg-card">
        <p className="p-6 text-sm text-muted">{tp(lang, 'ui.audit.empty')}</p>
      </section>
    );
  }

  function toggle(day: string): void {
    setOpen((o) => ({ ...o, [day]: !o[day] }));
  }

  return (
    <section className="panel-glow overflow-hidden rounded-2xl border border-line bg-card">
      {groups.map((group) => {
        const isOpen = !!open[group.day];
        return (
          <div key={group.day} className="border-line/60 border-b last:border-0">
            <button
              type="button"
              onClick={() => toggle(group.day)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start transition hover:bg-elevated/40"
            >
              <span className="flex items-center gap-2 text-sm font-semibold capitalize">
                <Calendar size={15} className="shrink-0 text-accent" />
                {fmtDay(group.day, lang)}
              </span>
              <span className="flex items-center gap-2">
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                  {group.entries.length}
                </span>
                <ChevronDown
                  size={15}
                  className={`text-muted transition-transform ${isOpen ? '' : '-rotate-90'}`}
                />
              </span>
            </button>

            {isOpen && (
              <ul className="border-line/60 border-t">
                {group.entries.map((e) => (
                  <li
                    key={e.id ?? `${e.created_at}-${e.area}-${e.uid}`}
                    className="border-line/30 flex items-start gap-3 border-t px-4 py-2.5 text-sm first:border-0"
                  >
                    <span className="w-12 shrink-0 text-xs text-muted">
                      {fmtTime(e.created_at, lang)}
                    </span>
                    <span className="w-32 shrink-0 truncate">
                      {e.uname || e.uid || tp(lang, 'ui.audit.unknown')}
                    </span>
                    <span className="shrink-0">
                      <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                        {AREA_KEYS[e.area] ? tp(lang, AREA_KEYS[e.area]) : e.area}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1 break-words text-muted">{e.detail || '—'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </section>
  );
}
