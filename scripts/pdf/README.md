# 📄 Źródła PDF (E-BOT)

Źródła HTML dwóch dokumentów PDF (motyw marki, ze zrzutami z `dashboard/public/screens`):

- [`streamers.html`](streamers.html) → `docs/pdf/E-BOT-dla-streamerow.pdf`
- [`developers.html`](developers.html) → `docs/pdf/E-BOT-dla-developerow.pdf`
- [`full.html`](full.html) → `docs/pdf/E-BOT-funkcje-A-Z.pdf` — **pełna dokumentacja A→Z** (wszystkie komendy + moduły). **Generowana** ze źródła: `node scripts/pdf/gen-full-pdf.mjs` (z `dashboard/lib/wikiData.ts`) — nie edytuj `full.html` ręcznie.

## Render do PDF

Dokumenty są stylowane pod A4 (`@page`, `printBackground`). Wygeneruj PDF dowolnie:

- **Przeglądarka:** otwórz `*.html` → drukuj → „Zapisz jako PDF" (rozmiar A4, włącz „Grafika tła").
- **Headless Chromium (Playwright):**
  ```js
  const { chromium } = require('playwright'); // lub playwright-core + channel: 'msedge'
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file:///<ścieżka>/scripts/pdf/streamers.html', { waitUntil: 'load' });
  await p.pdf({ path: 'docs/pdf/E-BOT-dla-streamerow.pdf', format: 'A4', printBackground: true });
  await b.close();
  ```

Zrzuty są wspólne z landingiem i `/wiki` — aby je odświeżyć, zaktualizuj pliki w `dashboard/public/screens/`.
