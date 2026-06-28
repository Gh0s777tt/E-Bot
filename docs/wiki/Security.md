# 🔐 Bezpieczeństwo

> Pełna polityka: [`.github/SECURITY.md`](https://github.com/Gh0s777tt/E-Bot/blob/main/.github/SECURITY.md)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🛡️ Warstwy ochrony repo

| Warstwa | Mechanizm | Status |
|:--|:--|:--:|
| 🔒 Dostęp | Repo **prywatne** — tylko właściciel | ✅ |
| 🌿 Integralność historii | Branch protection na `main` (blokada force‑push + usunięcia) | ✅ |
| 🕵️ Skan kodu | **CodeQL** (`security-and-quality`) — push/PR + cron | ✅ |
| 📦 Zależności | **Dependabot** — alerty + auto‑fix + cotygodniowe PR | ✅ |
| 👤 Własność | **CODEOWNERS** dla krytycznych ścieżek | ✅ |
| 🔑 Sekrety | Secret scanning + push protection (wymaga GH Advanced Security) | ⚠️ plan |
| 🧪 Lokalnie | `git grep` przed każdym pushem + GitGuardian | ✅ |

## 🔑 Zasady dot. sekretów

- Sekrety **wyłącznie** w `.env` / `dashboard/.env.local` (oba **gitignored**) lub w **Vercel env**.
- W repo tylko `.env.example` z pustymi kluczami.
- Każdy push poprzedzony skanem wzorców (`ghp_`, `sb_secret_`, tokeny Discord…).
- Plan rotacji: `docs/SECRETS.md`.

## 🚨 Zgłaszanie podatności

Nie otwieraj publicznego issue. Użyj **GitHub → Security → Report a vulnerability**
(Private Vulnerability Reporting) lub skontaktuj się z właścicielem.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<div align="center"><sub>🛡️ E-Forge — bezpieczeństwo best‑effort, projekt prywatny.</sub></div>
