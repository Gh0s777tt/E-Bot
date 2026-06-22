// Rygiel budowy opcji komend no-code (buildCommandOptions) — format Discord API. Refactor
// behavior-preserving: logika opcji wyjęta z saveCustomCommands do czystej funkcji (bez Discorda).
// KLUCZ: Discord WYMAGA opcji wymaganych PRZED opcjonalnymi — rozjazd kolejności = API odrzuca CAŁĄ
// rejestrację /custom-command. Plus kap 25, filtr bezimiennych, opis fallbackuje na nazwę.
import { describe, expect, it } from 'vitest';
import { buildCommandOptions, type CommandOption } from './customCommands';

const opt = (name: string, required = false, description = ''): CommandOption => ({
  name,
  description,
  required,
});

describe('buildCommandOptions — opcje slash-komendy dla Discord API', () => {
  it('pusta / undefined lista → []', () => {
    expect(buildCommandOptions(undefined)).toEqual([]);
    expect(buildCommandOptions([])).toEqual([]);
  });

  it('RYGIEL kolejności: wymagane PRZED opcjonalnymi (Discord odrzuca odwrotną)', () => {
    const out = buildCommandOptions([opt('a'), opt('b', true), opt('c'), opt('d', true)]);
    expect(out.map((o) => o.required)).toEqual([true, true, false, false]);
  });

  it('typ STRING (3), opis fallbackuje na nazwę, required koercjonowane', () => {
    const [o] = buildCommandOptions([opt('kto', true)]);
    expect(o.type).toBe(3);
    expect(o.name).toBe('kto');
    expect(o.description).toBe('kto'); // pusty opis → nazwa
    expect(o.required).toBe(true);
  });

  it('opis zachowany gdy podany', () => {
    expect(buildCommandOptions([opt('x', false, 'Opis X')])[0].description).toBe('Opis X');
  });

  it('filtruje opcje bez nazwy', () => {
    const out = buildCommandOptions([opt(''), opt('ok'), opt('')]);
    expect(out).toHaveLength(1);
    expect(out[0].name).toBe('ok');
  });

  it('RYGIEL kapu 25 opcji', () => {
    const many = Array.from({ length: 30 }, (_, i) => opt(`o${i}`));
    expect(buildCommandOptions(many)).toHaveLength(25);
  });
});
