'use client';

// Faza 8 — Message Studio: uniwersalny edytor treści + embed dla wszystkich modułów.
// Wynik to RichMessage (JSON), bot renderuje przez bot/src/lib/richMessage.mts.
// Live-preview ~jak Discord, liczniki znaków wg limitów, smallcaps/fonty Unicode,
// emoji standardowe + customowe z serwera, zmienne, szablony (localStorage).
import { Bold, Code, Italic, Plus, Smile, Strikethrough, Trash2, Underline } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { GuildEmoji } from '../lib/guild';
import {
  embedHasContent,
  embedTotal,
  LIMITS,
  type RichEmbed,
  type RichField,
  type RichMessage,
} from '../lib/richMessage';
import { applyFont, FONTS, type FontKey } from '../lib/unicodeFonts';
import ColorField from './ColorField';
import type { EditorVar } from './MessageEditor';

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

export default function MessageStudio({
  value,
  onChange,
  variables = [],
  emojis = [],
}: {
  value: RichMessage;
  onChange: (v: RichMessage) => void;
  variables?: EditorVar[];
  emojis?: GuildEmoji[];
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

  // Szablony (localStorage — write once, reuse).
  const [tplName, setTplName] = useState('');
  const [tpls, setTpls] = useState<{ name: string; msg: RichMessage }[]>([]);
  useEffect(() => {
    try {
      setTpls(JSON.parse(localStorage.getItem('msgStudioTemplates') || '[]'));
    } catch {
      /* brak / uszkodzone */
    }
  }, []);
  function persistTpls(next: { name: string; msg: RichMessage }[]) {
    setTpls(next);
    try {
      localStorage.setItem('msgStudioTemplates', JSON.stringify(next));
    } catch {
      /* quota / brak dostępu */
    }
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

  return (
    <div className="space-y-4">
      {/* Treść nad embedem */}
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

      {/* Embed */}
      <div className="space-y-3 rounded-xl border border-line bg-bg/40 p-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={value.useEmbed}
            onChange={(e) => onChange({ ...value, useEmbed: e.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-semibold text-white/90">Dołącz embed</span>
          <span className="ml-auto">
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

      {/* Podgląd 1:1 jak Discord */}
      <div className="rounded-xl border border-line bg-[#313338] p-4">
        <p className="mb-2 text-[10px] uppercase tracking-wide text-white/40">Podgląd</p>
        {value.content.trim() && (
          <div
            className="mb-2 whitespace-pre-wrap break-words text-sm text-[#dbdee1]"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value.content, variables) }}
          />
        )}
        {showEmbed ? (
          <div
            className="max-w-lg rounded border-l-4 bg-[#2b2d31] p-3"
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
          !value.content.trim() && <p className="text-sm text-white/40">— pusto —</p>
        )}
      </div>
    </div>
  );
}
