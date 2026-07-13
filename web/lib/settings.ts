import { existsSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { sbSelect, sbUpsert, supabaseEnabled } from './supabase';

function dbPath(): string {
  if (process.env.DATABASE_PATH) return process.env.DATABASE_PATH;
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, '..', 'data', 'bot.db'),
    path.join(cwd, 'data', 'bot.db'),
    path.join(cwd, '..', '..', 'data', 'bot.db'),
  ];
  return candidates.find((p) => existsSync(p)) ?? candidates[0];
}

export type Settings = {
  notify_channel_id: string;
  notify_mention: string;
  notify_enabled_twitch: boolean;
  notify_enabled_kick: boolean;
  notify_enabled_rumble: boolean;
  notify_enabled_youtube: boolean;
};

const DEFAULTS: Settings = {
  notify_channel_id: '',
  notify_mention: '',
  notify_enabled_twitch: true,
  notify_enabled_kick: true,
  notify_enabled_rumble: true,
  notify_enabled_youtube: false,
};

function open(): DatabaseSync {
  const db = new DatabaseSync(dbPath());
  db.exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)');
  return db;
}

const truthy = (v: string | undefined, def: boolean): boolean =>
  v === undefined ? def : v === '1' || v === 'true';

// Wspólne mapowanie par key/value → Settings (dla SQLite i Supabase).
function fromPairs(m: Map<string, string>): Settings {
  return {
    notify_channel_id: m.get('notify_channel_id') ?? DEFAULTS.notify_channel_id,
    notify_mention: m.get('notify_mention') ?? DEFAULTS.notify_mention,
    notify_enabled_twitch: truthy(m.get('notify_enabled_twitch'), DEFAULTS.notify_enabled_twitch),
    notify_enabled_kick: truthy(m.get('notify_enabled_kick'), DEFAULTS.notify_enabled_kick),
    notify_enabled_rumble: truthy(m.get('notify_enabled_rumble'), DEFAULTS.notify_enabled_rumble),
    notify_enabled_youtube: truthy(
      m.get('notify_enabled_youtube'),
      DEFAULTS.notify_enabled_youtube,
    ),
  };
}

export async function getSettings(): Promise<Settings> {
  // Produkcja: Supabase (współdzielone z botem); lokalny plik na Vercelu jest efemeryczny (audyt B-3).
  if (supabaseEnabled()) {
    try {
      const rows = await sbSelect<{ key: string; value: string }>('settings?select=key,value');
      return fromPairs(new Map(rows.map((r) => [r.key, r.value])));
    } catch {
      return { ...DEFAULTS };
    }
  }
  const db = open();
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all() as {
      key: string;
      value: string;
    }[];
    return fromPairs(new Map(rows.map((r) => [r.key, r.value])));
  } finally {
    db.close();
  }
}

export async function saveSettings(input: Record<string, string>): Promise<void> {
  const allowed = new Set(Object.keys(DEFAULTS));
  const pairs = Object.entries(input).filter(([k]) => allowed.has(k));
  if (!pairs.length) return;

  // Produkcja: zapis do Supabase (bot to odczyta); lokalny zapis na Vercelu i tak by zniknął (audyt B-3).
  if (supabaseEnabled()) {
    await sbUpsert(
      'settings',
      pairs.map(([key, value]) => ({ key, value: String(value) })),
      'key',
    );
    return;
  }
  const db = open();
  try {
    const stmt = db.prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    );
    for (const [k, v] of pairs) stmt.run(k, String(v));
  } finally {
    db.close();
  }
}
