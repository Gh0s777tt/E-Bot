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

// ── DEFEKT #2 (Średni, analityka) — NAPRAWIONY (#619): percentileRank wyklucza własny serwer z próbki
// i używa midrank. Wcześniej self-in-sample + ostre `<` → lider nigdy 100%, remis 0%.
describe('QA#2 percentileRank — serwer w średniej / lider w próbce (regresja #619)', () => {
  it('serwer równy wszystkim dostaje ~50% (midrank), nie 0%', () => {
    expect(percentileRank(100, [100, 100, 100])).toBeGreaterThanOrEqual(50);
  });
  it('najaktywniejszy serwer (w próbce) osiąga 100%', () => {
    expect(percentileRank(500, [10, 20, 30, 500])).toBe(100);
  });
});

// ── DEFEKT #3 (Średni) — NAPRAWIONY (#620): buildEmbed wymusza całkowity limit 6000 (skraca description,
// potem usuwa pola od końca). Wcześniej embed z maks. polami = 38400 znaków → Discord 400.
describe('QA#3 buildEmbed — całkowity limit 6000 znaków (regresja #620)', () => {
  const long = (n: number) => 'A'.repeat(n);
  const total = (e: ReturnType<typeof buildEmbed>) =>
    (e.title?.length ?? 0) +
    (e.description?.length ?? 0) +
    (e.author?.name.length ?? 0) +
    (e.footer?.text.length ?? 0) +
    (e.fields ?? []).reduce((s, f) => s + f.name.length + f.value.length, 0);
  it('suma maksymalnego embeda jest schodzona do ≤ 6000', () => {
    const fields = Array.from({ length: 25 }, () => ({ name: long(256), value: long(1024) }));
    const e = buildEmbed(
      { title: long(256), description: long(4096), footerText: long(2048), fields },
      {},
    );
    expect(total(e)).toBeLessThanOrEqual(6000);
  });
  it('kontrola: mały embed pozostaje nietknięty', () => {
    const e = buildEmbed({ title: 'Hej', description: 'krótki opis' }, {});
    expect(e.title).toBe('Hej');
    expect(e.description).toBe('krótki opis');
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
