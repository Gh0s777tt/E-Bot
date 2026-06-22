// Rygiel logów serwera (cfgFor · trunc). cfgFor: merge configu `{...DEFAULT, ...zapisane}` — częściowy
// config nie może gubić domyślnych przełączników zdarzeń (fail-safe na uszkodzony JSON). trunc: przycina
// pole embeda do limitu (długie opisy nie wywalą limitu Discorda). Cache 30 s → unikalny guildId/test.
// Config per-serwer z realnego SQLite (DATABASE_PATH).
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { setSettingLocal } from '../lib/db.mts';
import { cfgFor, trunc } from './serverlog.mts';

const DB = path.join(tmpdir(), `ebot-serverlog-${process.pid}.db`);

beforeAll(() => {
  process.env.DATABASE_PATH = DB;
  if (existsSync(DB)) rmSync(DB);
});
afterAll(() => {
  if (existsSync(DB)) rmSync(DB);
  delete process.env.DATABASE_PATH;
});

describe('trunc — przycinanie pola embeda', () => {
  it('krótszy/równy n → bez zmian', () => {
    expect(trunc('abc', 5)).toBe('abc');
    expect(trunc('abcde', 5)).toBe('abcde'); // dokładnie n
  });

  it('RYGIEL granicy: n+1 → przycięte n znaków + „…"', () => {
    expect(trunc('abcdef', 5)).toBe('abcde…');
  });

  it('domyślny limit 500', () => {
    expect(trunc('x'.repeat(500))).toBe('x'.repeat(500));
    expect(trunc('x'.repeat(501))).toBe(`${'x'.repeat(500)}…`);
  });
});

describe('cfgFor — config logowania per-serwer (unikalny guildId/test omija cache 30 s)', () => {
  it('brak configu → DEFAULT (enabled false, messages/moderation true, voice false)', () => {
    setSettingLocal('logging_config', '');
    const c = cfgFor('G-default');
    expect(c.enabled).toBe(false);
    expect(c.messages).toBe(true);
    expect(c.voice).toBe(false);
  });

  it('RYGIEL merge: częściowy config zachowuje domyślne przełączniki', () => {
    setSettingLocal('logging_config', JSON.stringify({ enabled: true, channelId: 'C' }));
    const c = cfgFor('G-partial');
    expect(c.enabled).toBe(true);
    expect(c.channelId).toBe('C');
    expect(c.messages).toBe(true); // default zachowany
    expect(c.moderation).toBe(true);
    expect(c.voice).toBe(false);
  });

  it('uszkodzony JSON → DEFAULT (fail-safe, nie rzuca)', () => {
    setSettingLocal('logging_config', '{nie-json');
    expect(() => cfgFor('G-bad')).not.toThrow();
    expect(cfgFor('G-bad2')).toMatchObject({ enabled: false, messages: true });
  });
});
