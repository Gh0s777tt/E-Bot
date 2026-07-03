import { describe, expect, it } from 'vitest';
import { moduleConfigured } from './moduleState';

describe('moduleConfigured — heurystyka „czy skonfigurowany" (kokpit B2)', () => {
  it("moduł 'bool' zawsze configured (to zwykły włącznik)", () => {
    expect(moduleConfigured('bool', 'enabled', null)).toBe(true);
    expect(moduleConfigured('bool', 'enabled', 'true')).toBe(true);
  });

  it("'json' bez zapisu → nieskonfigurowany", () => {
    expect(moduleConfigured('json', 'enabled', null)).toBe(false);
  });

  it("'json' tylko z flagą enabled → NIEskonfigurowany (świeżo przełączony)", () => {
    expect(moduleConfigured('json', 'enabled', '{"enabled":true}')).toBe(false);
  });

  it("'json' z ustawieniami poza flagą → skonfigurowany", () => {
    expect(moduleConfigured('json', 'enabled', '{"enabled":true,"channelId":"123"}')).toBe(true);
    expect(moduleConfigured('json', 'enabled', '{"channelId":"123"}')).toBe(true);
  });

  it('respektuje własną ścieżkę flagi (path)', () => {
    // creatorEvent: path='autoEvent' — {autoEvent:true} sam w sobie to nie konfiguracja
    expect(moduleConfigured('json', 'autoEvent', '{"autoEvent":true}')).toBe(false);
    expect(moduleConfigured('json', 'autoEvent', '{"autoEvent":true,"channelId":"1"}')).toBe(true);
  });

  it('niepoprawny JSON → nieskonfigurowany (bez wyjątku)', () => {
    expect(moduleConfigured('json', 'enabled', '{zepsuty')).toBe(false);
  });
});
