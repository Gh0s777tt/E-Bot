// Czysty serializer CSV (RFC 4180-ish) — wspólny dla eksportów (/audit, /stats). Pole z przecinkiem,
// cudzysłowem lub nową linią jest cytowane, a wewnętrzne cudzysłowy podwajane. Separator wierszy CRLF.
function esc(v: string | number | null | undefined): string {
  const s = v == null ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const head = headers.map(esc).join(',');
  if (rows.length === 0) return head;
  const body = rows.map((r) => r.map(esc).join(',')).join('\r\n');
  return `${head}\r\n${body}`;
}

// Nagłówki odpowiedzi do pobrania pliku CSV (z BOM, by Excel poprawnie czytał UTF-8).
export function csvResponse(csv: string, filename: string): Response {
  return new Response(`﻿${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
