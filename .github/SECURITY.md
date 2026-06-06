# 🔐 Polityka bezpieczeństwa — E‑BOT

## Ochrona repozytorium

To repozytorium jest **prywatne i proprietarne** (patrz [`LICENSE`](../LICENSE)). Stosujemy:

| Warstwa | Mechanizm |
|:--|:--|
| 🔒 Dostęp | Repo prywatne — tylko właściciel/zaproszeni |
| 🌿 Integralność historii | Branch protection na `main` (blokada force‑push i usunięcia) |
| 🕵️ Skan kodu | **CodeQL** (`security-and-quality`) — push/PR + harmonogram |
| 📦 Zależności | **Dependabot** (alerty + cotygodniowe PR) |
| 🔑 Sekrety | **Secret scanning + push protection** (blokuje commit sekretu) |
| 👤 Własność | **CODEOWNERS** — wymagany reviewer dla krytycznych ścieżek |
| 🧪 Lokalnie | Snyk (zależności) + GitGuardian (sekrety) — patrz `docs/SECRETS.md` |

## Zasady dot. sekretów

- Sekrety **wyłącznie** w `.env` / `dashboard/.env.local` (oba **gitignored**) lub w **Vercel env**.
- W repo: tylko `.env.example` z pustymi kluczami.
- Każdy commit przechodzi skan (`git grep` przed pushem + secret‑scanning po stronie GitHub).
- Plan rotacji kluczy: `docs/SECRETS.md`.

## Zgłaszanie podatności

Nie otwieraj publicznego issue dla podatności. Skorzystaj z **GitHub → Security → Report a vulnerability**
(Private Vulnerability Reporting) albo skontaktuj się bezpośrednio z właścicielem.

> Czas reakcji: best‑effort. To projekt prywatny GH0ST EMPIRE.
