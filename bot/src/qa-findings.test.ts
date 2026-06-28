// QA — testy regresyjne odsłaniające DEFEKTY znalezione podczas przeglądu (patrz TEST_REPORT.md).
// Każdy `it.fails` PADA na obecnym kodzie (dokumentuje buga) → cały zestaw pozostaje ZIELONY, a po
// naprawie kodu produkcyjnego `it.fails` zacznie alarmować ("expected to fail but passed"), wymuszając
// zdjęcie znacznika. Kontrole pozytywne (zwykłe `it`) dowodzą, że defekt jest specyficzny dla brzegu,
// a nie tautologią. ZASADA: nie ruszamy kodu aplikacji — czerwone tu = znalezisko do triażu.
import { describe, expect, it } from 'vitest';
import { percentileRank } from './analytics/digest.mts';
import { normalizeText } from './automod.mts';
import { scanScam } from './lib/contentScan.mts';
import { formatDuration, parseDuration } from './lib/duration.mts';
import { buildEmbed } from './lib/richMessage.mts';

// ── DEFEKT #1 (Wysoki, bezpieczeństwo) — NAPRAWIONY (#618): hostOf używa teraz toLowerCase().startsWith.
// Regresja: schemat URL jest case-insensitive (RFC 3986), więc HTTP:// / HtTp:// muszą być wykrywane
// tak samo jak http://. Wcześniej dawały hostname "http" i omijały wszystkie reguły hostowe.
describe('QA#1 scanScam — schemat URL wielkimi literami (regresja #618)', () => {
  it('kontrola: wykrywa podrabiany Discord przy małym http://', () => {
    expect(scanScam('http://discord-nitro.com/claim')).toMatch(/scam/);
  });
  it('ten sam scam przy HTTP:// jest wykryty', () => {
    expect(scanScam('HTTP://discord-nitro.com/claim')).toMatch(/scam/);
  });
  it('mieszana wielkość (HtTp) też jest wykryta', () => {
    expect(scanScam('HtTp://disc0rd-login.ru')).toMatch(/scam/);
  });
});

// ── DEFEKT #2 (Średni, analityka): percentileRank zaniża pozycję serwera. benchSample zawiera WŁASNY
// serwer (digest.mts:166), a porównanie to ostre `<` → serwer równy wszystkim dostaje 0% ("aktywniejszy
// niż 0%"), lider w próbce nigdy nie osiąga 100%. Komunikat dla użytkownika jest systematycznie mylący.
describe('QA#2 percentileRank — serwer w średniej / lider w próbce', () => {
  it('kontrola: serwer powyżej części próbki ma sensowny percentyl', () => {
    expect(percentileRank(100, [10, 20, 30, 40, 100])).toBe(80);
  });
  it.fails('DEFEKT: serwer równy wszystkim nie powinien dostać 0%', () => {
    // 3 identyczne serwery (każdy 100 wiad.); każdy widziałby „aktywniejszy niż 0%" — sprzeczność.
    expect(percentileRank(100, [100, 100, 100])).toBeGreaterThan(0);
  });
  it.fails('DEFEKT: najaktywniejszy serwer (w próbce) powinien móc osiągnąć ~100%', () => {
    expect(percentileRank(500, [10, 20, 30, 500])).toBeGreaterThanOrEqual(99);
  });
});

// ── DEFEKT #3 (Średni): buildEmbed pilnuje limitów per-pole, ale NIE całkowitego limitu 6000 znaków
// embeda. Embed z maksymalnymi polami (256+4096+2048+25×(256+1024)=38400) przechodzi bez zmian →
// Discord odrzuca CAŁĄ wiadomość (HTTP 400). Komentarz w richMessage.limits.test.ts wymienia 6000.
describe('QA#3 buildEmbed — całkowity limit 6000 znaków', () => {
  const long = (n: number) => 'A'.repeat(n);
  it.fails('DEFEKT: suma title+description+footer+25 pól nie powinna przekroczyć 6000', () => {
    const fields = Array.from({ length: 25 }, () => ({ name: long(256), value: long(1024) }));
    const e = buildEmbed(
      { title: long(256), description: long(4096), footerText: long(2048), fields },
      {},
    );
    const total =
      (e.title?.length ?? 0) +
      (e.description?.length ?? 0) +
      (e.footer?.text.length ?? 0) +
      (e.fields ?? []).reduce((s, f) => s + f.name.length + f.value.length, 0);
    expect(total).toBeLessThanOrEqual(6000);
  });
});

// ── DEFEKT #4 (Średni): normalizeText neutralizuje leet/diakrytyki/zero-width, ale NIE separatory
// (spacja/kropka/myślnik). Dopasowanie zakazanych słów to includes(normalizeText(word)), więc
// "s p a m" / "s.p.a.m" omijają filtr — klasyczny bypass. (Naprawa wymaga ostrożności: ryzyko FP.)
describe('QA#4 normalizeText — separatory między literami', () => {
  it('kontrola: leet nadal neutralizowany', () => {
    expect(normalizeText('5p4m')).toBe('spam');
  });
  it.fails('DEFEKT: litery rozdzielone spacją powinny zostać scalone', () => {
    expect(normalizeText('s p a m')).toBe('spam');
  });
  it.fails('DEFEKT: litery rozdzielone kropką powinny zostać scalone', () => {
    expect(normalizeText('s.p.a.m')).toBe('spam');
  });
});

// ── DEFEKT #5 (Niski): formatDuration dla wartości ujemnej produkuje śmieciowy tekst ("-1d -1h"),
// bo Math.floor + reszta modulo w JS dają każdy człon ujemny. Ekspozycja zależy od callerów podających
// (deadline - now) po terminie.
describe('QA#5 formatDuration — wartości ujemne', () => {
  it('kontrola: dodatni czas formatuje się poprawnie', () => {
    expect(formatDuration(5_400_000)).toBe('1h 30m');
  });
  it.fails('DEFEKT: ujemny czas nie powinien dać "-1d -1h ..."', () => {
    expect(formatDuration(-3_600_000)).not.toMatch(/-\d+d\s+-\d+h/);
  });
});

// ── DEFEKT #6 (Niski): parseDuration ignoruje znak minus (regex \d+ nie łapie "-"), więc "-5m" → 5 min
// dodatnie zamiast null. Dla komend moderacyjnych (timeout/mute) ujemne wejście powinno być odrzucone.
describe('QA#6 parseDuration — wartość ujemna', () => {
  it('kontrola: poprawny dodatni czas parsuje się', () => {
    expect(parseDuration('5m')).toBe(300_000);
  });
  it.fails('DEFEKT: "-5m" nie powinno dać dodatnich 5 minut', () => {
    expect(parseDuration('-5m')).not.toBe(300_000);
  });
});
