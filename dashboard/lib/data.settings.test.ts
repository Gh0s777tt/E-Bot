// Rygiel parsera ustawień powiadomień LIVE (settingsFromMap) — mapa klucz→wartość (tabela settings) →
// typowany obiekt Settings. KLUCZ: bool TYLKO '1'/'true' → true (inne/puste → false); brak klucza →
// DOMYŚLNA wartość pola, a domyślne RÓŻNIĄ się (twitch/kick/rumble ON, youtube OFF). Regresja = błędne
// domyślne przełączniki platform (np. ciche włączenie YouTube albo wyłączenie Twitcha).
import { describe, expect, it } from 'vitest';
import { settingsFromMap } from './data';

describe('settingsFromMap — ustawienia powiadomień LIVE', () => {
  it('pusta mapa → domyślne: twitch/kick/rumble ON, youtube OFF', () => {
    const s = settingsFromMap(new Map());
    expect(s.notify_enabled_twitch).toBe(true);
    expect(s.notify_enabled_kick).toBe(true);
    expect(s.notify_enabled_rumble).toBe(true);
    expect(s.notify_enabled_youtube).toBe(false);
  });

  it("RYGIEL koercji bool: tylko '1'/'true' → true, reszta → false", () => {
    expect(settingsFromMap(new Map([['notify_enabled_youtube', '1']])).notify_enabled_youtube).toBe(
      true,
    );
    expect(
      settingsFromMap(new Map([['notify_enabled_youtube', 'true']])).notify_enabled_youtube,
    ).toBe(true);
    for (const v of ['0', 'false', '', 'yes', 'TRUE']) {
      expect(settingsFromMap(new Map([['notify_enabled_twitch', v]])).notify_enabled_twitch).toBe(
        false,
      );
    }
  });

  it('stringi: brak → domyślny, obecny → wartość', () => {
    expect(settingsFromMap(new Map()).notify_message).toContain('{streamer}');
    expect(settingsFromMap(new Map([['notify_channel_id', '123']])).notify_channel_id).toBe('123');
  });
});
