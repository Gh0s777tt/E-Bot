// Tor 5 — logger strukturalny (JSON-lines), ZERO zależności (spójnie z cloud.mts/sentry.mts).
// Łatwy do filtrowania/parsowania na Railway. Poziom przez env LOG_LEVEL (debug|info|warn|error).
type Level = 'debug' | 'info' | 'warn' | 'error';
const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const MIN = LEVELS[(process.env.LOG_LEVEL as Level) ?? 'info'] ?? LEVELS.info;

type Fields = Record<string, unknown>;

function replacer(_k: string, v: unknown): unknown {
  return v instanceof Error ? { name: v.name, message: v.message, stack: v.stack } : v;
}

function emit(level: Level, msg: string, fields?: Fields): void {
  if (LEVELS[level] < MIN) return;
  const line = JSON.stringify({ t: new Date().toISOString(), level, msg, ...fields }, replacer);
  if (level === 'error' || level === 'warn') console.error(line);
  else console.log(line);
}

function make(base?: Fields) {
  const merge = (f?: Fields): Fields | undefined => (base ? { ...base, ...f } : f);
  return {
    debug: (msg: string, f?: Fields) => emit('debug', msg, merge(f)),
    info: (msg: string, f?: Fields) => emit('info', msg, merge(f)),
    warn: (msg: string, f?: Fields) => emit('warn', msg, merge(f)),
    error: (msg: string, f?: Fields) => emit('error', msg, merge(f)),
    child: (extra: Fields) => make({ ...base, ...extra }),
  };
}

export const log = make();
