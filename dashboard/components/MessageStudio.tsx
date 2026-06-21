'use client';

// Faza 8 — Message Studio: uniwersalny edytor treści + embed dla wszystkich modułów.
// Wynik to RichMessage (JSON), bot renderuje przez bot/src/lib/richMessage.mts.
// Live-preview ~jak Discord, liczniki znaków wg limitów, smallcaps/fonty Unicode,
// emoji standardowe + customowe z serwera, zmienne, szablony (localStorage).
import {
  ArrowDown,
  ArrowUp,
  Bold,
  Code,
  Italic,
  Plus,
  Send,
  Smile,
  Strikethrough,
  Trash2,
  Underline,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { GuildChannel, GuildEmoji } from '../lib/guild';
import {
  EMPTY_V2,
  embedHasContent,
  embedTotal,
  LIMITS,
  LIMITS_V2,
  type RichEmbed,
  type RichField,
  type RichMessage,
  type V2Block,
  type V2Spec,
  v2TextTotal,
} from '../lib/richMessage';
import { applyFont, FONTS, type FontKey } from '../lib/unicodeFonts';
import ColorField from './ColorField';
import type { EditorVar } from './MessageEditor';
import { ChannelSelect } from './pickers';

const EMOJIS = [
  '😀',
  '😎',
  '🥳',
  '😍',
  '🤔',
  '😢',
  '😡',
  '👍',
  '👎',
  '🙏',
  '👏',
  '🔥',
  '💯',
  '✨',
  '🎉',
  '🎮',
  '🕹️',
  '🏆',
  '⭐',
  '❤️',
  '💜',
  '💚',
  '💙',
  '🧡',
  '⚡',
  '🚀',
  '🎯',
  '✅',
  '❌',
  '⚠️',
  '🔔',
  '📢',
  '🎁',
  '🛡️',
  '👑',
  '💰',
  '💀',
  '🤖',
  '📌',
  '🧠',
];

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Lekki render markdown Discorda → HTML (podgląd): emoji customowe, wzmianki, formatowanie.
function renderMarkdown(raw: string, vars: EditorVar[]): string {
  let s = raw;
  for (const v of vars) s = s.split(v.token).join(v.sample);
  s = escapeHtml(s);
  s = s.replace(
    /&lt;(a?):(\w{2,32}):(\d{5,25})&gt;/g,
    (_m, a: string, _name: string, id: string) =>
      `<img class="inline-block h-[1.25em] w-[1.25em] align-text-bottom" src="https://cdn.discordapp.com/emojis/${id}.${a ? 'gif' : 'png'}" alt="" />`,
  );
  s = s.replace(
    /&lt;@&amp;(\d{5,25})&gt;/g,
    '<span class="rounded bg-accent/25 px-1 text-accent">@rola</span>',
  );
  s = s.replace(
    /&lt;@!?(\d{5,25})&gt;/g,
    '<span class="rounded bg-[#5865F2]/30 px-1 text-[#aab3ff]">@użytkownik</span>',
  );
  s = s.replace(
    /&lt;#(\d{5,25})&gt;/g,
    '<span class="rounded bg-white/10 px-1 text-accent">#kanał</span>',
  );
  s = s.replace(/```([\s\S]+?)```/g, '<code class="block rounded bg-black/40 p-1">$1</code>');
  s = s.replace(/`([^`]+?)`/g, '<code class="rounded bg-black/40 px-1">$1</code>');
  s = s.replace(/\|\|([\s\S]+?)\|\|/g, '<span class="rounded bg-white/20 px-1">$1</span>');
  s = s.replace(/\*\*\*([\s\S]+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  s = s.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__([\s\S]+?)__/g, '<u>$1</u>');
  s = s.replace(/~~([\s\S]+?)~~/g, '<del>$1</del>');
  s = s.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
  s = s.replace(/_([^_\n]+?)_/g, '<em>$1</em>');
  s = s.replace(/^### (.*)$/gm, '<span class="font-bold">$1</span>');
  s = s.replace(/^## (.*)$/gm, '<span class="font-bold">$1</span>');
  s = s.replace(/^# (.*)$/gm, '<span class="font-bold">$1</span>');
  return s.replace(/\n/g, '<br/>');
}

function Counter({ len, limit }: { len: number; limit: number }) {
  const over = len > limit;
  return (
    <span
      className={`text-[10px] tabular-nums ${over ? 'font-semibold text-accent' : 'text-muted'}`}
    >
      {len}/{limit}
    </span>
  );
}

function RichTextArea({
  value,
  onChange,
  rows = 3,
  placeholder,
  variables = [],
  emojis = [],
  limit,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  variables?: EditorVar[];
  emojis?: GuildEmoji[];
  limit?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  function sel(): [number, number] {
    const el = ref.current;
    return el ? [el.selectionStart, el.selectionEnd] : [value.length, value.length];
  }
  function setCaret(pos: number) {
    requestAnimationFrame(() => {
      const el = ref.current;
      if (el) {
        el.focus();
        el.setSelectionRange(pos, pos);
      }
    });
  }
  function wrap(prefix: string, suffix = prefix) {
    const [a, b] = sel();
    const mid = value.slice(a, b) || 'tekst';
    onChange(value.slice(0, a) + prefix + mid + suffix + value.slice(b));
    setCaret(a + prefix.length + mid.length + suffix.length);
  }
  function insert(text: string) {
    const [a, b] = sel();
    onChange(value.slice(0, a) + text + value.slice(b));
    setCaret(a + text.length);
  }
  function font(key: FontKey) {
    if (key === 'normal') return;
    const [a, b] = sel();
    if (a === b) onChange(applyFont(value, key));
    else onChange(value.slice(0, a) + applyFont(value.slice(a, b), key) + value.slice(b));
  }

  const btn =
    'rounded-md border border-line px-2 py-1 text-xs transition hover:border-accent hover:bg-elevated';

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" className={btn} onClick={() => wrap('**')} title="Pogrubienie">
          <Bold size={13} />
        </button>
        <button type="button" className={btn} onClick={() => wrap('*')} title="Kursywa">
          <Italic size={13} />
        </button>
        <button type="button" className={btn} onClick={() => wrap('__')} title="Podkreślenie">
          <Underline size={13} />
        </button>
        <button type="button" className={btn} onClick={() => wrap('~~')} title="Przekreślenie">
          <Strikethrough size={13} />
        </button>
        <button type="button" className={btn} onClick={() => wrap('`')} title="Kod">
          <Code size={13} />
        </button>
        <button type="button" className={btn} onClick={() => wrap('||')} title="Spoiler">
          ||
        </button>
        <select
          onChange={(e) => {
            font(e.target.value as FontKey);
            e.target.selectedIndex = 0;
          }}
          className="rounded-md border border-line bg-elevated px-2 py-1 text-xs outline-none focus:border-accent"
          title="Czcionka Unicode (smallcaps i inne)"
          defaultValue="normal"
        >
          <option value="normal">Aa…</option>
          {FONTS.filter((f) => f.key !== 'normal').map((f) => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </select>
        <button type="button" className={btn} onClick={() => setShowEmoji((v) => !v)} title="Emoji">
          <Smile size={13} />
        </button>
      </div>

      {showEmoji && (
        <div className="space-y-2 rounded-md border border-line bg-elevated p-2">
          <div className="flex flex-wrap gap-1">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  insert(e);
                  setShowEmoji(false);
                }}
                className="rounded p-1 text-lg transition hover:bg-card"
              >
                {e}
              </button>
            ))}
          </div>
          {emojis.length > 0 && (
            <div className="space-y-1 border-t border-line pt-2">
              <p className="text-[10px] uppercase tracking-wide text-muted">Emoji serwera</p>
              <div className="flex flex-wrap gap-1">
                {emojis.slice(0, 60).map((em) => (
                  <button
                    key={em.id}
                    type="button"
                    title={`:${em.name}:`}
                    onClick={() => {
                      insert(`<${em.animated ? 'a' : ''}:${em.name}:${em.id}>`);
                      setShowEmoji(false);
                    }}
                    className="rounded p-1 transition hover:bg-card"
                  >
                    <img
                      src={`https://cdn.discordapp.com/emojis/${em.id}.${em.animated ? 'gif' : 'png'}`}
                      alt={em.name}
                      className="h-5 w-5"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {variables.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {variables.map((v) => (
            <button
              key={v.token}
              type="button"
              onClick={() => insert(v.token)}
              className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted transition hover:border-accent hover:text-accent"
              title={v.label}
            >
              {v.token}
            </button>
          ))}
        </div>
      )}

      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent"
      />
      {limit !== undefined && (
        <div className="flex justify-end">
          <Counter len={value.length} limit={limit} />
        </div>
      )}
    </div>
  );
}

// Panel „Wyślij testowo" — lazy-load kanałów z /api/guild, wysyłka bieżącego RichMessage na wybrany
// kanał. Uniwersalny: działa wszędzie, gdzie używany jest Message Studio (bez przepinania propsów).
function StudioTest({ message }: { message: RichMessage }) {
  const [open, setOpen] = useState(false);
  const [channels, setChannels] = useState<GuildChannel[] | null>(null);
  const [channelId, setChannelId] = useState('');
  const [st, setSt] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [err, setErr] = useState('');

  async function expand() {
    const next = !open;
    setOpen(next);
    if (next && channels === null) {
      try {
        const g = (await fetch('/api/guild').then((r) => r.json())) as {
          channels?: GuildChannel[];
        };
        setChannels((g.channels ?? []).filter((c) => c.type === 0 || c.type === 5));
      } catch {
        setChannels([]);
      }
    }
  }

  async function send() {
    if (!channelId) {
      setErr('Wybierz kanał.');
      setSt('err');
      return;
    }
    setSt('sending');
    setErr('');
    try {
      const r = await fetch('/api/studio/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, message }),
      });
      const j = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || !j.ok) {
        setErr(j.error || 'Błąd wysyłki');
        setSt('err');
      } else setSt('ok');
    } catch {
      setErr('Błąd sieci');
      setSt('err');
    }
    setTimeout(() => setSt('idle'), 3000);
  }

  return (
    <div className="rounded-xl border border-line bg-bg/40 p-3">
      <button
        type="button"
        onClick={expand}
        className="flex items-center gap-2 text-sm font-semibold text-white/90"
      >
        <Send size={14} className="text-accent" /> Wyślij testowo {open ? '▾' : '▸'}
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {channels === null ? (
            <p className="text-xs text-muted">Ładowanie kanałów…</p>
          ) : channels.length === 0 ? (
            <p className="text-xs text-muted">Brak dostępnych kanałów (sprawdź token bota).</p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-[220px]">
                <ChannelSelect value={channelId} onChange={setChannelId} channels={channels} />
              </div>
              <button
                type="button"
                onClick={send}
                disabled={st === 'sending'}
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold transition hover:bg-accent-hover disabled:opacity-50"
              >
                {st === 'sending' ? 'Wysyłanie…' : 'Wyślij'}
              </button>
              {st === 'ok' && <span className="text-sm text-green-400">✓ Wysłano</span>}
              {st === 'err' && <span className="text-sm text-accent">{err}</span>}
            </div>
          )}
          <p className="text-[11px] text-muted">
            Zmienne (np. {'{user}'}) podstawiamy przykładowymi wartościami; pingi wyłączone.
          </p>
        </div>
      )}
    </div>
  );
}

// Edytor bloków Components V2 (Etap I): tekst / separator / galeria / sekcja z miniaturą,
// z przestawianiem i licznikami limitów Discorda.
function V2Editor({
  v2,
  onChange,
  variables,
  emojis,
}: {
  v2: V2Spec;
  onChange: (v: V2Spec) => void;
  variables: EditorVar[];
  emojis: GuildEmoji[];
}) {
  const keys = useRef<number[]>(v2.blocks.map((_, i) => i + 1));
  const idc = useRef(v2.blocks.length + 1);
  if (keys.current.length !== v2.blocks.length) {
    keys.current = v2.blocks.map((_, i) => i + 1);
    idc.current = v2.blocks.length + 1;
  }

  function add(block: V2Block) {
    if (v2.blocks.length >= LIMITS_V2.blocks) return;
    keys.current.push(idc.current);
    idc.current += 1;
    onChange({ ...v2, blocks: [...v2.blocks, block] });
  }
  function set(i: number, patch: Partial<V2Block>) {
    onChange({
      ...v2,
      blocks: v2.blocks.map((b, idx) => (idx === i ? ({ ...b, ...patch } as V2Block) : b)),
    });
  }
  function remove(i: number) {
    keys.current.splice(i, 1);
    onChange({ ...v2, blocks: v2.blocks.filter((_, idx) => idx !== i) });
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= v2.blocks.length) return;
    const blocks = [...v2.blocks];
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    [keys.current[i], keys.current[j]] = [keys.current[j], keys.current[i]];
    onChange({ ...v2, blocks });
  }

  const inp =
    'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
  const addBtn =
    'rounded-md border border-line px-2.5 py-1.5 text-xs transition hover:border-accent hover:bg-elevated';
  const KIND_LABEL: Record<V2Block['kind'], string> = {
    text: '📝 Tekst',
    separator: '➖ Separator',
    gallery: '🖼️ Galeria',
    section: '🧱 Sekcja + miniatura',
  };
  const total = v2TextTotal(v2);

  return (
    <div className="space-y-3">
      <ColorField
        value={v2.accentColor}
        onChange={(accentColor) => onChange({ ...v2, accentColor })}
        label="Kolor akcentu (kontener — puste = bez ramki)"
      />

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted">
          Dodaj blok ({v2.blocks.length}/{LIMITS_V2.blocks}):
        </span>
        <button type="button" className={addBtn} onClick={() => add({ kind: 'text', text: '' })}>
          📝 Tekst
        </button>
        <button
          type="button"
          className={addBtn}
          onClick={() => add({ kind: 'separator', divider: true, large: false })}
        >
          ➖ Separator
        </button>
        <button type="button" className={addBtn} onClick={() => add({ kind: 'gallery', urls: [] })}>
          🖼️ Galeria
        </button>
        <button
          type="button"
          className={addBtn}
          onClick={() => add({ kind: 'section', text: '', thumbnailUrl: '' })}
        >
          🧱 Sekcja + miniatura
        </button>
        <span className="ms-auto">
          <Counter len={total} limit={LIMITS_V2.textTotal} />
        </span>
      </div>

      {v2.blocks.length === 0 && (
        <p className="text-xs text-muted">Brak bloków — dodaj pierwszy przyciskami wyżej.</p>
      )}

      {v2.blocks.map((b, i) => (
        <div
          key={keys.current[i]}
          className="space-y-2 rounded-md border border-line bg-elevated/40 p-2"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-white/80">{KIND_LABEL[b.kind]}</span>
            <div className="ms-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="rounded-md border border-line p-1 text-muted transition hover:border-accent disabled:opacity-30"
                title="W górę"
              >
                <ArrowUp size={13} />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === v2.blocks.length - 1}
                className="rounded-md border border-line p-1 text-muted transition hover:border-accent disabled:opacity-30"
                title="W dół"
              >
                <ArrowDown size={13} />
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded-md border border-line p-1 text-muted transition hover:border-accent hover:text-accent"
                title="Usuń blok"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {b.kind === 'text' && (
            <RichTextArea
              value={b.text}
              onChange={(text) => set(i, { text })}
              variables={variables}
              emojis={emojis}
              rows={3}
              placeholder="Treść bloku (markdown Discorda)…"
            />
          )}
          {b.kind === 'separator' && (
            <div className="flex flex-wrap gap-4 text-xs text-muted">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={b.divider}
                  onChange={(e) => set(i, { divider: e.target.checked })}
                  className="h-3.5 w-3.5 accent-accent"
                />
                Widoczna linia
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={b.large}
                  onChange={(e) => set(i, { large: e.target.checked })}
                  className="h-3.5 w-3.5 accent-accent"
                />
                Większy odstęp
              </label>
            </div>
          )}
          {b.kind === 'gallery' && (
            <div className="space-y-1">
              <textarea
                value={b.urls.join('\n')}
                onChange={(e) =>
                  set(i, { urls: e.target.value.split('\n').slice(0, LIMITS_V2.galleryUrls) })
                }
                rows={3}
                placeholder={'https://obrazek1.png\nhttps://obrazek2.png (1 URL na linię, max 10)'}
                className={inp}
              />
              <p className="text-[10px] text-muted">
                {b.urls.filter((u) => u.trim()).length}/{LIMITS_V2.galleryUrls} obrazków
              </p>
            </div>
          )}
          {b.kind === 'section' && (
            <div className="space-y-2">
              <RichTextArea
                value={b.text}
                onChange={(text) => set(i, { text })}
                variables={variables}
                emojis={emojis}
                rows={2}
                placeholder="Tekst sekcji…"
              />
              <input
                value={b.thumbnailUrl}
                onChange={(e) => set(i, { thumbnailUrl: e.target.value })}
                className={inp}
                placeholder="Miniatura po prawej (URL, opcjonalna)"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function MessageStudio({
  value,
  onChange,
  variables = [],
  emojis = [],
  allowV2 = false,
}: {
  value: RichMessage;
  onChange: (v: RichMessage) => void;
  variables?: EditorVar[];
  emojis?: GuildEmoji[];
  allowV2?: boolean;
}) {
  const embed = value.embed;
  const setEmbed = (patch: Partial<RichEmbed>) =>
    onChange({ ...value, embed: { ...embed, ...patch } });

  // Stabilne klucze pól (biome: noArrayIndexKey). Reconcile przy zmianie liczby (np. wczytanie szablonu).
  const fieldKeys = useRef<number[]>(embed.fields.map((_, i) => i + 1));
  const idc = useRef(embed.fields.length + 1);
  if (fieldKeys.current.length !== embed.fields.length) {
    fieldKeys.current = embed.fields.map((_, i) => i + 1);
    idc.current = embed.fields.length + 1;
  }

  function addField() {
    if (embed.fields.length >= LIMITS.fields) return;
    fieldKeys.current.push(idc.current);
    idc.current += 1;
    setEmbed({ fields: [...embed.fields, { name: '', value: '', inline: false }] });
  }
  function setField(i: number, patch: Partial<RichField>) {
    setEmbed({ fields: embed.fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) });
  }
  function removeField(i: number) {
    fieldKeys.current.splice(i, 1);
    setEmbed({ fields: embed.fields.filter((_, idx) => idx !== i) });
  }

  // Szablony — współdzielone (settings 'studio_templates'); localStorage jako cache/fallback offline.
  const [tplName, setTplName] = useState('');
  const [tpls, setTpls] = useState<{ name: string; msg: RichMessage }[]>([]);
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('msgStudioTemplates') || '[]');
      if (Array.isArray(cached) && cached.length) setTpls(cached);
    } catch {
      /* brak / uszkodzone */
    }
    fetch('/api/studio/templates')
      .then((r) => r.json())
      .then((j: { templates?: { name: string; msg: RichMessage }[] }) => {
        if (Array.isArray(j.templates)) {
          setTpls(j.templates);
          try {
            localStorage.setItem('msgStudioTemplates', JSON.stringify(j.templates));
          } catch {
            /* quota */
          }
        }
      })
      .catch(() => {
        /* offline — zostaje cache */
      });
  }, []);
  function persistTpls(next: { name: string; msg: RichMessage }[]) {
    setTpls(next);
    try {
      localStorage.setItem('msgStudioTemplates', JSON.stringify(next));
    } catch {
      /* quota / brak dostępu */
    }
    void fetch('/api/studio/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templates: next }),
    }).catch(() => {
      /* offline — zapis tylko lokalny */
    });
  }
  function saveTpl() {
    const name = tplName.trim();
    if (!name) return;
    persistTpls([...tpls.filter((t) => t.name !== name), { name, msg: value }]);
    setTplName('');
  }

  const showEmbed = value.useEmbed && embedHasContent(embed);
  const inp =
    'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';
  const total = embedTotal(embed);
  const isV2 = allowV2 && !!value.useV2;
  const v2 = value.v2 ?? EMPTY_V2;

  return (
    <div className="space-y-4">
      {/* Components V2 (Etap I) — tryb blokowy zamiast treść+embed */}
      {allowV2 && (
        <div className="space-y-3 rounded-xl border border-line bg-bg/40 p-4">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={!!value.useV2}
              onChange={(e) =>
                onChange({ ...value, useV2: e.target.checked, v2: value.v2 ?? { ...EMPTY_V2 } })
              }
              className="h-4 w-4 accent-accent"
            />
            <span className="font-semibold text-white/90">
              🧬 Components V2 <span className="text-xs text-muted">(nowy format Discorda)</span>
            </span>
          </label>
          {isV2 && (
            <>
              <p className="text-xs text-muted">
                Wiadomość składa się z bloków (tekst, separatory, galerie do 10 obrazków, sekcje z
                miniaturą) — zwykła treść i embed są w tym trybie pomijane.
              </p>
              <V2Editor
                v2={v2}
                onChange={(next) => onChange({ ...value, v2: next })}
                variables={variables}
                emojis={emojis}
              />
            </>
          )}
        </div>
      )}

      {/* Treść nad embedem */}
      {!isV2 && (
        <div className="space-y-1 text-sm">
          <span className="font-semibold text-white/90">Treść wiadomości</span>
          <RichTextArea
            value={value.content}
            onChange={(content) => onChange({ ...value, content })}
            variables={variables}
            emojis={emojis}
            placeholder="Tekst nad embedem (opcjonalny)…"
            limit={LIMITS.content}
          />
        </div>
      )}

      {/* Embed */}
      {!isV2 && (
        <div className="space-y-3 rounded-xl border border-line bg-bg/40 p-4">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={value.useEmbed}
              onChange={(e) => onChange({ ...value, useEmbed: e.target.checked })}
              className="h-4 w-4 accent-accent"
            />
            <span className="font-semibold text-white/90">Dołącz embed</span>
            <span className="ms-auto">
              <Counter len={total} limit={LIMITS.embedTotal} />
            </span>
          </label>

          {value.useEmbed && (
            <div className="space-y-3">
              <ColorField
                value={embed.color}
                onChange={(color) => setEmbed({ color })}
                label="Kolor"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="text-muted">Autor (nazwa)</span>
                  <input
                    value={embed.authorName}
                    onChange={(e) => setEmbed({ authorName: e.target.value })}
                    className={inp}
                    maxLength={LIMITS.author}
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted">Autor — ikona (URL)</span>
                  <input
                    value={embed.authorIcon}
                    onChange={(e) => setEmbed({ authorIcon: e.target.value })}
                    className={inp}
                    placeholder="https://…"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="text-muted">Tytuł</span>
                  <input
                    value={embed.title}
                    onChange={(e) => setEmbed({ title: e.target.value })}
                    className={inp}
                    maxLength={LIMITS.title}
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted">Tytuł — link (URL)</span>
                  <input
                    value={embed.url}
                    onChange={(e) => setEmbed({ url: e.target.value })}
                    className={inp}
                    placeholder="https://…"
                  />
                </label>
              </div>

              <div className="space-y-1 text-sm">
                <span className="text-muted">Opis</span>
                <RichTextArea
                  value={embed.description}
                  onChange={(description) => setEmbed({ description })}
                  variables={variables}
                  emojis={emojis}
                  rows={4}
                  limit={LIMITS.description}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="text-muted">Duży obraz (URL)</span>
                  <input
                    value={embed.imageUrl}
                    onChange={(e) => setEmbed({ imageUrl: e.target.value })}
                    className={inp}
                    placeholder="https://…"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted">Miniatura (URL)</span>
                  <input
                    value={embed.thumbnailUrl}
                    onChange={(e) => setEmbed({ thumbnailUrl: e.target.value })}
                    className={inp}
                    placeholder="https://…"
                  />
                </label>
              </div>

              {/* Pola */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">
                    Pola ({embed.fields.length}/{LIMITS.fields})
                  </span>
                  <button
                    type="button"
                    onClick={addField}
                    className="flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs transition hover:border-accent hover:bg-elevated"
                  >
                    <Plus size={13} /> Dodaj pole
                  </button>
                </div>
                {embed.fields.map((f, i) => (
                  <div
                    key={fieldKeys.current[i]}
                    className="space-y-2 rounded-md border border-line bg-elevated/40 p-2"
                  >
                    <div className="flex gap-2">
                      <input
                        value={f.name}
                        onChange={(e) => setField(i, { name: e.target.value })}
                        placeholder="Nazwa pola"
                        className={inp}
                        maxLength={LIMITS.fieldName}
                      />
                      <button
                        type="button"
                        onClick={() => removeField(i)}
                        className="rounded-md border border-line px-2 text-muted transition hover:border-accent hover:text-accent"
                        title="Usuń pole"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <textarea
                      value={f.value}
                      onChange={(e) => setField(i, { value: e.target.value })}
                      placeholder="Treść pola"
                      rows={2}
                      className={inp}
                      maxLength={LIMITS.fieldValue}
                    />
                    <label className="flex items-center gap-2 text-xs text-muted">
                      <input
                        type="checkbox"
                        checked={f.inline}
                        onChange={(e) => setField(i, { inline: e.target.checked })}
                        className="h-3.5 w-3.5 accent-accent"
                      />
                      W jednej linii (inline)
                    </label>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="text-muted">Stopka (tekst)</span>
                  <input
                    value={embed.footerText}
                    onChange={(e) => setEmbed({ footerText: e.target.value })}
                    className={inp}
                    maxLength={LIMITS.footer}
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted">Stopka — ikona (URL)</span>
                  <input
                    value={embed.footerIcon}
                    onChange={(e) => setEmbed({ footerIcon: e.target.value })}
                    className={inp}
                    placeholder="https://…"
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={embed.timestamp}
                  onChange={(e) => setEmbed({ timestamp: e.target.checked })}
                  className="h-4 w-4 accent-accent"
                />
                Znacznik czasu (timestamp)
              </label>
            </div>
          )}
        </div>
      )}

      {/* Szablony */}
      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-line bg-bg/40 p-3">
        <label className="space-y-1 text-sm">
          <span className="text-xs text-muted">Zapisz jako szablon</span>
          <input
            value={tplName}
            onChange={(e) => setTplName(e.target.value)}
            placeholder="nazwa szablonu"
            className="rounded-md border border-line bg-elevated px-3 py-1.5 text-sm outline-none focus:border-accent"
          />
        </label>
        <button
          type="button"
          onClick={saveTpl}
          className="rounded-md border border-line px-3 py-1.5 text-sm transition hover:border-accent hover:bg-elevated"
        >
          Zapisz szablon
        </button>
        {tpls.length > 0 && (
          <select
            onChange={(e) => {
              const t = tpls.find((x) => x.name === e.target.value);
              if (t) onChange(t.msg);
              e.target.selectedIndex = 0;
            }}
            defaultValue=""
            className="rounded-md border border-line bg-elevated px-2 py-1.5 text-sm outline-none focus:border-accent"
          >
            <option value="">Wczytaj szablon…</option>
            {tpls.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        )}
        {tpls.length > 0 && (
          <button
            type="button"
            onClick={() => persistTpls([])}
            className="rounded-md border border-line px-3 py-1.5 text-xs text-muted transition hover:border-accent hover:text-accent"
            title="Usuń wszystkie szablony"
          >
            Wyczyść szablony
          </button>
        )}
      </div>

      {/* Wyślij testowo */}
      <StudioTest message={value} />

      {/* Podgląd 1:1 jak Discord */}
      <div className="rounded-xl border border-line bg-[#313338] p-4">
        <p className="mb-2 text-[10px] uppercase tracking-wide text-white/60">Podgląd</p>
        {isV2 && (
          <div
            className={`max-w-lg space-y-2 ${v2.accentColor ? 'rounded border-s-4 bg-[#2b2d31] p-3' : ''}`}
            style={v2.accentColor ? { borderLeftColor: v2.accentColor } : undefined}
          >
            {v2.blocks.length === 0 && <p className="text-sm text-white/60">— dodaj bloki —</p>}
            {v2.blocks.map((b, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: bloki nie mają ID — kolejność jest tożsamością (podgląd tylko czyta)
              <div key={`${b.kind}-${i}`}>
                {b.kind === 'text' && b.text.trim() && (
                  <div
                    className="whitespace-pre-wrap break-words text-sm text-[#dbdee1]"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(b.text, variables) }}
                  />
                )}
                {b.kind === 'separator' && (
                  <hr
                    className={`${b.large ? 'my-3' : 'my-1.5'} ${b.divider ? 'border-white/20' : 'border-transparent'}`}
                  />
                )}
                {b.kind === 'gallery' && b.urls.some((u) => u.trim()) && (
                  <div className="grid max-w-md grid-cols-3 gap-1">
                    {b.urls
                      .map((u) => u.trim())
                      .filter(Boolean)
                      .map((u) => (
                        <img key={u} src={u} alt="" className="h-20 w-full rounded object-cover" />
                      ))}
                  </div>
                )}
                {b.kind === 'section' && b.text.trim() && (
                  <div className="flex items-start gap-3">
                    <div
                      className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm text-[#dbdee1]"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(b.text, variables) }}
                    />
                    {b.thumbnailUrl.trim() && (
                      <img src={b.thumbnailUrl} alt="" className="h-14 w-14 rounded object-cover" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {!isV2 && value.content.trim() && (
          <div
            className="mb-2 whitespace-pre-wrap break-words text-sm text-[#dbdee1]"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value.content, variables) }}
          />
        )}
        {!isV2 && showEmbed ? (
          <div
            className="max-w-lg rounded border-s-4 bg-[#2b2d31] p-3"
            style={{ borderLeftColor: embed.color || '#E50914' }}
          >
            <div className="flex gap-3">
              <div className="min-w-0 flex-1">
                {embed.authorName && (
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-white">
                    {embed.authorIcon && (
                      <img src={embed.authorIcon} alt="" className="h-5 w-5 rounded-full" />
                    )}
                    {embed.authorName}
                  </div>
                )}
                {embed.title && (
                  <div className="mb-1 text-sm font-semibold text-[#00a8fc]">{embed.title}</div>
                )}
                {embed.description && (
                  <div
                    className="whitespace-pre-wrap break-words text-sm text-[#dbdee1]"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(embed.description, variables),
                    }}
                  />
                )}
                {embed.fields.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {embed.fields.map((f, i) => (
                      <div
                        key={fieldKeys.current[i]}
                        className={f.inline ? 'col-span-1' : 'col-span-3'}
                      >
                        {f.name && <div className="text-xs font-semibold text-white">{f.name}</div>}
                        {f.value && (
                          <div
                            className="break-words text-xs text-[#dbdee1]"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(f.value, variables) }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {embed.imageUrl && (
                  <img src={embed.imageUrl} alt="" className="mt-2 max-h-60 rounded" />
                )}
                {(embed.footerText || embed.timestamp) && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/50">
                    {embed.footerIcon && (
                      <img src={embed.footerIcon} alt="" className="h-4 w-4 rounded-full" />
                    )}
                    {embed.footerText}
                    {embed.timestamp && <span>• teraz</span>}
                  </div>
                )}
              </div>
              {embed.thumbnailUrl && (
                <img src={embed.thumbnailUrl} alt="" className="h-16 w-16 rounded object-cover" />
              )}
            </div>
          </div>
        ) : (
          !isV2 && !value.content.trim() && <p className="text-sm text-white/60">— pusto —</p>
        )}
      </div>
    </div>
  );
}
