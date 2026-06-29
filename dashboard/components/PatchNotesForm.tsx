'use client';

import { Pin, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import type { PatchItem, PatchNotesConfig } from '../lib/community';
import { type CatalogEntry, getCatalogEntry, searchCatalog } from '../lib/gameCatalog';
import type { GuildMeta } from '../lib/guild';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { ChannelSelect, RoleSelect } from './pickers';
import SaveButton from './SaveButton';

type Row = PatchItem & { k: string };
type TestState = { loading?: boolean; err?: boolean; items?: { title: string; url: string }[] };

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
const catEmoji = (cat?: string): string => (cat === 'gpu' ? '🖥️' : cat === 'news' ? '📰' : '🎮');
const rowEmoji = (r: Row): string => catEmoji(r.slug ? getCatalogEntry(r.slug)?.category : 'game');

export default function PatchNotesForm({
  initial,
  guild,
}: {
  initial: PatchNotesConfig;
  guild: GuildMeta;
}) {
  const { lang } = useLang();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [channelId, setChannelId] = useState(initial.channelId);
  const [digest, setDigest] = useState<'instant' | 'daily'>(initial.digest ?? 'instant');
  const [digestHour, setDigestHour] = useState(initial.digestHour ?? 12);
  const [aiSummary, setAiSummary] = useState(!!initial.aiSummary);
  const idRef = useRef(0);
  const [rows, setRows] = useState<Row[]>(() => [
    ...(initial.items ?? []).map((it) => ({ ...it, k: `p${idRef.current++}` })),
    // Migracja starego kształtu {appId,name} → wpis Steam.
    ...(initial.apps ?? []).map((a) => ({
      name: a.name,
      source: { kind: 'steam' as const, appId: a.appId },
      k: `p${idRef.current++}`,
    })),
  ]);
  const [query, setQuery] = useState('');
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [tests, setTests] = useState<Record<string, TestState>>({});
  const [st, setSt] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  const addedSlugs = useMemo(
    () => new Set(rows.map((r) => r.slug).filter(Boolean) as string[]),
    [rows],
  );
  const results = useMemo<CatalogEntry[]>(
    () => searchCatalog(query).filter((e) => !addedSlugs.has(e.slug)),
    [query, addedSlugs],
  );

  function add(e: CatalogEntry) {
    setRows((r) => [
      ...r,
      { slug: e.slug, name: e.name, source: e.source, image: e.image, k: `p${idRef.current++}` },
    ]);
    setQuery('');
  }
  function addCustom() {
    const url = customUrl.trim();
    if (!/^https?:\/\//i.test(url)) return;
    const name = customName.trim() || url;
    setRows((r) => [...r, { name, source: { kind: 'rss', url }, k: `p${idRef.current++}` }]);
    setCustomName('');
    setCustomUrl('');
  }
  const patch = (k: string, p: Partial<Row>) =>
    setRows((r) => r.map((x) => (x.k === k ? { ...x, ...p } : x)));

  async function testRow(r: Row) {
    setTests((t) => ({ ...t, [r.k]: { loading: true } }));
    try {
      const res = await fetch('/api/patchnotes/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: r.source }),
      });
      const d = (await res.json()) as { ok?: boolean; items?: { title: string; url: string }[] };
      setTests((t) => ({ ...t, [r.k]: { items: d.ok ? (d.items ?? []) : [], err: !d.ok } }));
    } catch {
      setTests((t) => ({ ...t, [r.k]: { err: true } }));
    }
  }

  async function save() {
    setSt('saving');
    try {
      const payload = {
        enabled,
        channelId,
        digest,
        digestHour,
        aiSummary,
        items: rows.map(({ k, ...it }) => it).filter((it) => it.name && it.source),
      };
      const r = await fetch('/api/patchnotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-semibold text-white/90">{tp(lang, 'ui.gaming.patchEnabled')}</span>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-semibold text-white/90">{tp(lang, 'ui.gaming.channelAnnounce')}</span>
        <ChannelSelect
          value={channelId}
          onChange={setChannelId}
          channels={guild.channels}
          placeholder={tp(lang, 'ui.gaming.channelPh')}
        />
      </label>

      {/* Tryb dostarczania + AI */}
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">{tp(lang, 'ui.gaming.deliveryLabel')}</span>
          <select
            value={digest}
            onChange={(e) => setDigest(e.target.value as 'instant' | 'daily')}
            className={inputCls}
          >
            <option value="instant">{tp(lang, 'ui.gaming.deliveryInstant')}</option>
            <option value="daily">{tp(lang, 'ui.gaming.deliveryDaily')}</option>
          </select>
        </label>
        {digest === 'daily' && (
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-white/90">{tp(lang, 'ui.gaming.digestHour')}</span>
            <input
              type="number"
              min={0}
              max={23}
              value={digestHour}
              onChange={(e) =>
                setDigestHour(Math.min(23, Math.max(0, Math.floor(Number(e.target.value) || 0))))
              }
              className={inputCls}
            />
          </label>
        )}
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={aiSummary}
          onChange={(e) => setAiSummary(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        <span className="text-white/90">{tp(lang, 'ui.gaming.aiSummary')}</span>
      </label>

      {/* Wyszukiwarka katalogu */}
      <div className="space-y-2">
        <span className="text-sm font-semibold text-white/90">
          {tp(lang, 'ui.gaming.catalogLabel')}
        </span>
        <div className="relative">
          <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tp(lang, 'ui.gaming.catalogSearchPh')}
            className={`${inputCls} ps-9`}
          />
        </div>
        {results.length > 0 && (
          <div className="overflow-hidden rounded-md border border-line">
            {results.map((e) => (
              <button
                type="button"
                key={e.slug}
                onClick={() => add(e)}
                className="flex w-full items-center gap-2 border-line border-b px-3 py-2 text-start text-sm transition last:border-b-0 hover:bg-elevated"
              >
                <span>{catEmoji(e.category)}</span>
                <span className="flex-1 truncate">{e.name}</span>
                <span className="text-[11px] text-muted">{e.source.kind}</span>
                <Plus size={13} className="text-accent" />
              </button>
            ))}
          </div>
        )}
        {/* Własne źródło RSS (A4) */}
        <div className="flex gap-2">
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder={tp(lang, 'ui.gaming.namePh')}
            className={`${inputCls} w-36 shrink-0`}
          />
          <input
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder={tp(lang, 'ui.gaming.customUrlPh')}
            className={inputCls}
          />
          <button
            type="button"
            onClick={addCustom}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-line px-2.5 text-xs transition hover:bg-elevated"
          >
            <Plus size={12} /> {tp(lang, 'ui.gaming.addBtn')}
          </button>
        </div>
        <p className="text-[11px] text-muted">{tp(lang, 'ui.gaming.customLabel')}</p>
      </div>

      {/* Lista śledzonych */}
      <div className="space-y-2">
        <span className="text-sm font-semibold text-white/90">
          {tp(lang, 'ui.gaming.trackedLabel')}
        </span>
        {rows.map((r) => {
          const t = tests[r.k];
          return (
            <div key={r.k} className="space-y-2 rounded-md border border-line bg-elevated/40 p-2.5">
              <div className="flex items-center gap-2">
                <span>{rowEmoji(r)}</span>
                <span className="flex-1 truncate text-sm font-medium text-white/90">{r.name}</span>
                <button
                  type="button"
                  onClick={() => testRow(r)}
                  className="rounded-md border border-line px-2 py-1 text-muted text-xs transition hover:border-accent hover:text-accent"
                >
                  {tp(lang, 'ui.gaming.testBtn')}
                </button>
                <label className="flex items-center gap-1 text-muted text-xs">
                  <input
                    type="checkbox"
                    checked={!!r.pin}
                    onChange={(e) => patch(r.k, { pin: e.target.checked })}
                    className="h-3.5 w-3.5 accent-accent"
                  />
                  <Pin size={12} /> {tp(lang, 'ui.gaming.pin')}
                </label>
                <button
                  type="button"
                  onClick={() => setRows((rs) => rs.filter((x) => x.k !== r.k))}
                  className="rounded-md border border-line p-1.5 text-muted transition hover:border-accent hover:text-accent"
                  aria-label={tp(lang, 'ui.gaming.delAria')}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <ChannelSelect
                  value={r.channelId ?? ''}
                  onChange={(v) => patch(r.k, { channelId: v })}
                  channels={guild.channels}
                  placeholder={tp(lang, 'ui.gaming.channelPh')}
                />
                <RoleSelect
                  value={r.roleId ?? ''}
                  onChange={(v) => patch(r.k, { roleId: v })}
                  roles={guild.roles}
                  placeholder={tp(lang, 'ui.gaming.rolePing')}
                />
              </div>
              {t && (
                <div className="text-muted text-xs">
                  {t.loading ? (
                    '…'
                  ) : t.err || !t.items?.length ? (
                    tp(lang, 'ui.gaming.testEmpty')
                  ) : (
                    <ul className="list-disc ps-4">
                      {t.items.slice(0, 3).map((it) => (
                        <li key={`${it.url}|${it.title}`} className="truncate">
                          {it.url ? (
                            <a
                              href={it.url}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-accent"
                            >
                              {it.title}
                            </a>
                          ) : (
                            it.title
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SaveButton st={st} onClick={save} />
      <p className="text-muted text-xs">{tp(lang, 'ui.gaming.patchHelpV2')}</p>
    </div>
  );
}
