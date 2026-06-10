'use client';

// Etap I — sekcja „Discord AutoMod (natywny)": lista reguł serwera + kreatory szablonów
// jednym kliknięciem. Reguły egzekwuje sam Discord (działają nawet gdy bot offline).
import { useState } from 'react';
import type { NativeRule } from '../lib/discordAutomod';
import type { GuildMeta } from '../lib/guild';
import Hint from './Hint';
import { ChannelSelect } from './pickers';

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

const TRIGGER_LABEL: Record<number, string> = {
  1: '📝 Słowa-klucze',
  3: '🌊 Anty-spam',
  4: '🤬 Presety Discorda',
  5: '📣 Limit wzmianek',
  6: '👤 Profil członka',
};

function ruleDetail(r: NativeRule): string {
  if (r.triggerType === 1) return `${r.keywords.length} słów/fraz`;
  if (r.triggerType === 4) return 'wulgaryzmy · 18+ · obelgi';
  if (r.triggerType === 5) return `max ${r.mentionLimit ?? '?'} wzmianek`;
  return '';
}

function actionBadges(r: NativeRule): string[] {
  return r.actions.map((a) => {
    if (a.type === 1) return '🚫 blokada';
    if (a.type === 2) return '🔔 alert';
    if (a.type === 3) return `⏳ timeout ${Math.round((a.durationSec ?? 0) / 60)} min`;
    return `akcja ${a.type}`;
  });
}

export default function NativeAutomodForm({
  initial,
  guild,
}: {
  initial: NativeRule[] | null;
  guild: GuildMeta;
}) {
  const [rules, setRules] = useState<NativeRule[]>(initial ?? []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [kwName, setKwName] = useState('');
  const [kwWords, setKwWords] = useState('');
  const [kwAlert, setKwAlert] = useState('');
  const [mentionLimit, setMentionLimit] = useState(8);

  if (initial === null) {
    return (
      <p className="text-sm text-muted">
        🔌 Nie udało się pobrać reguł AutoModa — sprawdź, czy bot ma uprawnienie{' '}
        <strong>Zarządzanie serwerem</strong> i czy panel ma <code>DISCORD_BOT_TOKEN</code>.
      </p>
    );
  }

  async function call(body: Record<string, unknown>): Promise<void> {
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/automod-native', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = (await r.json()) as { ok: boolean; error?: string };
      if (!j.ok) {
        setErr(j.error || 'Nieznany błąd.');
      } else {
        const fresh = await fetch('/api/automod-native');
        const fj = (await fresh.json()) as { ok: boolean; rules: NativeRule[] };
        if (fj.ok) setRules(fj.rules);
      }
    } catch {
      setErr('Błąd połączenia z API panelu.');
    }
    setBusy(false);
  }

  const has = (t: number) => rules.some((r) => r.triggerType === t);
  const keywordCount = rules.filter((r) => r.triggerType === 1).length;

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        Te reguły egzekwuje <strong>sam Discord</strong> — zadziałają nawet, gdy bot będzie offline.
        Uzupełniają automod bota (wyżej): tu blokada następuje <em>zanim</em> wiadomość w ogóle się
        pojawi.
      </p>

      {rules.length === 0 ? (
        <p className="text-sm text-muted">Brak reguł natywnego AutoModa — dodaj szablon niżej.</p>
      ) : (
        <ul className="space-y-2">
          {rules.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-bg/40 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white/90">{r.name}</p>
                <p className="text-xs text-muted">
                  {TRIGGER_LABEL[r.triggerType] ?? `typ ${r.triggerType}`}
                  {ruleDetail(r) && <> · {ruleDetail(r)}</>}
                  {actionBadges(r).length > 0 && <> · {actionBadges(r).join(' · ')}</>}
                </p>
              </div>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-semibold ${r.enabled ? 'bg-green-500/15 text-green-300' : 'bg-line text-muted'}`}
              >
                {r.enabled ? 'AKTYWNA' : 'WYŁĄCZONA'}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => call({ action: 'toggle', id: r.id, enabled: !r.enabled })}
                className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold transition hover:border-accent disabled:opacity-50"
              >
                {r.enabled ? 'Wyłącz' : 'Włącz'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => call({ action: 'delete', id: r.id })}
                className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-accent transition hover:border-accent disabled:opacity-50"
              >
                Usuń
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-xl border border-line bg-bg/40 p-4 space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Szybkie szablony
          <Hint text="Discord limituje: 1× presety, 1× anty-spam, 1× limit wzmianek, do 6× własne słowa." />
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || has(4)}
            onClick={() => call({ action: 'create-preset' })}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold transition hover:bg-accent-hover disabled:opacity-40"
          >
            🤬 Filtr wulgaryzmów (presety Discorda)
          </button>
          <button
            type="button"
            disabled={busy || has(3)}
            onClick={() => call({ action: 'create-spam' })}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold transition hover:bg-accent-hover disabled:opacity-40"
          >
            🌊 Anty-spam treści
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={busy || has(5)}
              onClick={() => call({ action: 'create-mention', limit: mentionLimit })}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold transition hover:bg-accent-hover disabled:opacity-40"
            >
              📣 Limit wzmianek + timeout 10 min
            </button>
            <input
              type="number"
              min={1}
              max={50}
              value={mentionLimit}
              onChange={(e) =>
                setMentionLimit(Math.min(50, Math.max(1, Math.floor(Number(e.target.value) || 8))))
              }
              className={`${inputCls} w-20`}
              title="Maksymalna liczba wzmianek w jednej wiadomości"
            />
          </div>
        </div>

        <div className="space-y-3 border-t border-line pt-4">
          <p className="text-sm font-semibold text-white/90">
            📝 Własna lista słów ({keywordCount}/6)
            <Hint text="Słowa/frazy po przecinku; gwiazdka = dowolny ciąg, np. *kasyno*. Wiadomość z trafieniem zostanie zablokowana zanim się pojawi." />
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={kwName}
              onChange={(e) => setKwName(e.target.value)}
              className={inputCls}
              placeholder="Nazwa reguły, np. Zakazane frazy"
              maxLength={100}
            />
            <ChannelSelect
              value={kwAlert}
              onChange={setKwAlert}
              channels={guild.channels}
              placeholder="Kanał alertów (opcjonalnie)"
            />
          </div>
          <textarea
            value={kwWords}
            onChange={(e) => setKwWords(e.target.value)}
            className={`${inputCls} min-h-20`}
            placeholder="słowo1, *fraza z gwiazdką*, słowo2"
          />
          <button
            type="button"
            disabled={busy || keywordCount >= 6 || !kwName.trim() || !kwWords.trim()}
            onClick={() => {
              const keywords = kwWords
                .split(',')
                .map((w) => w.trim())
                .filter(Boolean)
                .slice(0, 50);
              void call({
                action: 'create-keyword',
                name: kwName.trim(),
                keywords,
                ...(kwAlert ? { alertChannelId: kwAlert } : {}),
              }).then(() => {
                setKwName('');
                setKwWords('');
              });
            }}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold transition hover:bg-accent-hover disabled:opacity-40"
          >
            Dodaj regułę słów
          </button>
        </div>
      </div>

      {busy && <p className="text-sm text-muted">⏳ Zapisywanie…</p>}
      {err && <p className="text-sm text-accent">⚠️ {err}</p>}
    </div>
  );
}
