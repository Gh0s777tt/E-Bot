// Rygiel linku zaproszenia bota (botInviteUrl) — OAuth2 „Add to Server". Buduje URL z env.
// KLUCZ: brak DISCORD_CLIENT_ID → pusty string (panel nie pokaże zepsutego linku „dodaj bota");
// scope ZAWSZE { bot, applications.commands } (inaczej komendy slash się nie zarejestrują);
// permissions domyślnie 8 (Administrator) spójnie z onboardingiem. Env sterowany z przywróceniem.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { botInviteUrl } from './invite';

const KEYS = ['DISCORD_CLIENT_ID', 'DISCORD_BOT_PERMISSIONS'] as const;
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of KEYS) saved[k] = process.env[k];
  for (const k of KEYS) delete process.env[k];
});
afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe('botInviteUrl — link OAuth „dodaj bota"', () => {
  it('brak DISCORD_CLIENT_ID → pusty string (nie zepsuty link)', () => {
    expect(botInviteUrl()).toBe('');
  });

  it('z clientId: poprawny endpoint + client_id + scope', () => {
    process.env.DISCORD_CLIENT_ID = '123456';
    const u = new URL(botInviteUrl());
    expect(`${u.origin}${u.pathname}`).toBe('https://discord.com/oauth2/authorize');
    expect(u.searchParams.get('client_id')).toBe('123456');
    expect(u.searchParams.get('scope')).toBe('bot applications.commands');
  });

  it('RYGIEL scope: zawsze bot + applications.commands (slash-komendy)', () => {
    process.env.DISCORD_CLIENT_ID = '1';
    const scope = new URL(botInviteUrl()).searchParams.get('scope') ?? '';
    expect(scope.split(' ')).toEqual(expect.arrayContaining(['bot', 'applications.commands']));
  });

  it('RYGIEL permissions domyślnie 8 (Administrator) gdy brak env', () => {
    process.env.DISCORD_CLIENT_ID = '1';
    expect(new URL(botInviteUrl()).searchParams.get('permissions')).toBe('8');
  });

  it('permissions z env honorowane + przycięte (least-privilege bitfield)', () => {
    process.env.DISCORD_CLIENT_ID = '1';
    process.env.DISCORD_BOT_PERMISSIONS = '  274877990928  ';
    expect(new URL(botInviteUrl()).searchParams.get('permissions')).toBe('274877990928');
  });
});
