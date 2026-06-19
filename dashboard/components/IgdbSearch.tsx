'use client';

import { useEffect, useRef, useState } from 'react';

export type IgdbResult = {
  igdb_id: number;
  name: string;
  year: number | null;
  genres: string[];
  cover_url: string | null;
  summary: string | null;
};

const inputCls =
  'w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm outline-none focus:border-accent';

export default function IgdbSearch({
  onPick,
  placeholder,
}: {
  onPick: (r: IgdbResult) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<IgdbResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/igdb/search?q=${encodeURIComponent(q)}`);
        const j = (await r.json()) as { results?: IgdbResult[] };
        setResults(Array.isArray(j.results) ? j.results : []);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  return (
    <div className="space-y-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder ?? 'Szukaj gry w IGDB…'}
        className={inputCls}
      />
      {loading && <p className="text-xs text-muted">Szukam…</p>}
      {results.length > 0 && (
        <div className="max-h-72 space-y-1 overflow-y-auto rounded-md border border-line bg-elevated p-2">
          {results.map((r) => (
            <button
              key={r.igdb_id}
              type="button"
              onClick={() => {
                onPick(r);
                setQ('');
                setResults([]);
              }}
              className="flex w-full items-center gap-3 rounded-md p-2 text-start text-sm transition hover:bg-card"
            >
              {r.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.cover_url} alt="" className="h-12 w-9 rounded object-cover" />
              ) : (
                <div className="h-12 w-9 rounded bg-line" />
              )}
              <span>
                <span className="font-semibold">{r.name}</span>
                {r.year ? <span className="text-muted"> · {r.year}</span> : null}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
