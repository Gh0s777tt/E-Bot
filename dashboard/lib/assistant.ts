// Etap K — asystent AI panelu. Użytkownik opisuje, czego chce dla serwera; model rozpisuje plan
// krok-po-kroku ze WSKAZANIEM konkretnych stron panelu (href). Używa tych samych kluczy co bot
// (DEEPSEEK_API_KEY / OPENAI_API_KEY). Graceful: bez klucza zwraca podpowiedź, nie błąd.

export type AssistantStep = { title: string; detail: string; href: string | null };
export type AssistantReply = {
  ok: boolean;
  summary: string;
  steps: AssistantStep[];
  error?: string;
};

// Katalog funkcji panelu dla modelu (href — nazwa: po co). Trzymany blisko nawigacji, żeby model
// kierował do właściwych stron.
const FEATURES: { href: string; line: string }[] = [
  { href: '/setup', line: 'Kreator startowy — szybka podstawowa konfiguracja serwera od zera' },
  { href: '/modules', line: 'Centrum sterowania — włączanie/wyłączanie modułów bota' },
  {
    href: '/security',
    line: 'Bezpieczeństwo — Anti-Nuke (ochrona przed masowym usuwaniem) + weryfikacja nowych',
  },
  {
    href: '/moderation',
    line: 'Automod — filtry spamu/scamu/linków, kary, eskalacja, natywny AutoMod Discorda',
  },
  {
    href: '/logging',
    line: 'Logi serwera — zapis zdarzeń (edycje, usunięcia, wejścia/wyjścia, role)',
  },
  { href: '/tickets', line: 'Tickety — prywatne kanały zgłoszeń z formularzem i transkryptem' },
  { href: '/modmail', line: 'Modmail — DM do bota → wątek obsługi; apelacje banów' },
  {
    href: '/applications',
    line: 'Aplikacje/rekrutacja — formularze zgłoszeń z akceptacją/odrzuceniem',
  },
  {
    href: '/ai',
    line: 'AI — konfiguracja asystenta (model, limity, persona) dla /ai /ask /tldr /imagine',
  },
  { href: '/welcome', line: 'Powitania — wiadomości i obrazki powitalne + autorole na wejściu' },
  { href: '/levels', line: 'Poziomy & XP — nagrody za aktywność, role za poziom, karty rangi' },
  { href: '/leaderboard', line: 'Ranking — tablica najaktywniejszych (XP)' },
  { href: '/roles', line: 'Role — reaction-role, przyciski i menu samodzielnego wyboru ról' },
  { href: '/engagement', line: 'Engagement — starboard, giveawaye, przypomnienia' },
  {
    href: '/suggestions',
    line: 'Sugestie — pomysły społeczności z głosowaniem i decyzją moderacji',
  },
  {
    href: '/responder',
    line: 'Komendy własne & autoresponder — własne komendy i odpowiedzi na słowa-klucze',
  },
  { href: '/birthdays', line: 'Urodziny — życzenia w dniu urodzin członka' },
  { href: '/counters', line: 'Liczniki — statystyki serwera w nazwach kanałów' },
  { href: '/automations', line: 'Automatyzacje — reguły „jeśli X to Y" na zdarzenia serwera' },
  { href: '/eco', line: 'Ekonomia serwera — waluta, praca, sklep, hazard, giełda, pety, karty' },
  {
    href: '/notifications',
    line: 'Powiadomienia live — alerty o streamach (Twitch/Kick/YouTube/Rumble)',
  },
  {
    href: '/creator',
    line: 'Twórca — powiadomienia o nowych postach (RSS/social), sync harmonogramu Twitch',
  },
  { href: '/scheduled', line: 'Zaplanowane posty — cykliczne ogłoszenia o ustalonej porze' },
  {
    href: '/donations',
    line: 'Donejty — sposoby wsparcia (Ko-fi/PayPal/Patreon) i ogłoszenia wpłat',
  },
  { href: '/library', line: 'Biblioteka gier — kolekcja Steam/IGDB w stylu Netflix' },
  { href: '/gaming', line: 'Gaming feed — patch notes i darmowe gry (Epic/Steam/GOG)' },
  { href: '/appearance', line: 'Wygląd grafik — motyw, kolory, style kart rang/profilu' },
  { href: '/commands', line: 'Komendy — pełna lista slash-komend bota' },
  {
    href: '/custom-commands',
    line: 'Własne komendy — edytor slash-komend bez kodu (embedy, role, akcje)',
  },
  {
    href: '/integrations',
    line: 'Integracje — KLUCZE API (Twitch, YouTube, AI, Supabase, Stripe) i ich status',
  },
  { href: '/wishlist', line: 'Lista życzeń gier — dodawanie gier do śledzenia cen i okładek' },
  {
    href: '/stats',
    line: 'Statystyki — wykresy aktywności, retencja D1/D7/D30, ranking, eksport CSV',
  },
  {
    href: '/marketplace',
    line: 'Marketplace pluginów — instalacja i zarządzanie rozszerzeniami społeczności',
  },
  { href: '/audit', line: 'Dziennik audytu — historia zmian w panelu (kto co zmienił)' },
  { href: '/settings', line: 'Ustawienia — język bota, dostęp do panelu, kopia konfiguracji' },
];

const SYSTEM = `Jesteś asystentem konfiguracji bota Discord "E-Bot" w panelu webowym.
Użytkownik opisuje, czego chce dla swojego serwera. Rozpisz KONKRETNY plan krok po kroku,
wskazując dokładne strony panelu (po ścieżce href) i co tam ustawić oraz jakie uprawnienia
nadać botowi i dlaczego.

Dostępne strony panelu (href — opis):
${FEATURES.map((f) => `${f.href} — ${f.line}`).join('\n')}

ZASADY:
- Odpowiadaj w TYM SAMYM JĘZYKU co prośba użytkownika.
- Zwróć WYŁĄCZNIE poprawny JSON, bez markdown, w formacie:
  {"summary":"krótkie podsumowanie planu","steps":[{"title":"co zrobić","detail":"jak dokładnie + jakie uprawnienia i dlaczego","href":"/security"}]}
- "href" MUSI być jedną z powyższych ścieżek albo null (gdy krok nie dotyczy konkretnej strony).
- Maksymalnie 8 kroków. Bądź konkretny i praktyczny.
- Jeśli funkcja wymaga klucza API lub bazy → dodaj krok kierujący na /integrations.
- Kolejność kroków sensowna (najpierw fundamenty: setup/bezpieczeństwo, potem reszta).`;

export function parseReply(raw: string): { summary: string; steps: AssistantStep[] } {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
  try {
    const j = JSON.parse(cleaned) as { summary?: string; steps?: AssistantStep[] };
    const valid = new Set(FEATURES.map((f) => f.href));
    const steps = (Array.isArray(j.steps) ? j.steps : []).slice(0, 8).map((s) => ({
      title: String(s.title ?? '').slice(0, 160),
      detail: String(s.detail ?? '').slice(0, 600),
      href: s.href && valid.has(s.href) ? s.href : null,
    }));
    return { summary: String(j.summary ?? '').slice(0, 600), steps };
  } catch {
    // Model nie zwrócił czystego JSON — pokaż surowy tekst jako podsumowanie.
    return { summary: cleaned.slice(0, 1500), steps: [] };
  }
}

export async function askAssistant(prompt: string): Promise<AssistantReply> {
  const q = prompt.trim().slice(0, 1000);
  if (!q) return { ok: false, summary: '', steps: [], error: 'empty' };

  const deepseek = process.env.DEEPSEEK_API_KEY;
  const openai = process.env.OPENAI_API_KEY;
  const useOpenai = !deepseek && !!openai;
  const key = deepseek || openai;
  if (!key) {
    return {
      ok: false,
      summary: '',
      steps: [],
      error: 'nokey',
    };
  }

  const url = useOpenai
    ? 'https://api.openai.com/v1/chat/completions'
    : 'https://api.deepseek.com/chat/completions';
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: useOpenai ? 'gpt-4o-mini' : 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: q },
        ],
        max_tokens: 1200,
        temperature: 0.4,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    const d = (await r.json().catch(() => ({}))) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };
    if (!r.ok)
      return { ok: false, summary: '', steps: [], error: d.error?.message || `HTTP ${r.status}` };
    const text = d.choices?.[0]?.message?.content ?? '';
    const parsed = parseReply(text);
    return { ok: true, ...parsed };
  } catch (e) {
    return { ok: false, summary: '', steps: [], error: (e as Error).message };
  }
}
