'use client';

// Faza 7 / F1 — pełny edytor wiadomości: markdown (Discord), emoji, „czcionki" Unicode, zmienne,
// live-preview. Wynik to gotowy string (znaki Unicode + markdown) — bot wysyła go bez zmian.
import { Bold, Code, Italic, Smile, Strikethrough, Underline } from 'lucide-react';
import { useRef, useState } from 'react';
import { applyFont, FONTS, type FontKey } from '../lib/unicodeFonts';

export type EditorVar = { token: string; label: string; sample: string };

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
];

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Bardzo lekki render markdown Discorda → HTML (tylko podgląd).
function renderPreview(raw: string, vars: EditorVar[]): string {
  let s = raw;
  for (const v of vars) s = s.split(v.token).join(v.sample);
  s = escapeHtml(s);
  s = s.replace(/```([\s\S]+?)```/g, '<code class="block">$1</code>');
  s = s.replace(/`([^`]+?)`/g, '<code>$1</code>');
  s = s.replace(/\|\|([\s\S]+?)\|\|/g, '<span class="rounded bg-white/20 px-1">$1</span>');
  s = s.replace(/\*\*\*([\s\S]+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  s = s.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__([\s\S]+?)__/g, '<u>$1</u>');
  s = s.replace(/~~([\s\S]+?)~~/g, '<del>$1</del>');
  s = s.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
  s = s.replace(/_([^_\n]+?)_/g, '<em>$1</em>');
  s = s.replace(/^### (.*)$/gm, '<span class="text-sm font-bold">$1</span>');
  s = s.replace(/^## (.*)$/gm, '<span class="text-base font-bold">$1</span>');
  s = s.replace(/^# (.*)$/gm, '<span class="text-lg font-bold">$1</span>');
  s = s.replace(/^&gt; (.*)$/gm, '<span class="border-s-2 border-line ps-2 text-muted">$1</span>');
  return s.replace(/\n/g, '<br/>');
}

export default function MessageEditor({
  value,
  onChange,
  variables = [],
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  variables?: EditorVar[];
  rows?: number;
  placeholder?: string;
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
    const next = value.slice(0, a) + prefix + mid + suffix + value.slice(b);
    onChange(next);
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
    if (a === b) {
      onChange(applyFont(value, key));
    } else {
      onChange(value.slice(0, a) + applyFont(value.slice(a, b), key) + value.slice(b));
    }
  }

  const btn =
    'rounded-md border border-line px-2 py-1 text-sm transition hover:bg-elevated hover:border-accent';

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" className={btn} onClick={() => wrap('**')} title="Pogrubienie">
          <Bold size={14} />
        </button>
        <button type="button" className={btn} onClick={() => wrap('*')} title="Kursywa">
          <Italic size={14} />
        </button>
        <button type="button" className={btn} onClick={() => wrap('__')} title="Podkreślenie">
          <Underline size={14} />
        </button>
        <button type="button" className={btn} onClick={() => wrap('~~')} title="Przekreślenie">
          <Strikethrough size={14} />
        </button>
        <button type="button" className={btn} onClick={() => wrap('`')} title="Kod">
          <Code size={14} />
        </button>
        <button type="button" className={btn} onClick={() => wrap('||')} title="Spoiler">
          ||
        </button>
        <select
          onChange={(e) => {
            font(e.target.value as FontKey);
            e.target.selectedIndex = 0;
          }}
          className="rounded-md border border-line bg-elevated px-2 py-1 text-sm outline-none focus:border-accent"
          title="Czcionka Unicode (zaznacz tekst lub zastosuj do całości)"
          defaultValue="normal"
        >
          <option value="normal">Czcionka…</option>
          {FONTS.filter((f) => f.key !== 'normal').map((f) => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </select>
        <button type="button" className={btn} onClick={() => setShowEmoji((v) => !v)} title="Emoji">
          <Smile size={14} />
        </button>
      </div>

      {showEmoji && (
        <div className="flex flex-wrap gap-1 rounded-md border border-line bg-elevated p-2">
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

      <div className="rounded-md border border-line bg-bg/40 p-3">
        <p className="mb-1 text-[10px] uppercase tracking-wide text-muted">Podgląd</p>
        {value.trim() ? (
          <div
            className="whitespace-pre-wrap break-words text-sm text-white/90"
            dangerouslySetInnerHTML={{ __html: renderPreview(value, variables) }}
          />
        ) : (
          <p className="text-sm text-muted">— pusto —</p>
        )}
      </div>
    </div>
  );
}
